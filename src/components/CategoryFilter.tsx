import { categories } from '../constants/categories';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
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
        All
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
