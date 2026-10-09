import { NextResponse } from 'next/server';
import { db, seedDatabase } from '@/lib/db';
import { createToken } from '@/lib/auth';

seedDatabase();

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existing = db.findOne('users', { email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const user = db.insertOne('users', { name, email, password, role: 'user' });
    const token = createToken({ userId: user._id, email: user.email, role: user.role, name: user.name });

    return NextResponse.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
