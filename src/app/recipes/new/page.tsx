// src/app/recipes/new/page.tsx
'use client';

import Link from 'next/link';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { categories } from '../../../constants/categories';

export default function NewRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cookMinutes, setCookMinutes] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
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
        description,
        cookMinutes: cookMinutes ? parseInt(cookMinutes) : null,
        category,
        ingredients,
        steps,
        imageUrl,
        sourceUrl,
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
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition-colors">
          &larr; Back to recipes
        </Link>
      </div>
      <h1 className="text-4xl font-extrabold text-emerald-700 mb-8">New Recipe</h1>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

      <form onSubmit={onSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">Title</label>
              <input className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all" placeholder="e.g. Grandma's Apple Pie" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={50} />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">Description</label>
              <textarea className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white" placeholder="A short description of the recipe" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={50} />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">Source URL</label>
              <input type="url" className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white" placeholder="https://example.com/recipe" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-2">Cook Time (minutes)</label>
                <input type="number" className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white" placeholder="e.g. 45" value={cookMinutes} onChange={(e) => setCookMinutes(e.target.value)} min="1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-2">Category</label>
                <select
                  className="w-full border border-stone-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">Ingredients</label>
              <textarea className="w-full border border-stone-200 rounded-xl p-3 h-32 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white" placeholder="One ingredient per line" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">Steps</label>
              <textarea className="w-full border border-stone-200 rounded-xl p-3 h-40 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white" placeholder="Describe the cooking process..." value={steps} onChange={(e) => setSteps(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="sticky top-8">
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                Image
              </label>
              <div className="aspect-square w-full overflow-hidden rounded-3xl shadow-xl bg-stone-100 mb-6">
                {imageUrl ? <img src={imageUrl} alt="Preview" className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-stone-300 text-6xl">🍽️</div>}
              </div>
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
              />
              {uploading && <p className="mt-2 text-sm text-orange-600 font-medium animate-pulse">Uploading image...</p>}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-stone-100 mt-8">
          <button className="w-full px-6 py-4 rounded-xl bg-orange-400 text-white font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading || uploading}>
            {loading ? 'Creating Recipe...' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </main>
  );
}
