import prisma from '../db'

export async function createTranslate(
  {
    content,
    targetLanguage,
    contentType,
    contentId,
    lessonId
  }: {
    content: string,
    targetLanguage: string,
    contentType: string,
    contentId: string,
    lessonId: string
  }
) {
  // Determine languageId based on targetLanguage
  const language = await prisma.language.findUnique({
    where: { code: targetLanguage }
  });

  if (!language) {
    throw new Error(`Language with code ${targetLanguage} not found`);
  }

  const data: any = {
    content,
    languageId: language.id
  };

  // Set the appropriate ID based on contentType
  switch (contentType) {
    case 'summary':
      data.summaryId = parseInt(contentId);
      break;
    case 'vocabulary':
      data.vocabularyId = parseInt(contentId);
      break;
    case 'message':
      data.messageId = parseInt(contentId);
      break;
    default:
      throw new Error(`Unsupported contentType: ${contentType}`);
  }

  const translate = await prisma.translate.create({ data });

  return translate;
}