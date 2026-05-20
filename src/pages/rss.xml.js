import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getPostHref, getPublishedBlogEntries } from '../utils/blog';

export async function GET(context) {
  const posts = await getPublishedBlogEntries();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      ...post.data,
      link: getPostHref(post.id),
    })),
  });
}
