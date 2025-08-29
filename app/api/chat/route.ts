import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = "AIzaSyAmJ37gnnNDdUtDahFakcNnNlZsk7Eb9Rw"

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 })
    }

    // Try multiple Gemini API endpoints and models
    const endpoints = [
      {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        model: "gemini-1.5-flash-latest",
      },
      {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`,
        model: "gemini-1.5-pro-latest",
      },
      {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        model: "gemini-pro",
      },
    ]

    let lastError = null

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying ${endpoint.model}...`)

        // Create AbortController with longer timeout (15 seconds)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are MEDIBOT, a friendly and empathetic AI health companion. You have a warm, caring personality similar to Character.AI chatbots. Your role is to:

1. Be conversational, friendly, and supportive
2. Use emojis and casual language to make patients feel comfortable
3. Analyze symptoms with medical knowledge
4. Provide health tips and recommendations
5. Determine if medical attention is needed
6. Be encouraging and positive while being medically responsible

Guidelines:
- Always be warm and empathetic
- Use emojis appropriately (but not excessively)
- Ask follow-up questions to better understand symptoms
- Provide clear, actionable advice
- If symptoms are serious, strongly recommend seeing a doctor
- Be conversational like you're talking to a friend who needs health advice

Patient's message: "${message}"

Respond as MEDIBOT with a caring, conversational tone. If this seems like a serious medical issue, recommend booking an appointment. Always be supportive and helpful.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        })

        // Clear timeout if request completes successfully
        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()

          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text

            // Enhanced severity detection
            const severityKeywords = {
              high: [
                "chest pain",
                "difficulty breathing",
                "severe headache",
                "high fever",
                "blood",
                "unconscious",
                "emergency",
                "can't breathe",
                "heart attack",
                "stroke",
                "severe pain",
                "bleeding",
                "suicide",
                "overdose",
                "poisoning",
                "severe allergic reaction",
                "anaphylaxis",
              ],
              medium: [
                "fever",
                "persistent cough",
                "severe pain",
                "vomiting",
                "dizziness",
                "infection",
                "migraine",
                "anxiety",
                "depression",
                "rash",
                "swelling",
                "nausea",
                "fatigue",
                "insomnia",
                "back pain",
                "joint pain",
              ],
              low: [
                "mild headache",
                "runny nose",
                "slight cough",
                "minor fatigue",
                "sore throat",
                "minor pain",
                "cold",
                "sneezing",
                "minor cut",
                "bruise",
                "muscle soreness",
              ],
            }

            let severity: "low" | "medium" | "high" = "low"
            const lowerMessage = message.toLowerCase()

            if (severityKeywords.high.some((keyword) => lowerMessage.includes(keyword))) {
              severity = "high"
            } else if (severityKeywords.medium.some((keyword) => lowerMessage.includes(keyword))) {
              severity = "medium"
            }

            return NextResponse.json({
              response: aiResponse,
              severity,
              appointmentNeeded: severity === "high" || severity === "medium",
            })
          }
        }

        const errorText = await response.text()
        lastError = `${endpoint.model}: ${response.status} - ${errorText}`
        console.error(`Failed with ${endpoint.model}:`, response.status, errorText)
      } catch (error) {
        if (error.name === 'AbortError') {
          lastError = `${endpoint.model}: Request timed out after 15 seconds`
          console.error(`Timeout with ${endpoint.model}:`, 'Request timed out')
        } else {
          lastError = `${endpoint.model}: ${error}`
          console.error(`Error with ${endpoint.model}:`, error)
        }
        continue
      }
    }

    // If all endpoints fail, provide intelligent fallback
    console.error("All Gemini endpoints failed:", lastError)

    return getIntelligentFallback(message)
  } catch (error) {
    console.error("Error in chat API:", error)
    return getIntelligentFallback("")
  }
}

function getIntelligentFallback(message: string): NextResponse {
  // Analyze message for basic symptom detection
  const lowerMessage = message.toLowerCase()

  const emergencyKeywords = [
    "chest pain",
    "can't breathe",
    "difficulty breathing",
    "severe pain",
    "blood",
    "unconscious",
  ]
  const commonSymptoms = ["headache", "fever", "cough", "tired", "fatigue", "stomach", "nausea", "dizzy"]

  let response = ""
  let severity: "low" | "medium" | "high" = "low"
  let appointmentNeeded = false

  if (emergencyKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    severity = "high"
    appointmentNeeded = true
    response = `🚨 I'm having some technical difficulties right now, but based on what you've described, this sounds like it could be serious and needs immediate medical attention. 

Please don't wait - contact a healthcare provider right away or call emergency services if this is urgent! Your health and safety are the top priority. 

If you can, try to get to a doctor or emergency room as soon as possible. Take care! 💙`
  } else if (commonSymptoms.some((keyword) => lowerMessage.includes(keyword))) {
    severity = "medium"
    appointmentNeeded = true
    response = `😔 I'm sorry, I'm having some technical issues right now and can't give you the detailed health advice you deserve. 

Based on what you've mentioned, it sounds like you might benefit from speaking with a healthcare professional who can properly assess your symptoms and provide appropriate care.

In the meantime, make sure to:
• Rest and stay hydrated 💧
• Monitor your symptoms
• Seek medical care if things get worse

Would you like me to help you book an appointment with one of our doctors? They'll be able to give you the proper medical attention you need! 🏥`
  } else {
    response = `Hi there! 👋 I'm so sorry, but I'm experiencing some technical difficulties right now and can't provide my usual detailed health guidance. 

I really want to help you with your health concerns, but my systems aren't working properly at the moment. 

For any health-related questions or concerns, I'd recommend:
• Consulting with a healthcare provider
• Calling your doctor's office
• Using a reliable medical resource
• If it's urgent, don't hesitate to seek immediate care

I should be back to normal soon! Thanks for your patience, and please take care of yourself! 💙`
  }

  return NextResponse.json({
    response,
    severity,
    appointmentNeeded,
  })
}
