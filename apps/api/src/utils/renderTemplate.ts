import fs from 'fs';
import path from 'path';

export function renderTemplate(
  templateName: string,
  data: Record<string, string>,
) {
  const filePath = path.join(
    process.cwd(),
    'src/email/templates',
    `${templateName}.html`,
  );

  let html = fs.readFileSync(filePath, 'utf-8');

  // simple replace
  Object.entries(data).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return html;
}
