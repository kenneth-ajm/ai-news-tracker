import { NextResponse } from 'next/server';

type Article = {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string };
};

export async function GET() {
  const gnewsKey = process.env.GNEWS_API_KEY;
  const newsApiKey = process.env.NEWS_API_KEY;

  const gnewsURL = `https://gnews.io/api/v4/search?q=artificial+intelligence+OR+openai+OR+chatgpt+OR+anthropic+OR+deepmind&lang=en&max=30&apikey=${gnewsKey}`;
  const newsapiURL = `https://newsapi.org/v2/everything?q=artificial+intelligence+OR+openai+OR+chatgpt+OR+anthropic+OR+deepmind&language=en&pageSize=30&sortBy=publishedAt&apiKey=${newsApiKey}`;

  const [gnewsRes, newsapiRes] = await Promise.all([
    fetch(gnewsURL),
    fetch(newsapiURL),
  ]);

  const gnewsData = await gnewsRes.json();
  const newsapiData = await newsapiRes.json();

  // Normalize both into same format
  const gnewsArticles: Article[] = (gnewsData.articles || []).map((a: any) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    image: a.image,
    publishedAt: a.publishedAt,
    source: { name: a.source.name || 'GNews' },
  }));

  const newsapiArticles: Article[] = (newsapiData.articles || []).map((a: any) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    image: a.urlToImage,
    publishedAt: a.publishedAt,
    source: { name: a.source.name },
  }));

  // Merge and de-duplicate by title
  const merged = [...gnewsArticles, ...newsapiArticles];
  const articleMap = new Map(merged.map((item: Article) => [item.title, item]));
  const uniqueArticles = Array.from(articleMap.values());

  // Sort newest first
  uniqueArticles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return NextResponse.json({ articles: uniqueArticles.slice(0, 15) });
}
