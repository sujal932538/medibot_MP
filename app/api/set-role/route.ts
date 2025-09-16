import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  try {
    console.log('POST /api/set-role invoked')
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    console.log('set-role body', body)
    const { role } = body || {}
    const validRoles = ['patient', 'doctor', 'admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    await convex.mutation(api.users.createUser, {
      clerkId: session.user.id,
      email: session.user.email,
      firstName: session.user.name?.split(' ')[0] || '',
      lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
      role,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('set-role error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}