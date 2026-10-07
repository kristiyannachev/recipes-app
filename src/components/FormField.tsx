import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

export default function FormField({
  label,
  htmlFor,
  children,
}: FormFieldProps) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-bold text-emerald-700 mb-2"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export const formControlClassName =
  "w-full border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white";
