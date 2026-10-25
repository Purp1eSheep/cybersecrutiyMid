import { z } from 'zod';
import type { Bank, Question } from './types';

export const optionSchema = z.object({
  key: z.string().trim().min(1, '選項 key 不可為空'),
  text: z.string().trim().min(1, '選項文字不可為空'),
});

export const questionSchema: z.ZodType<Question> = z
  .object({
    id: z.string().trim().min(1, 'id 不可為空'),
    type: z.enum(['single', 'tf']),
    chapter: z.string().trim().min(1).optional(),
    source: z.string().trim().min(1).optional(),
    question: z.string().trim().min(1, '題目文字不可為空'),
    code: z.string().nullable().optional(),
    options: z.array(optionSchema).optional(),
    answer: z
      .array(z.string())
      .length(1, 'answer 必須剛好一個元素，例如 ["B"] 或 ["T"]'),
    explanation: z.string().nullable().optional(),
    fixedOptions: z.array(z.string()).optional(),
  })
  .superRefine((q, ctx) => {
    if (q.type === 'single') {
      const options = q.options ?? [];
      if (options.length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['options'],
          message: '單選題至少需要兩個選項',
        });
        return;
      }

      const keys = new Set<string>();
      options.forEach((option, index) => {
        if (keys.has(option.key)) {
          ctx.addIssue({
            code: 'custom',
            path: ['options', index, 'key'],
            message: `選項 key 重複：${option.key}`,
          });
        }
        keys.add(option.key);
      });

      const answer = q.answer[0];
      if (!keys.has(answer)) {
        ctx.addIssue({
          code: 'custom',
          path: ['answer'],
          message: `answer 指向不存在的選項：${answer}`,
        });
      }

      for (const key of q.fixedOptions ?? []) {
        if (!keys.has(key)) {
          ctx.addIssue({
            code: 'custom',
            path: ['fixedOptions'],
            message: `fixedOptions 指向不存在的選項：${key}`,
          });
        }
      }
    } else {
      if (q.options && q.options.length > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['options'],
          message: '是非題請不要提供 options',
        });
      }
      if (!['T', 'F'].includes(q.answer[0])) {
        ctx.addIssue({
          code: 'custom',
          path: ['answer'],
          message: '是非題 answer 只能是 ["T"] 或 ["F"]',
        });
      }
    }
  });

export const bankSchema: z.ZodType<Bank> = z
  .object({
    meta: z.object({
      title: z.string().trim().min(1, 'meta.title 不可為空'),
      version: z.number().int().positive(),
      updated: z.string().optional(),
    }),
    questions: z.array(questionSchema).min(1, '題庫至少要有一題'),
  })
  .superRefine((bank, ctx) => {
    const seen = new Set<string>();
    bank.questions.forEach((question, index) => {
      if (seen.has(question.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['questions', index, 'id'],
          message: `id 重複：${question.id}`,
        });
      }
      seen.add(question.id);
    });
  });
