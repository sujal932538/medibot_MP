import { Vonage } from '@vonage/server-sdk';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY || 'demo_key',
  apiSecret: process.env.VONAGE_API_SECRET || 'demo_secret',
  applicationId: process.env.VONAGE_APPLICATION_ID || 'demo_app_id',
  privateKey: process.env.VONAGE_PRIVATE_KEY || 'demo_private_key',
});

export interface VideoSession {
  sessionId: string;
  token: string;
  apiKey: string;
}

export async function createVideoSession(appointmentId: string): Promise<VideoSession> {
  try {
    // In production, use actual Vonage Video API
    // For demo, return mock session data
    return {
      sessionId: `session_${appointmentId}_${Date.now()}`,
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      apiKey: process.env.VONAGE_API_KEY || 'demo_api_key',
    };
  } catch (error) {
    console.error('Error creating video session:', error);
    throw new Error('Failed to create video session');
  }
}

export async function generateToken(sessionId: string, role: 'publisher' | 'subscriber' = 'publisher'): Promise<string> {
  try {
    // In production, generate actual Vonage token
    // For demo, return mock token
    return `token_${sessionId}_${role}_${Date.now()}`;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
}

export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    // In production, use actual Vonage SMS API
    console.log(`SMS to ${to}: ${message}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}