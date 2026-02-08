'use client';

import ShoppingCartIcon from './ShoppingCartIcon';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NavBar() {
  const { language, setLanguage } = useLanguage();

  return (
    <nav className="fixed top-6 right-6 z-50 flex items-center gap-3">
      <div className="bg-white rounded-full shadow-xl border border-stone-100 p-1 flex">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
            language === 'en' ? 'bg-orange-400 text-white' : 'text-stone-500 hover:bg-stone-100'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('bg')}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
            language === 'bg' ? 'bg-orange-400 text-white' : 'text-stone-500 hover:bg-stone-100'
          }`}
        >
          BG
        </button>
      </div>
      <div className="bg-white rounded-full shadow-xl border border-stone-100">
        <ShoppingCartIcon />
      </div>
    </nav>
  );
}