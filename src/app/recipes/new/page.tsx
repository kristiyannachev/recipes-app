// src/app/recipes/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: '', ingredients, steps, imageUrl }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? 'Failed to create recipe');
      return;
    }

    router.push('/');
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">New Recipe</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border rounded p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full border rounded p-2 h-32" placeholder="Ingredients (one per line)" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
        <textarea className="w-full border rounded p-2 h-40" placeholder="Steps" value={steps} onChange={(e) => setSteps(e.target.value)} />
        <textarea className="w-full border rounded p-2" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </main>
  );
}
