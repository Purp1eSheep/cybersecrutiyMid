import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bankSchema } from '../src/schema';
import { chapterOf } from '../src/lib/questions';
import type { Bank } from '../src/types';

const dataPath = fileURLToPath(
  new URL('../src/data/questions.json', import.meta.url),
);

let raw: unknown;
try {
  raw = JSON.parse(readFileSync(dataPath, 'utf8'));
} catch (error) {
  console.error('✗ 無法讀取或解析 src/data/questions.json');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const result = bankSchema.safeParse(raw);
if (!result.success) {
  console.error('✗ 題庫格式錯誤：\n');
  for (const issue of result.error.issues) {
    const location = issue.path.length > 0 ? issue.path.join('.') : '(root)';
    console.error(`  • ${location}: ${issue.message}`);
  }
  process.exit(1);
}

const bank = result.data as Bank;
const counts = new Map<string, number>();
for (const question of bank.questions) {
  const chapter = chapterOf(question);
  counts.set(chapter, (counts.get(chapter) ?? 0) + 1);
}

console.log(`✓ 題庫驗證通過：${bank.questions.length} 題`);
for (const [chapter, count] of counts) {
  console.log(`  - ${chapter}: ${count} 題`);
}
