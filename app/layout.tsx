import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "투표 앱",
  description: "질문에 선택지 하나를 골라 투표하고 결과를 보는 간단한 투표 앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              투표 앱
            </Link>
            <Link href="/admin" className="text-sm text-slate-500 hover:underline">
              운영자
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
