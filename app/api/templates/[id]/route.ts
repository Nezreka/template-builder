// app/api/templates/[id]/route.ts
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

    // Start a transaction
    const updatedTemplate = await prisma.$transaction(async (prisma) => {
      // First, delete existing relationships
      await prisma.templateCssFile.deleteMany({ where: { templateId: params.id } });
      await prisma.templateJsFile.deleteMany({ where: { templateId: params.id } });
      await prisma.sectionCssFile.deleteMany({
        where: { templateSection: { templateId: params.id } },
      });
      await prisma.sectionJsFile.deleteMany({
        where: { templateSection: { templateId: params.id } },
      });
      await prisma.templateSection.deleteMany({ where: { templateId: params.id } });

      // Now update the template with new data
      return await prisma.template.update({
        where: { id: params.id },
        data: {
          name,
          sections: {
            create: await Promise.all(sections.map(async (section: any, index: number) => {
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
                section: { connect: { id: sectionEntity.id } },
                css: {
                  create: section.css ? [{
                    cssFile: {
                      create: {
                        filename: `${section.type || `Section ${index + 1}`}_${index}.css`,
                        content: Array.isArray(section.css) ? '' : section.css || '',
                      },
                    },
                  }] : [],
                },
                js: {
                  create: section.js ? [{
                    jsFile: {
                      create: {
                        filename: `${section.type || `Section ${index + 1}`}_${index}.js`,
                        content: Array.isArray(section.js) ? '' : section.js || '',
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
                  content: Array.isArray(globalCss) ? '' : globalCss || '',
                },
              },
            }] : [],
          },
          globalJs: {
            create: globalJs ? [{
              jsFile: {
                create: {
                  filename: 'global.js',
                  content: Array.isArray(globalJs) ? '' : globalJs || '',
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
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Failed to update template:", error);
    return NextResponse.json(
      { error: "Failed to update template", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Start a transaction
    await prisma.$transaction(async (prisma) => {
      // Delete all related CSS files
      await prisma.templateCssFile.deleteMany({
        where: { templateId: params.id },
      });

      // Delete all related JS files
      await prisma.templateJsFile.deleteMany({
        where: { templateId: params.id },
      });

      // Delete all related section CSS files
      await prisma.sectionCssFile.deleteMany({
        where: {
          templateSection: {
            templateId: params.id,
          },
        },
      });

      // Delete all related section JS files
      await prisma.sectionJsFile.deleteMany({
        where: {
          templateSection: {
            templateId: params.id,
          },
        },
      });

      // Delete all sections associated with the template
      await prisma.templateSection.deleteMany({
        where: { templateId: params.id },
      });

      // Finally, delete the template
      await prisma.template.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return NextResponse.json(
      { error: "Failed to delete template", details: error.message },
      { status: 500 }
    );
  }
}