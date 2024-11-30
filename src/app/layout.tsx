import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "webzero",
  description: "Generate webpages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: "var exports = {};" }} />
      </head>
      <body className="antialiased overflow-hidden">{children}</body>
    </html>
  );
}
