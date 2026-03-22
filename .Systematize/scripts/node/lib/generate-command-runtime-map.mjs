import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '../../../..');
const catalogPath = join(repoRoot, '.Systematize', 'config', 'command-catalog.json');
const outputPath = join(repoRoot, 'docs', 'COMMAND_RUNTIME_MAP.md');

function detectLineEnding(content) {
  return content.includes('\r\n') ? '\r\n' : '\n';
}

function applyLineEnding(content, lineEnding) {
  return content.replace(/\n/g, lineEnding);
}

function buildMarkdown(catalog) {
  const lines = [
    '# خريطة الربط بين الحوكمة والمحرك',
    '',
    `المرجع الرسمي لتصنيف أوامر ${catalog.product_name}.`,
    '',
    '| الأمر | العائلة | المرحلة | الإلزام | نمط التنفيذ | الإسناد التنفيذي | الملاحظة |',
    '| --- | --- | --- | --- | --- | --- | --- |'
  ];

  for (const command of catalog.commands) {
    lines.push(
      `| \`${command.name}\` | ${command.family} | ${command.stage} | ${command.requirement_level} | ${command.execution_mode} | ${command.runtime_command || '—'} | ${command.notes} |`
    );
  }

  lines.push(
    '',
    '## تفسير الأنماط',
    '',
    '- `llm-only`: أمر حوكمي أو تحليلي بلا أمر تشغيل رسمي مباشر.',
    '- `runtime-backed`: أمر حوكمي أو تقريري مرتبط بأمر فعلي داخل محرك Node.',
    '- `integration-only`: قدرة تكامل خارجية اختيارية وليست جزءًا من القلب.',
    '',
    '## تفسير العائلات',
    ''
  );

  for (const [family, description] of Object.entries(catalog.families)) {
    lines.push(`- \`${family}\`: ${description}`);
  }

  lines.push('');
  return lines.join('\n');
}

const shouldCheck = process.argv.includes('--check');
const current = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : '';
const lineEnding = detectLineEnding(current);
const expected = applyLineEnding(buildMarkdown(JSON.parse(readFileSync(catalogPath, 'utf8'))), lineEnding);

if (shouldCheck) {
  if (current.trimEnd() !== expected.trimEnd()) {
    console.error(`Generated command runtime map is out of date: ${outputPath}`);
    process.exit(1);
  }

  console.log('Command runtime map is up to date.');
} else {
  writeFileSync(outputPath, `${expected}${lineEnding}`, 'utf8');
  console.log(`Generated ${outputPath}`);
}
