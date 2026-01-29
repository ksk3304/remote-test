import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NicheScout - 個人開発向けリサーチ支援",
  description: "確立ジャンル内のニッチを、レビュー不満から逆算して選び、MVPへ落とす",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
