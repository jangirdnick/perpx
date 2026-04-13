import fs from 'fs';
import path from 'path';

export function renderTemplate(templateName: string, data: any) {
  const filePath = path.join(
    process.cwd(),
    'src/email/templates',
    `${templateName}.html`,
  );

  console.log('Template Path:', filePath);

  let html = fs.readFileSync(filePath, 'utf-8');

  // simple replace
  Object.keys(data).forEach((key) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
  });

  return html;
}
