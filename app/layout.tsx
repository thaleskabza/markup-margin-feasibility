// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markup & Margin Feasibility",
  description: "Quickly compute markup, margin, and a 12-month projection for goods or services."
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <main className="max-w-5xl mx-auto p-6 space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              Markup & Margin Feasibility
            </h1>

          </header>
          {children}
          <footer className="text-xs text-gray-500 py-8">
            Built for entrepreneurs. Defaults set for South Africa (ZAR, 15% VAT).
          </footer>
        </main>
      </body>
    </html>
  );
}