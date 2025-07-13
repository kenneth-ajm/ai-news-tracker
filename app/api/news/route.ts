import { NextResponse } from 'next/server';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY!;
const NEWS_API_KEY = process.env.NEWS_API_KEY!;

export async function GET() {
  const query =
    'artificial intelligence OR openai OR anthropic OR deepmind OR ai OR chatgpt';

  const fromDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
    .toISOString()
    .split('T')[0];

  const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    query
  )}&lang=en&country=us&max=50&from=${fromDate}&token=${GNEWS_API_KEY}`;

  const newsapiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    query
  )}&language=en&pageSize=50&from=${fromDate}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;

  try {
    const [gnewsRes, newsapiRes] = await Promise.all([
      fetch(gnewsUrl),
      fetch(newsapiUrl),
    ]);

    const gnewsData = await gnewsRes.json();
    const newsapiData = await newsapiRes.json();

    const gnewsArticles =
      gnewsData.articles?.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.image || null,
        publishedAt: article.publishedAt,
        source: {
          name: new URL(article.source?.url || article.url)
            .hostname.replace('www.', ''),
        },
      })) || [];

    const newsapiArticles =
      newsapiData.articles?.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage || null,
        publishedAt: article.publishedAt,
        source: {
          name: article.source?.name || 'Unknown',
        },
      })) || [];

    const mergedArticles = [...gnewsArticles, ...newsapiArticles].filter(
      (a) => a.title && a.url
    );

    const sortedArticles = mergedArticles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return NextResponse.json({ articles: sortedArticles });
  } catch (err) {
    console.error('Failed to fetch articles:', err);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
