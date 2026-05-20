export const NAV_ITEMS = [
  { label: '文章', href: '/articles' },
  { label: '项目', href: '/projects' },
  { label: '书单', href: '/reading' },
  { label: '关于', href: '/about' },
];

export const SITE_FOOTER_LINKS = [
  { label: 'RSS', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Email', href: '#' },
];

export const HOME_STATS = {
  publishedNotes: '128',
  openIdeas: '42',
};

export const HOME_NOW_TAGS = ['Reading', 'Writing', 'Designing', 'Building'];

export const PROJECTS = [
  {
    slug: 'journal-os',
    title: 'Journal OS',
    subtitle: '个人知识操作系统',
    status: 'Active',
    year: '2026',
    tags: ['Design', 'Build'],
    description: '以「Slipbox + GTD + 周回顾」三层架构构建的个人知识系统，连接日记、阅读摘录和项目复盘。',
    color: '#201c17',
    textColor: '#fff8eb',
  },
  {
    slug: 'typography-lab',
    title: 'Typography Lab',
    subtitle: '中英排版实验室',
    status: 'Ongoing',
    year: '2025',
    tags: ['Design', 'Research'],
    description: '探索中英文混排的美学边界，包括字体配对、行距系统和网格字量设计原则。',
    color: '#233f6e',
    textColor: '#fff8eb',
  },
  {
    slug: 'slow-newsletter',
    title: 'Slow Letter',
    subtitle: '每周一封不追热点的通讯',
    status: 'Active',
    year: '2026',
    tags: ['Writing', 'Build'],
    description: '拒绝热点话题，只写一周内真正让我停下来思考的事情。已服务 340+ 读者。',
    color: '#b84a38',
    textColor: '#fff8eb',
  },
  {
    slug: 'digital-garden-v2',
    title: 'Digital Garden v2',
    subtitle: '公开的知识花园',
    status: 'Planning',
    year: '2026',
    tags: ['Build', 'Design'],
    description: '下一个版本的公开笔记花园，Markdown 文件驱动，支持双向链接和引用连接。',
    color: '#7c6d32',
    textColor: '#fff8eb',
  },
];

export const BOOKS = [
  {
    title: '革命前夜',
    author: 'Hannah Arendt',
    category: 'Philosophy',
    status: 'Reading',
    rating: null,
    year: 2026,
    note: '战争与政治之间的张力。在当下读这类书，别有一番滋味。',
    color: '#201c17',
  },
  {
    title: 'A Pattern Language',
    author: 'Christopher Alexander',
    category: 'Design',
    status: 'Finished',
    rating: 5,
    year: 2026,
    note: '当世界可以用语言描述，设计就是一种论述。',
    color: '#233f6e',
  },
  {
    title: '黑暗的左手',
    author: 'Ursula K. Le Guin',
    category: 'Fiction',
    status: 'Finished',
    rating: 5,
    year: 2025,
    note: '比任何性别理论更深入地谈论性别。',
    color: '#7c6d32',
  },
  {
    title: 'The Information',
    author: 'James Gleick',
    category: 'Science',
    status: 'Finished',
    rating: 4,
    year: 2025,
    note: '信息理论与文明发展的叠加。',
    color: '#b84a38',
  },
  {
    title: 'Thinking in Systems',
    author: 'Donella Meadows',
    category: 'Systems',
    status: 'Finished',
    rating: 5,
    year: 2025,
    note: '目前读过的系统思维入门书里最好的一本。',
    color: '#d5b46a',
  },
  {
    title: '山海经',
    author: '佚名',
    category: 'Classics',
    status: 'Reading',
    rating: null,
    year: 2026,
    note: '神话地理与先民知识体系的大泽。',
    color: '#201c17',
  },
];

export const TOPICS = [
  ['Design', '视觉系统'],
  ['Notes', '长期笔记'],
  ['Reading', '阅读摘录'],
  ['Build', '项目复盘'],
  ['Life', '日常观察'],
  ['Essay', '深度文章'],
] as [string, string][];

export const ABOUT_TIMELINE = [
  { year: '2026', event: '开始运营 Slow Letter 每周通讯，目前已有 340+ 订阅者。' },
  { year: '2025', event: '重建个人知识系统，开始公开记录阅读摘录。' },
  { year: '2024', event: '尝试了十个不同的笔记工具，最终连回纸本。' },
  { year: '2023', event: '写了第一篇停留超过 1000 人阅读的文章。' },
  { year: '2022', event: '开始在网上写东西，没有读者，只是每天做笔记的延伸。' },
];

export const ABOUT_LINKS = [
  { label: 'Email', icon: 'mail', href: 'mailto:hi@huawang.me' },
  { label: 'GitHub', icon: 'github', href: '#' },
  { label: 'RSS', icon: 'rss', href: '#' },
] as const;

export const ABOUT_PRINCIPLES = [
  '写作优先于积累',
  '问题领先于解决方案',
  '慢思考，快执行',
  '公开思考过程而不是结果',
];

export const ABOUT_NOW_ITEMS = [
  '写作每周通讯 Slow Letter',
  '构建第二版数字花园（公开笔记系统）',
  '阅读 Hannah Arendt《革命前夜》',
  '研究中英文混排美学',
];

export const ABOUT_STATS = [
  { num: '128', label: 'notes published' },
  { num: '340+', label: 'newsletter readers' },
  { num: '4', label: 'years writing online' },
];

export const READING_PHILOSOPHY = {
  quote: '不为笔记而阅读，就是消费而不是摄入。',
  note: '我用「摘录→连接→复盘」三步阅读法：划线到 Readwise，周内写第一层反思，周尾连接已有笔记。',
};
