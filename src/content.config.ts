import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    type: z.enum(['Deep dive', 'Field note']),
    topic: z.enum(['Distributed systems', 'Data systems']),
    readingTime: z.string(),
    issue: z.string(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { writing };
