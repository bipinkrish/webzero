import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { AppSidebar } from "@/webzero/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "@/context/SessionContext";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased overflow-hidden">
        <SessionProvider>
          <SidebarProvider>
            <ThemeProvider>
              <AppSidebar />
              <main style={{ width: "100%" }}>{children}</main>
              <Toaster />
            </ThemeProvider>
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
