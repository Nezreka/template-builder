-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TemplateSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    CONSTRAINT "TemplateSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TemplateSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CssFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JsFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TemplateCssFile" (
    "templateId" TEXT NOT NULL,
    "cssFileId" TEXT NOT NULL,

    PRIMARY KEY ("templateId", "cssFileId"),
    CONSTRAINT "TemplateCssFile_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TemplateCssFile_cssFileId_fkey" FOREIGN KEY ("cssFileId") REFERENCES "CssFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateJsFile" (
    "templateId" TEXT NOT NULL,
    "jsFileId" TEXT NOT NULL,

    PRIMARY KEY ("templateId", "jsFileId"),
    CONSTRAINT "TemplateJsFile_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TemplateJsFile_jsFileId_fkey" FOREIGN KEY ("jsFileId") REFERENCES "JsFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SectionCssFile" (
    "templateSectionId" TEXT NOT NULL,
    "cssFileId" TEXT NOT NULL,

    PRIMARY KEY ("templateSectionId", "cssFileId"),
    CONSTRAINT "SectionCssFile_templateSectionId_fkey" FOREIGN KEY ("templateSectionId") REFERENCES "TemplateSection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SectionCssFile_cssFileId_fkey" FOREIGN KEY ("cssFileId") REFERENCES "CssFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SectionJsFile" (
    "templateSectionId" TEXT NOT NULL,
    "jsFileId" TEXT NOT NULL,

    PRIMARY KEY ("templateSectionId", "jsFileId"),
    CONSTRAINT "SectionJsFile_templateSectionId_fkey" FOREIGN KEY ("templateSectionId") REFERENCES "TemplateSection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SectionJsFile_jsFileId_fkey" FOREIGN KEY ("jsFileId") REFERENCES "JsFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateSection_templateId_sectionId_key" ON "TemplateSection"("templateId", "sectionId");
