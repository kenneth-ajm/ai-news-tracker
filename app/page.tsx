'use client';

import { useEffect, useState } from 'react';

type Article = {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string };
};

const filters = ['All', 'People', 'Funding', 'Product'];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [selected, setSelected] = useState('All');

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles);
        setFiltered(data.articles);
      });
  }, []);

  useEffect(() => {
    if (selected === 'All') {
      setFiltered(articles);
    } else {
      const keywordMap: Record<string, string[]> = {
        People: ['joins', 'hires', 'steps down', 'chief', 'exec', 'leadership'],
        Funding: ['raises', 'funding', 'investment', 'valuation', 'series a', 'seed round'],
        Product: ['launch', 'introduces', 'releases', 'model', 'GPT', 'tool'],
      };

      const terms = keywordMap[selected] || [];
      const filteredList = articles.filter(
        (a) =>
          terms.some((term) =>
            (a.title + ' ' + a.description).toLowerCase().includes(term)
          )
      );
      setFiltered(filteredList);
    }
  }, [selected, articles]);

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧠 Latest AI News</h1>

      {/* Filter buttons */}
      <div className="flex gap-4 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setSelected(f)}
            className={`px-3 py-1 rounded border ${
              selected === f ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 && (
          <p className="text-gray-500">No articles found for “{selected}”.</p>
        )}
        {filtered.map((article, index) => (
          <a key={index} href={article.url} target="_blank" rel="noopener noreferrer" className="border p-4 rounded shadow hover:bg-gray-50 transition">
            <h2 className="text-xl font-semibold">{article.title}</h2>
            <p className="text-sm text-gray-600">
              {article.source.name} – {new Date(article.publishedAt).toLocaleString()}
            </p>
            <p className="mt-2 text-gray-800">{article.description}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
