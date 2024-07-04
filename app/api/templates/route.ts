import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
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

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, description, sections, globalCss, globalJs } = await req.json();

    const template = await prisma.template.create({
      data: {
        name,
        description,
        sections: {
          create: await Promise.all(sections.map(async (section: any, index: number) => {
            // First, find or create the Section
            let sectionEntity = await prisma.section.findFirst({
              where: { name: section.type }
            });

            if (!sectionEntity) {
              sectionEntity = await prisma.section.create({
                data: { name: section.type }
              });
            }

            return {
              order: index,
              htmlContent: section.html,
              sectionId: sectionEntity.id,
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
            };
          })),
        },
        globalCss: {
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
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}