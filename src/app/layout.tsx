import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { siteConfig } from "@/content/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "SEO Consultancy for UK and India Growth Teams",
    template: "%s | sayseo.com",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "SEO consultancy",
  alternates: {
    canonical: siteConfig.url,
  },
  keywords: [
    "SEO consultancy UK",
    "SEO services India",
    "technical SEO audit",
    "keyword research services",
    "competitor analysis SEO",
    "local SEO consulting",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "SEO Consultancy for UK and India Growth Teams",
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium SEO Consultancy for UK & India",
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-50 text-slate-950">{children}</body>
    </html>
  );
}
