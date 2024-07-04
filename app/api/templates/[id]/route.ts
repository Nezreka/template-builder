import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.template.findUnique({
      where: { id: params.id },
      include: {
        sections: {
          include: {
            section: true,
            css: { include: { cssFile: true } },
            js: { include: { jsFile: true } }
          }
        },
        globalCss: { include: { cssFile: true } },
        globalJs: { include: { jsFile: true } }
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, sections, globalCss, globalJs } = await request.json();

    const updatedTemplate = await prisma.template.update({
      where: { id: params.id },
      data: {
        name,
        sections: {
          deleteMany: {},
          create: sections.map((section: any, index: number) => ({
            order: index,
            htmlContent: section.html,
            section: {
              connectOrCreate: {
                where: { name: section.type },
                create: { name: section.type },
              },
            },
            css: {
              create: section.css ? [{
                cssFile: {
                  create: {
                    filename: `${section.type}_${index}.css`,
                    content: section.css,
                  },
                },
              }] : [],
            },
            js: {
              create: section.js ? [{
                jsFile: {
                  create: {
                    filename: `${section.type}_${index}.js`,
                    content: section.js,
                  },
                },
              }] : [],
            },
          })),
        },
        globalCss: {
          deleteMany: {},
          create: globalCss ? [{
            cssFile: {
              create: {
                filename: 'global.css',
                content: globalCss,
              },
            },
          }] : [],
        },
        globalJs: {
          deleteMany: {},
          create: globalJs ? [{
            jsFile: {
              create: {
                filename: 'global.js',
                content: globalJs,
              },
            },
          }] : [],
        },
      },
      include: {
        sections: {
          include: {
            section: true,
            css: { include: { cssFile: true } },
            js: { include: { jsFile: true } }
          }
        },
        globalCss: { include: { cssFile: true } },
        globalJs: { include: { jsFile: true } }
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Failed to update template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}