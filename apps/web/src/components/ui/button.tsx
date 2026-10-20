import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`rounded-md bg-emerald-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${className}`} {...props} />;
}