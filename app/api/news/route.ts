import { NextResponse } from 'next/server';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY!;
const NEWS_API_KEY = process.env.NEWS_API_KEY!;

export async function GET() {
  const query =
    '("artificial intelligence" OR "ai" OR "chatgpt" OR "openai" OR "anthropic" OR "deepmind" OR "gpt-4" OR "llm" OR "mistral ai" OR "xai" OR "runway ml" OR "perplexity" OR "stability ai" OR "hugging face" OR "generative ai" OR "ai agents")';

  const fromDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
    .toISOString()
    .split('T')[0];

  const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    query
  )}&lang=en&country=us&max=50&from=${fromDate}&token=${GNEWS_API_KEY}`;

  const newsapiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    query
  )}&language=en&pageSize=50&from=${fromDate}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;

  const allowedDomains = [
    'techcrunch.com',
    'theverge.com',
    'wired.com',
    'venturebeat.com',
    'reuters.com',
    'cnn.com',
    'bbc.com',
    'forbes.com',
    'nytimes.com',
    'bloomberg.com',
    'semianalysis.com',
    'axios.com',
    'nbcnews.com',
    'ft.com',
    'cnbc.com',
    'businessinsider.com',
    'zdnet.com',
    'arstechnica.com',
    'slate.com',
    'gizmodo.com',
    'thenextweb.com',
    'engadget.com',
    'slashdot.org',
    '9to5mac.com',
    'theregister.com',
  ];

  const isRelevant = (article: any) => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const host = new URL(article.url).hostname.replace('www.', '');

    return (
      allowedDomains.some(domain => host.includes(domain)) &&
      /ai|artificial intelligence|openai|chatgpt|gpt|llm|anthropic|deepmind|huggingface|mistral|xai|stability|perplexity|agent|transformer|generative/i.test(
        text
      )
    );
  };

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
      (a) => a.title && a.url && isRelevant(a)
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
