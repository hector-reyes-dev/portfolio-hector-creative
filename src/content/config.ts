import { defineCollection, z } from 'astro:content';

const commonSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().optional(),
  featured: z.boolean().optional()
});

const posts = defineCollection({
  type: 'content',
  schema: commonSchema.extend({
    cover: z.string().optional()
  })
});

const projects = defineCollection({
  type: 'content',
  schema: commonSchema.extend({
    repoUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    cover: z.string().optional()
  })
});

const experiments = defineCollection({
  type: 'content',
  schema: commonSchema.extend({
    status: z.enum(['draft', 'active', 'archived']).optional(),
    demoUrl: z.string().url().optional()
  })
});

const packages = defineCollection({
  type: 'content',
  schema: commonSchema.extend({
    packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']).optional(),
    packageUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional()
  })
});

const components = defineCollection({
  type: 'content',
  schema: commonSchema.extend({
    category: z.string().optional(),
    docsUrl: z.string().url().optional()
  })
});

const resources = defineCollection({
  type: 'content',
  schema: commonSchema.extend({
    resourceType: z.enum(['article', 'video', 'tool', 'guide']).optional(),
    sourceUrl: z.string().url().optional()
  })
});

export const collections = {
  posts,
  projects,
  experiments,
  packages,
  components,
  resources
};
