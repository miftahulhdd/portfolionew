import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "Miftahul Huda Amri — Web Development & Design", template: "%s · Huda" },
  description: "Portofolio, laporan praktikum, dan galeri foto Miftahul Huda Amri, mahasiswa Informatika Universitas Andalas.",
  openGraph: { type: "website", locale: "id_ID", siteName: "miftahulhdd" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1314" },
  ],
};

const themeScript = `document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript><style>{`.reveal{opacity:1!important;transform:none!important}`}</style></noscript>
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
