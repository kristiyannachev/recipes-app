'use client';

import { useState } from 'react';

interface DeleteRecipeButtonProps {
  deleteAction: () => Promise<void>;
}

export default function DeleteRecipeButton({ deleteAction }: DeleteRecipeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-orange-400 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-600 transition shadow-sm hover:shadow"
      >
        Delete
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full transform transition-all scale-100">
            <h3 className="text-2xl font-bold text-stone-800 mb-3">Delete Recipe?</h3>
            <p className="text-stone-600 mb-8 leading-relaxed">
              Are you sure you want to delete this recipe? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <form action={deleteAction}>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Confirm Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
