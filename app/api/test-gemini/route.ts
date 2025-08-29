import { NextResponse } from "next/server"

const GEMINI_API_KEY = "AIzaSyAmJ37gnnNDdUtDahFakcNnNlZsk7Eb9Rw"

export async function GET() {
  try {
    // Test different Gemini API endpoints
    const testEndpoints = [
      {
        name: "Gemini 1.5 Flash",
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      },
      {
        name: "Gemini 1.5 Pro",
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`,
      },
      {
        name: "Gemini Pro",
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      },
    ]

    const results = []

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Hello! Please respond with 'API test successful' to confirm you're working.",
                  },
                ],
              },
            ],
          }),
        })

        const data = await response.json()

        results.push({
          endpoint: endpoint.name,
          status: response.status,
          success: response.ok,
          response: response.ok ? data.candidates?.[0]?.content?.parts?.[0]?.text : data,
          error: response.ok ? null : `HTTP ${response.status}`,
        })
      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          status: "ERROR",
          success: false,
          response: null,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      apiKey: GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 10)}...` : "Not provided",
      results,
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      apiKey: GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 10)}...` : "Not provided",
    })
  }
}
