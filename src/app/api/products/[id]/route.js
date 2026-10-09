import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const product = db.findById('products', id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const updated = db.updateOne('products', id, body);
  if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ product: updated });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const deleted = db.deleteOne('products', id);
  if (!deleted) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ message: 'Product deleted' });
}
