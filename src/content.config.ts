import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const commonSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().optional(),
  featured: z.boolean().optional()
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: commonSchema.extend({
    cover: z.string().optional()
  })
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: commonSchema.extend({
    repoUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    cover: z.string().optional()
  })
});

const experiments = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experiments' }),
  schema: commonSchema.extend({
    status: z.enum(['draft', 'active', 'archived']).optional(),
    demoUrl: z.string().url().optional()
  })
});

const packages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/packages' }),
  schema: commonSchema.extend({
    packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']).optional(),
    packageUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional()
  })
});

const components = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/components' }),
  schema: commonSchema.extend({
    category: z.string().optional(),
    docsUrl: z.string().url().optional()
  })
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
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
