'use client';

import Link from 'next/link';
import ImageUploadPreview from '@/components/ImageUploadPreview';
import { categories } from '@/constants/categories';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Recipe } from '@prisma/client';

interface RecipeFormProps {
  recipe?: Recipe;
  action: (formData: FormData) => Promise<void>;
}

export default function RecipeForm({ recipe, action }: RecipeFormProps) {
  const { t } = useLanguage();
  const isEdit = !!recipe;

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href={isEdit ? `/recipes/${recipe.id}` : '/'}
          className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition-colors"
        >
          &larr; {t('form.back')}
        </Link>
      </div>
      <h1 className="text-4xl font-extrabold text-emerald-700 mb-8">
        {isEdit ? t('form.editTitle').replace('{title}', recipe.title) : t('form.newTitle')}
      </h1>
      <form
        action={action}
        className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                {t('form.title')}
              </label>
              <input
                type="text"
                name="title"
                defaultValue={recipe?.title}
                required
                maxLength={50}
                className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                {t('form.description')}
              </label>
              <textarea
                name="description"
                defaultValue={recipe?.description || ''}
                rows={3}
                maxLength={50}
                className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                {t('form.sourceUrl')}
              </label>
              <input
                type="url"
                name="sourceUrl"
                defaultValue={(recipe as any)?.sourceUrl || ''}
                className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-2">
                  {t('form.cookTime')}
                </label>
                <input
                  type="number"
                  name="cookMinutes"
                  defaultValue={recipe?.cookMinutes || ''}
                  min="1"
                  className="w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-2">
                  {t('form.category')}
                </label>
                <select
                  name="category"
                  defaultValue={(recipe as any)?.category || ''}
                  className="w-full border border-stone-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
                >
                  <option value="">{t('form.selectCategory')}</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                {t('form.ingredients')}
              </label>
              <textarea
                name="ingredients"
                defaultValue={recipe?.ingredients}
                required
                rows={8}
                className="w-full border border-stone-200 rounded-xl p-3 h-32 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-emerald-700 mb-2">
                {t('form.steps')}
              </label>
              <textarea
                name="steps"
                defaultValue={recipe?.steps}
                required
                rows={10}
                className="w-full border border-stone-200 rounded-xl p-3 h-40 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <ImageUploadPreview initialImageUrl={recipe?.imageUrl} />
          </div>
        </div>
        <div className="pt-8 border-t border-stone-100 mt-8 flex justify-end gap-4">
          <Link
            href={isEdit ? `/recipes/${recipe.id}` : '/'}
            className="px-6 py-3 rounded-xl bg-stone-100 text-stone-700 font-bold text-lg hover:bg-stone-200 transition-all"
          >
            {t('recipe.cancel')}
          </Link>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {isEdit ? t('form.save') : t('form.create')}
          </button>
        </div>
      </form>
    </main>
  );
}
