import {
  ABOUT_LINKS,
  ABOUT_NOW_ITEMS,
  ABOUT_PRINCIPLES,
  ABOUT_STATS,
  ABOUT_TIMELINE,
  BOOKS,
  HOME_NOW_TAGS,
  HOME_STATS,
  PROJECTS,
  READING_PHILOSOPHY,
  TOPICS,
} from '../data/site-data';
import { SITE_PATHS } from '../consts';
import { getBlogSnapshot } from './blog';

export interface TopicSummary {
  title: string;
  caption: string;
  href: string;
  filter: string | null;
  isAvailable: boolean;
}

function buildTopicSummaries(categories: string[]): TopicSummary[] {
  const availableCategories = new Set(categories);

  return TOPICS.map(([title, caption]) => {
    const filter = availableCategories.has(title) ? title : null;
    const href = filter
      ? `${SITE_PATHS.articles}?category=${encodeURIComponent(filter)}`
      : SITE_PATHS.articles;

    return {
      title,
      caption,
      href,
      filter,
      isAvailable: filter !== null,
    };
  });
}

export async function getHomePageData() {
  const snapshot = await getBlogSnapshot();
  const currentYear = String(new Date().getFullYear());

  return {
    featuredPost: snapshot.featuredPost,
    latestPosts: snapshot.latestPosts,
    nowTags: HOME_NOW_TAGS,
    topics: buildTopicSummaries(snapshot.categories),
    stats: {
      publishedNotes: String(snapshot.metrics.postCount),
      openIdeas: HOME_STATS.openIdeas,
    },
    years: {
      oldest: snapshot.metrics.oldestYear ?? currentYear,
      newest: snapshot.metrics.newestYear ?? currentYear,
    },
  };
}

export async function getArchivePageData() {
  const snapshot = await getBlogSnapshot();

  return {
    posts: snapshot.posts,
    categories: snapshot.categories,
    topics: buildTopicSummaries(snapshot.categories),
    metrics: {
      postCount: snapshot.metrics.postCount,
      categoryCount: snapshot.metrics.categoryCount,
      sinceYear: snapshot.metrics.oldestYear ?? '?',
    },
  };
}

export async function getAboutPageData() {
  const snapshot = await getBlogSnapshot();
  const currentYear = new Date().getFullYear();
  const oldestTimelineYear = Number(ABOUT_TIMELINE[ABOUT_TIMELINE.length - 1]?.year ?? currentYear);
  const yearsWritingOnline = String(Math.max(0, currentYear - oldestTimelineYear));

  return {
    timeline: ABOUT_TIMELINE,
    links: ABOUT_LINKS,
    principles: ABOUT_PRINCIPLES,
    nowItems: ABOUT_NOW_ITEMS,
    stats: [
      { num: String(snapshot.metrics.postCount), label: 'notes published' },
      { num: ABOUT_STATS.newsletterReaders, label: 'newsletter readers' },
      { num: yearsWritingOnline, label: 'years writing online' },
    ],
  };
}

export function getProjectsPageData() {
  const activeProjects = PROJECTS.filter((project) => project.status === 'Active');

  return {
    projects: PROJECTS,
    counts: {
      total: PROJECTS.length,
      active: activeProjects.length,
    },
  };
}

export function getReadingPageData() {
  const currentYear = new Date().getFullYear();
  const reading = BOOKS.filter((book) => book.status === 'Reading');
  const finished = BOOKS.filter((book) => book.status === 'Finished');
  const finishedThisYear = finished.filter((book) => book.year === currentYear);

  return {
    books: BOOKS,
    reading,
    finished,
    philosophy: READING_PHILOSOPHY,
    counts: {
      total: BOOKS.length,
      reading: reading.length,
      finished: finished.length,
      finishedThisYear: finishedThisYear.length,
    },
  };
}
