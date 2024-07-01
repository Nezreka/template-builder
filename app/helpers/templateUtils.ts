// helpers/templateUtils.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function generateCombinedTemplate(templateId: string) {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      globalCss: { include: { cssFile: true } },
      globalJs: { include: { jsFile: true } },
      sections: {
        include: {
          section: true,
          css: { include: { cssFile: true } },
          js: { include: { jsFile: true } }
        }
      }
    }
  });

  if (!template) throw new Error('Template not found');

  // Combine HTML
  const combinedHtml = template.sections
    .sort((a, b) => a.order - b.order)
    .map(section => section.htmlContent)
    .join('\n');

  // Combine CSS (excluding global CSS)
  const combinedCss = template.sections
    .flatMap(section => section.css.map(c => c.cssFile.content))
    .join('\n');

  // Combine JS (excluding global JS)
  const combinedJs = template.sections
    .flatMap(section => section.js.map(j => j.jsFile.content))
    .join('\n');

  // Global CSS and JS
  const globalCss = template.globalCss.map(g => g.cssFile.content).join('\n');
  const globalJs = template.globalJs.map(g => g.jsFile.content).join('\n');

  return {
    html: combinedHtml,
    css: globalCss + '\n' + combinedCss,
    js: globalJs + '\n' + combinedJs
  };
}