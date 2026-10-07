"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BackupSummary } from "@/lib/backup-format";
import { type FormErrorKey, getFormErrorKey } from "@/lib/form-errors";
import ConfirmationDialog from "./ConfirmationDialog";

export default function RecipeBackupPanel() {
  const { t } = useLanguage();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<BackupSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<FormErrorKey | null>(null);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/backup");
      if (!response.ok) {
        setError(getFormErrorKey(await response.json(), "error.exportBackup"));
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `recipes-backup-${new Date().toISOString().slice(0, 10)}.json.gz`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("error.exportBackup");
    } finally {
      setBusy(false);
    }
  }

  async function upload(action: "preview" | "restore") {
    if (!file || busy) return;
    setConfirm(false);
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("action", action);
      const response = await fetch("/api/backup", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) {
        setSummary(null);
        setError(getFormErrorKey(result, "error.restoreBackup"));
        return;
      }
      if (action === "preview") setSummary(result);
      else {
        setSummary(null);
        setDone(true);
        router.refresh();
      }
    } catch {
      setError("error.restoreBackup");
    } finally {
      setBusy(false);
    }
  }

  const count = (label: string, value: number) =>
    label.replace("{count}", String(value));
  return (
    <section className="mt-6 space-y-5 rounded-3xl border border-stone-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-emerald-700">
        {t("backup.title")}
      </h2>
      <p className="text-stone-600">{t("backup.description")}</p>
      <p className="text-sm text-stone-500">{t("backup.scope")}</p>
      <button
        type="button"
        disabled={busy}
        onClick={download}
        className="rounded-full bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {t("backup.download")}
      </button>
      <div className="space-y-3 border-t border-stone-100 pt-5">
        <label
          htmlFor="backup-file"
          className="block font-bold text-emerald-700"
        >
          {t("backup.file")}
        </label>
        <input
          id="backup-file"
          type="file"
          accept=".gz,application/gzip"
          disabled={busy}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setSummary(null);
            setDone(false);
            setError(null);
          }}
          className="block w-full min-w-0 text-sm text-stone-600 file:mr-3 file:rounded-full file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:font-semibold file:text-orange-700"
        />
        <p className="text-sm text-stone-500">{t("backup.limit")}</p>
        <button
          type="button"
          disabled={!file || busy}
          onClick={() => upload("preview")}
          className="rounded-full bg-orange-100 px-5 py-2.5 font-bold text-emerald-700 hover:bg-orange-200 disabled:opacity-50"
        >
          {t("backup.preview")}
        </button>
      </div>
      {summary && (
        <div className="space-y-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
          <h3 className="font-bold">{t("backup.previewTitle")}</h3>
          <ul className="space-y-1 text-sm">
            <li>{count(t("backup.newCount"), summary.newRecipes)}</li>
            <li>{count(t("backup.updateCount"), summary.updatedRecipes)}</li>
            <li>{count(t("backup.photoCount"), summary.photos)}</li>
            <li>{count(t("backup.ownerCount"), summary.reassignedRecipes)}</li>
            <li>{count(t("backup.externalCount"), summary.externalPhotos)}</li>
          </ul>
          <p className="text-sm">{t("backup.merge")}</p>
          <button
            type="button"
            disabled={busy || summary.recipes === 0}
            onClick={() => setConfirm(true)}
            className="rounded-full bg-orange-500 px-5 py-2.5 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {t("backup.restore")}
          </button>
        </div>
      )}
      {busy && (
        <output className="block text-emerald-700">{t("auth.pending")}</output>
      )}
      {done && (
        <output className="block text-emerald-700">{t("backup.done")}</output>
      )}
      {error && (
        <p role="alert" className="text-red-600">
          {t(error)}
        </p>
      )}
      <ConfirmationDialog
        isOpen={confirm}
        title={t("backup.confirmTitle")}
        message={t("backup.merge")}
        cancelLabel={t("recipe.cancel")}
        confirmLabel={t("backup.restore")}
        onCancel={() => setConfirm(false)}
        onConfirm={() => upload("restore")}
      />
    </section>
  );
}
