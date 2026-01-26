// src/app/recipes/new/page.tsx
'use client';

import Link from 'next/link';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { categories } from '../../../constants/categories';

export default function NewRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [cookMinutes, setCookMinutes] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: '',
        cookMinutes: cookMinutes ? parseInt(cookMinutes) : null,
        category,
        ingredients,
        steps,
        imageUrl,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? 'Failed to create recipe');
      return;
    }

    router.push('/');
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Image upload failed');
      }

      const data = await res.json();
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/" className="text-green-600 hover:underline">
          &larr; Back to recipes
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">New Recipe</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border rounded p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" className="w-full border rounded p-2" placeholder="Cook Time (minutes)" value={cookMinutes} onChange={(e) => setCookMinutes(e.target.value)} />
          <select
            className="w-full border rounded p-2 bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <textarea className="w-full border rounded p-2 h-32" placeholder="Ingredients (one per line)" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
        <textarea className="w-full border rounded p-2 h-40" placeholder="Steps" value={steps} onChange={(e) => setSteps(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Image
          </label>
          <input
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
          {uploading && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
          {imageUrl && <img src={imageUrl} alt="Preview" className="mt-4 w-full h-auto rounded-lg object-cover" />}
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 transition-colors" disabled={loading || uploading}>
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </main>
  );
}
