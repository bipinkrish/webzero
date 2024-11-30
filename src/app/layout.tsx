import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";

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
      <body className="antialiased overflow-hidden">
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        > */}
        <main>{children}</main>
        <Toaster />
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
