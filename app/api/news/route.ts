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
  const apiKey = process.env.GNEWS_API_KEY;
  const url = `https://gnews.io/api/v4/search?q=artificial+intelligence+OR+openai+OR+chatgpt+OR+anthropic+OR+deepmind+OR+ai+startup+OR+altman+OR+sam+altman&lang=en&max=30&apikey=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  // Filter out duplicate titles
  const uniqueArticles = Array.from(
    new Map(data.articles.map((item: Article) => [item.title, item])).values()
Codespaces: Reload Window

  return NextResponse.json({ articles: uniqueArticles.slice(0, 12) });
}
