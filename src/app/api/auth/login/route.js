import { NextResponse } from 'next/server';
import { db, seedDatabase } from '@/lib/db';
import { createToken } from '@/lib/auth';

// Ensure DB is seeded
seedDatabase();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = db.findOne('users', { email });
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = createToken({ userId: user._id, email: user.email, role: user.role, name: user.name });

    return NextResponse.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
