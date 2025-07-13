'use client';

import React, { useEffect, useState } from 'react';

type Article = {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string };
};

const filters = ['All', 'People', 'Funding', 'Product'];

const HIGHLIGHTS: Record<string, string> = {
  "Sam Altman": "🧑‍💼 Sam Altman",
  "Dario Amodei": "🧑‍🔬 Dario Amodei",
  "Demis Hassabis": "🧠 Demis Hassabis",
  "Elon Musk": "🚀 Elon Musk",
  "OpenAI": "🏢 OpenAI",
  "Anthropic": "🌿 Anthropic",
  "DeepMind": "🔬 DeepMind",
  "Meta": "📘 Meta",
  "Google": "🔍 Google",
  "xAI": "🧩 xAI"
};

function highlightTerms(text: string): React.ReactNode {
  const parts = text.split(
    new RegExp(`(${Object.keys(HIGHLIGHTS).join('|')})`, 'gi')
  );

  return (
    <>
      {parts.map((part, i) =>
        HIGHLIGHTS[part] ? (
          <span key={i} className="font-bold text-indigo-600">
            {HIGHLIGHTS[part]}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

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
        People: ['joins', 'hires', 'steps down', 'chief', 'exec', 'leadership', 'sam altman', 'dario', 'demis', 'elon'],
        Funding: ['raises', 'funding', 'investment', 'valuation', 'series a', 'seed round'],
        Product: ['launch', 'introduces', 'releases', 'model', 'GPT', 'tool', 'framework'],
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

      {/* Filter Buttons */}
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
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border p-4 rounded shadow hover:bg-gray-50 transition"
          >
            <h2 className="text-xl font-semibold">
              {highlightTerms(article.title)}
            </h2>
            <p className="text-sm text-gray-600">
              {article.source.name} –{' '}
              {new Date(article.publishedAt).toLocaleString()}
            </p>
            <p className="mt-2 text-gray-800">
              {highlightTerms(article.description)}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
