/// <reference types="react" />
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  FaRobot,
  FaBuilding,
  FaMoneyBillWave,
  FaFlask,
  FaBalanceScale,
  FaNewspaper,
} from 'react-icons/fa';
import {
  FaYahoo,
  FaGoogle,
  FaMicrosoft,
  FaAmazon,
  FaApple,
  FaTwitter,
  FaFacebook,
  FaGithub,
  FaRegNewspaper,
} from 'react-icons/fa6';

type Article = {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: string;
  source: { name: string };
};

const SOURCE_ICONS: Record<string, ReactNode> = {
  Yahoo: <FaYahoo className="inline-block text-purple-400" />,
  Google: <FaGoogle className="inline-block text-blue-400" />,
  Microsoft: <FaMicrosoft className="inline-block text-blue-600" />,
  Amazon: <FaAmazon className="inline-block text-yellow-500" />,
  Apple: <FaApple className="inline-block text-gray-400" />,
  Twitter: <FaTwitter className="inline-block text-blue-400" />,
  Facebook: <FaFacebook className="inline-block text-blue-500" />,
  Github: <FaGithub className="inline-block text-white" />,
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Latest AI product announcements': ['launch', 'product', 'release', 'introduce'],
  'Key company movements': ['CEO', 'leadership', 'hiring', 'resign', 'promotion', 'executive', 'sam altman', 'elon musk'],
  'AI funding rounds and acquisitions': ['funding', 'raised', 'acquired', 'acquisition', 'invest'],
  'Notable papers or research breakthroughs': ['research', 'breakthrough', 'paper', 'study'],
  'Regulatory or ethical updates': ['regulation', 'ban', 'ethics', 'law', 'policy'],
};

function categorizeArticle(article: Article): string {
  const text = `${article.title} ${article.description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((word) => text.includes(word))) {
      return category;
    }
  }
  return 'Uncategorized';
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => setArticles(data.articles || []));
  }, []);

  const categorized: Record<string, Article[]> = {};
  articles.forEach((article) => {
    const category = categorizeArticle(article);
    if (!categorized[category]) categorized[category] = [];
    categorized[category].push(article);
  });

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 text-white px-6 py-10 font-sans">
      <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-2">
        🤖 Latest AI News
      </h1>

      {Object.entries(categorized).map(([category, items]) => (
        <div key={category} className="mb-10">
          <h2 className="text-2xl font-bold mb-4">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.slice(0, visibleCount).map((article) => (
              <div
                key={article.url}
                className="bg-white/10 backdrop-blur-md rounded-lg p-5 shadow-md border border-white/10 hover:bg-white/20 transition flex flex-col"
              >
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="rounded mb-3 h-40 w-full object-cover"
                  />
                )}
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <h3 className="text-lg font-semibold mb-1 hover:underline">{article.title}</h3>
                </a>
                <p className="text-sm text-gray-300 mb-2">
                  {(SOURCE_ICONS[article.source.name] || <FaRegNewspaper className="inline-block" />)}{' '}
                  {article.source.name} — {new Date(article.publishedAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">{article.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {visibleCount < articles.length && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Load More
          </button>
        </div>
      )}
    </main>
  );
}
