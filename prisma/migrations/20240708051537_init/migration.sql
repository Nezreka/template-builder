-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateSection" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "TemplateSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CssFile" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "CssFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JsFile" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "JsFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateCssFile" (
    "templateId" TEXT NOT NULL,
    "cssFileId" TEXT NOT NULL,

    CONSTRAINT "TemplateCssFile_pkey" PRIMARY KEY ("templateId","cssFileId")
);

-- CreateTable
CREATE TABLE "TemplateJsFile" (
    "templateId" TEXT NOT NULL,
    "jsFileId" TEXT NOT NULL,

    CONSTRAINT "TemplateJsFile_pkey" PRIMARY KEY ("templateId","jsFileId")
);

-- CreateTable
CREATE TABLE "SectionCssFile" (
    "templateSectionId" TEXT NOT NULL,
    "cssFileId" TEXT NOT NULL,

    CONSTRAINT "SectionCssFile_pkey" PRIMARY KEY ("templateSectionId","cssFileId")
);

-- CreateTable
CREATE TABLE "SectionJsFile" (
    "templateSectionId" TEXT NOT NULL,
    "jsFileId" TEXT NOT NULL,

    CONSTRAINT "SectionJsFile_pkey" PRIMARY KEY ("templateSectionId","jsFileId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateSection_templateId_sectionId_key" ON "TemplateSection"("templateId", "sectionId");

-- AddForeignKey
ALTER TABLE "TemplateSection" ADD CONSTRAINT "TemplateSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSection" ADD CONSTRAINT "TemplateSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateCssFile" ADD CONSTRAINT "TemplateCssFile_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateCssFile" ADD CONSTRAINT "TemplateCssFile_cssFileId_fkey" FOREIGN KEY ("cssFileId") REFERENCES "CssFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateJsFile" ADD CONSTRAINT "TemplateJsFile_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateJsFile" ADD CONSTRAINT "TemplateJsFile_jsFileId_fkey" FOREIGN KEY ("jsFileId") REFERENCES "JsFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionCssFile" ADD CONSTRAINT "SectionCssFile_templateSectionId_fkey" FOREIGN KEY ("templateSectionId") REFERENCES "TemplateSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionCssFile" ADD CONSTRAINT "SectionCssFile_cssFileId_fkey" FOREIGN KEY ("cssFileId") REFERENCES "CssFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionJsFile" ADD CONSTRAINT "SectionJsFile_templateSectionId_fkey" FOREIGN KEY ("templateSectionId") REFERENCES "TemplateSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionJsFile" ADD CONSTRAINT "SectionJsFile_jsFileId_fkey" FOREIGN KEY ("jsFileId") REFERENCES "JsFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
