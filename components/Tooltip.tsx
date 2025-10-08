"use client";
import { ReactNode } from "react";

export default function Tooltip({
  text,
  children,
  align = "center",
}: {
  text: string;
  children?: ReactNode;
  align?: "start" | "center" | "end";
}) {
  const pos =
    align === "start"
      ? "left-0"
      : align === "end"
      ? "right-0"
      : "left-1/2 -translate-x-1/2";
  return (
    <span className="relative inline-flex items-center group">
      {children ?? (
        <svg
          aria-label="Info"
          role="img"
          className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-200"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-10.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9 9.75a1 1 0 112 0v4.5a1 1 0 11-2 0v-4.5z" />
        </svg>
      )}
      <span
        className={`pointer-events-none absolute z-30 top-full mt-2 w-64 rounded-lg border bg-white p-3 text-xs leading-relaxed text-gray-700 shadow-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 ${pos}`}
      >
        {text}
      </span>
    </span>
  );
}
