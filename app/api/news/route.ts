import { NextResponse } from 'next/server';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY!;
const NEWS_API_KEY = process.env.NEWS_API_KEY!;

export async function GET() {
  const query = `"artificial intelligence" OR "machine learning" OR "chatgpt" OR "openai" OR "deepmind" OR "anthropic" OR "llm" OR "language model" OR "transformer" OR "generative ai" OR "ai startup" OR "ai research lab" OR "founder ai" OR "ai company" OR "ai tool"`;

  const fromDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=us&max=50&from=${fromDate}&token=${GNEWS_API_KEY}`;

  const newsapiBaseUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&from=${fromDate}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;

  try {
    const [gnewsRes, ...newsapiResList] = await Promise.all([
      fetch(gnewsUrl),
      ...[1, 2, 3].map((page) => fetch(`${newsapiBaseUrl}&pageSize=50&page=${page}`)),
    ]);

    const gnewsData = await gnewsRes.json();
    const newsapiDataList = await Promise.all(newsapiResList.map((res) => res.json()));

    const gnewsArticles =
      gnewsData.articles?.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.image || null,
        publishedAt: article.publishedAt,
        source: {
          name: new URL(article.source?.url || article.url).hostname.replace('www.', ''),
        },
      })) || [];

    const newsapiArticles = newsapiDataList.flatMap((data) =>
      data.articles?.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage || null,
        publishedAt: article.publishedAt,
        source: {
          name: article.source?.name || 'Unknown',
        },
      })) || []
    );

    const mergedArticles = [...gnewsArticles, ...newsapiArticles].filter(
      (a) => a.title && a.url
    );

    // Expanded AI relevance filter
    const AI_KEYWORDS = [
      'ai',
      'artificial intelligence',
      'machine learning',
      'generative ai',
      'llm',
      'language model',
      'transformer',
      'foundation model',
      'neural network',
      'chatgpt',
      'openai',
      'deepmind',
      'anthropic',
      'ai startup',
      'ai company',
      'ai-powered',
      'ai tool',
      'ai research',
      'founder ai',
      'ai lab',
      'ai regulation',
      'ai acquisition',
      'ai funding',
      'ai investment',
      'ai ethics',
    ];

    const DISALLOWED_DOMAINS = ['pypi.org', 'slickdeals.net'];

    const filteredArticles = mergedArticles.filter((article) => {
      const domain = article.source?.name?.toLowerCase() || '';
      const text = `${article.title} ${article.description}`.toLowerCase();

      const isRelevant = AI_KEYWORDS.some((keyword) => text.includes(keyword));
      const hasContent = text.split(' ').length > 5;
      const notFromBannedDomain = !DISALLOWED_DOMAINS.some((banned) =>
        domain.includes(banned)
      );

      return isRelevant && hasContent && notFromBannedDomain;
    });

    const sortedArticles = filteredArticles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return NextResponse.json({ articles: sortedArticles });
  } catch (err) {
    console.error('Failed to fetch articles:', err);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
