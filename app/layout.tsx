import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/ui/AppShell";

export const metadata: Metadata = {
  title: "Dobush.kg — Платформа студенческих выборов",
  description: "Корпоративная система электронного студенческого голосования с физическим разделением реестра явки и урны бюллетеней.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased selection:bg-[#eaf1ff] selection:text-[#2566ff]">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
