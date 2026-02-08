'use client';

import { categories } from '../constants/categories';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
          selectedCategory === null
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
            : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50'
        }`}
      >
        {t('category.all')}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
            selectedCategory === category
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
