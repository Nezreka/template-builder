import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
  }

  try {
    const existingTemplate = await prisma.template.findFirst({
      where: { name: name },
    });

    return NextResponse.json({ exists: !!existingTemplate });
  } catch (error) {
    console.error('Failed to check template name:', error);
    return NextResponse.json({ error: 'Failed to check template name' }, { status: 500 });
  }
}