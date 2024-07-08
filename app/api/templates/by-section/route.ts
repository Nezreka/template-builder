// app/api/templates/by-section/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sectionType = searchParams.get('type');

  if (!sectionType) {
    return NextResponse.json({ error: 'Section type is required' }, { status: 400 });
  }

  try {
    const templates = await prisma.template.findMany({
      where: {
        sections: {
          some: {
            section: {
              name: sectionType
            }
          }
        }
      },
      include: {
        sections: {
          where: {
            section: {
              name: sectionType
            }
          },
          include: {
            section: true,
            css: {
              include: {
                cssFile: true
              }
            },
            js: {
              include: {
                jsFile: true
              }
            }
          }
        }
      }
    });

    // Capitalize template names
    const capitalizedTemplates = templates.map(template => ({
      ...template,
      name: capitalizeWords(template.name)
    }));

    return NextResponse.json(capitalizedTemplates);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}