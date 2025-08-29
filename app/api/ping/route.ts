import { NextResponse } from 'next/server'

export async function GET() {
  console.log('/api/ping pinged')
  return NextResponse.json({ ok: true })
}
