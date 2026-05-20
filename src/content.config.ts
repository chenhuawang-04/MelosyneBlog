import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      excerpt: z.string().optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      read: z.string().optional(),
      tone: z.object({ bg: z.string(), text: z.string() }).optional(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      heroImage: z.optional(image()),
    }),
});

export const collections = { blog };
