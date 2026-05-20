import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE_PATHS } from '../consts';
import { formatLongDate, formatShortDate } from './date';

export type BlogEntry = CollectionEntry<'blog'>;

export interface PostSummary {
  slug: string;
  href: string;
  legacyHref: string;
  title: string;
  description: string;
  excerpt: string;
  longDate: string;
  shortDate: string;
  readableDate: Date;
  year: string;
  read: string;
  category: string;
  tags: string[];
  tone: {
    bg: string;
    text: string;
  };
  featured: boolean;
}

export interface BlogSnapshot {
  entries: BlogEntry[];
  posts: PostSummary[];
  latestPosts: PostSummary[];
  featuredPost: PostSummary | null;
  categories: string[];
  metrics: {
    postCount: number;
    categoryCount: number;
    oldestYear: string | null;
    newestYear: string | null;
  };
}

const TONES = [
  { bg: '#b84a38', text: '#fff8eb' },
  { bg: '#233f6e', text: '#fff8eb' },
  { bg: '#7c6d32', text: '#fff8eb' },
  { bg: '#201c17', text: '#fff8eb' },
] as const;

function stripMarkdown(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateReadTime(source: string) {
  const plain = stripMarkdown(source);
  const words = plain.length === 0 ? 0 : plain.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min`;
}

export async function getSortedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPublishedBlogEntries() {
  return getSortedPosts();
}

export function getPostHref(slug: string) {
  return `${SITE_PATHS.articles}/${slug}/`;
}

export function getLegacyPostHref(slug: string) {
  return `${SITE_PATHS.blog}/${slug}/`;
}

export function toPostSummary(post: BlogEntry, index: number): PostSummary {
  const tone = post.data.tone ?? TONES[index % TONES.length];
  return {
    slug: post.id,
    href: getPostHref(post.id),
    legacyHref: getLegacyPostHref(post.id),
    title: post.data.title,
    description: post.data.description,
    excerpt: post.data.excerpt ?? post.data.description,
    longDate: formatLongDate(post.data.pubDate),
    shortDate: formatShortDate(post.data.pubDate),
    readableDate: post.data.pubDate,
    year: String(post.data.pubDate.getFullYear()),
    read: post.data.read ?? estimateReadTime(post.body),
    category: post.data.category ?? 'Post',
    tags: post.data.tags ?? [],
    tone,
    featured: post.data.featured ?? false,
  };
}

export async function getPostSummaries() {
  const posts = await getSortedPosts();
  return posts.map((post, index) => toPostSummary(post, index));
}

export async function getFeaturedPost() {
  const posts = await getPostSummaries();
  return posts.find((post) => post.featured) ?? posts[0];
}

export function getCategories(posts: PostSummary[]) {
  return Array.from(new Set(posts.map((post) => post.category)));
}

export async function getBlogSnapshot(): Promise<BlogSnapshot> {
  const entries = await getPublishedBlogEntries();
  const posts = entries.map((post, index) => toPostSummary(post, index));
  const categories = getCategories(posts);
  const latestPosts = posts.slice(0, 3);
  const featuredPost = posts.find((post) => post.featured) ?? posts[0] ?? null;
  const oldestPost = posts[posts.length - 1] ?? null;
  const newestPost = posts[0] ?? null;

  return {
    entries,
    posts,
    latestPosts,
    featuredPost,
    categories,
    metrics: {
      postCount: posts.length,
      categoryCount: categories.length,
      oldestYear: oldestPost?.year ?? null,
      newestYear: newestPost?.year ?? null,
    },
  };
}
