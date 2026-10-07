"use client";

import { type FormEvent, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DeleteRecipeButtonProps {
  deleteAction: () => Promise<void>;
}

export default function DeleteRecipeButton({
  deleteAction,
}: DeleteRecipeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const { t } = useLanguage();

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleting(true);
    setDeleteFailed(false);
    try {
      await deleteAction();
    } catch {
      setDeleteFailed(true);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDeleteFailed(false);
          setIsOpen(true);
        }}
        className="bg-orange-400 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-600 transition shadow-sm hover:shadow"
      >
        {t("recipe.delete")}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full transform transition-all scale-100">
            <h3 className="text-2xl font-bold text-stone-800 mb-3">
              {t("recipe.deleteConfirmTitle")}
            </h3>
            <p className="text-stone-600 mb-8 leading-relaxed">
              {t("recipe.deleteConfirmMessage")}
            </p>
            {deleteFailed && (
              <p role="alert" className="mb-6 text-red-600">
                {t("error.deleteRecipe")}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
              >
                {t("recipe.cancel")}
              </button>
              <form onSubmit={handleDelete}>
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
                >
                  {deleting ? t("recipe.deleting") : t("recipe.confirmDelete")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
