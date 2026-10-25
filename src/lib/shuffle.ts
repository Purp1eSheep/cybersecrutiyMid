import type { Option, Question } from '../types';

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 「以上皆是 / 以上皆非」這類選項一旦被洗牌就會語意錯誤，
 * 所以永遠固定在最後。除了自動偵測，也可以用 fixedOptions 明確指定。
 */
const FIXED_OPTION_PATTERN =
  /以上皆(是|非|對)|兩者皆(是|非|對)|全部皆(是|非)|all of the above|none of the above/i;

export function isFixedOption(option: Option, question: Question): boolean {
  return (
    FIXED_OPTION_PATTERN.test(option.text) ||
    (question.fixedOptions ?? []).includes(option.key)
  );
}

export function buildOptionOrder(
  question: Question,
  shouldShuffle: boolean,
): string[] {
  const options = question.options ?? [];
  const fixed = options.filter((option) => isFixedOption(option, question));
  const movable = options.filter((option) => !isFixedOption(option, question));
  const ordered = [
    ...(shouldShuffle ? shuffle(movable) : movable),
    ...fixed,
  ];

  return ordered.map((option) => option.key);
}
