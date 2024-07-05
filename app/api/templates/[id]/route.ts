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

    const updatedSections = await Promise.all(sections.map(async (section: any, index: number) => {
      let sectionId = section.sectionId;

      if (!sectionId) {
        // If sectionId is not provided, create a new section
        const newSection = await prisma.section.create({
          data: { name: section.type || `Section ${index + 1}` },
        });
        sectionId = newSection.id;
      }

      return {
        order: index,
        htmlContent: section.html,
        section: { connect: { id: sectionId } },
        css: {
          create: section.css && section.css.length > 0 ? [{
            cssFile: {
              create: {
                filename: `${section.type || `Section ${index + 1}`}_${index}.css`,
                content: typeof section.css === 'string' ? section.css : '',
              },
            },
          }] : [],
        },
        js: {
          create: section.js && section.js.length > 0 ? [{
            jsFile: {
              create: {
                filename: `${section.type || `Section ${index + 1}`}_${index}.js`,
                content: typeof section.js === 'string' ? section.js : '',
              },
            },
          }] : [],
        },
      };
    }));

    const updatedTemplate = await prisma.template.update({
      where: { id: params.id },
      data: {
        name,
        sections: {
          deleteMany: {},
          create: updatedSections,
        },
        globalCss: {
          deleteMany: {},
          create: globalCss ? [{
            cssFile: {
              create: {
                filename: 'global.css',
                content: typeof globalCss === 'string' ? globalCss : '',
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
                content: typeof globalJs === 'string' ? globalJs : '',
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
    return NextResponse.json({ error: 'Failed to update template', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Delete all sections associated with the template
    await prisma.templateSection.deleteMany({
      where: { templateId: params.id },
    });

    // Delete the template
    await prisma.template.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}