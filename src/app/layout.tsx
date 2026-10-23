import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { JsonLd } from "@/components/ui/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { getContent } from "@/lib/server/content";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Display face: Montserrat (brand guidelines 06 — Typography: "Display: Montserrat / Inter, Bold").
const display = Montserrat({
  variable: "--font-display-face",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const baseMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Technology & Software Solutions`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "custom software development",
    "web development",
    "mobile app development",
    "iOS development",
    "full-stack engineering",
    "QA and testing",
    "application security",
    "UI/UX design",
    "brand identity",
    "digital strategy",
    "technical SEO",
    "analytics",
    "LAMHA Technologies",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    title: `${site.name} | Technology & Software Solutions`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Technology & Software Solutions`,
    description: site.description,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  // One canonical favicon for Search (Google uses a single favicon per host): the official mark as a
  // 192px PNG (multiple of 48, square). /favicon.ico is served statically for legacy browser requests.
  icons: {
    icon: [{ url: "/logo-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/apple-icon",
  },
  authors: [{ name: site.legalName, url: site.url }],
  creator: site.legalName,
  publisher: site.legalName,
  category: "technology",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
  },
};

/** The site description is owner-editable (portal → Website content); everything else is fixed. */
export async function generateMetadata(): Promise<Metadata> {
  const { site: live } = await getContent();
  return {
    ...baseMetadata,
    description: live.description,
    openGraph: { ...baseMetadata.openGraph, description: live.description },
    twitter: { ...baseMetadata.twitter, description: live.description },
  };
}

export const viewport: Viewport = {
  themeColor: "#fbfcfe",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const content = await getContent();
  return (
    // suppressHydrationWarning: the inline script below (and the preloader/smooth scroll) add classes to <html> before hydration.
    <html lang="en" className={`${inter.variable} ${mono.variable} ${display.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Marks JS availability so scroll-reveal styles only apply when they can be undone. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-full flex-col">
        <JsonLd data={[organizationJsonLd(content), websiteJsonLd()]} />
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  );
}
