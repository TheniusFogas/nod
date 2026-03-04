// Deployment trigger: 2026-03-04T21:45
import type { Metadata } from "next";
import "./globals.css";
import dbConnect from "@/lib/db";
import Settings from "@/models/Settings";
import { SettingsProvider } from "@/components/SettingsProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://nodflo.vercel.app"),
  title: {
    default: "NOD FLOW — Contemporary Art Gallery",
    template: "%s | NOD FLOW",
  },
  description:
    "NOD FLOW is a contemporary art gallery presenting groundbreaking exhibitions and supporting emerging and established artists.",
  keywords: ["contemporary art", "gallery", "exhibitions", "artists", "Bucharest", "NOD FLOW"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.nodflo.com",
    siteName: "NOD FLOW",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await dbConnect();
  const settings = await Settings.findOne({}).lean() as any;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {settings?.googleVerification && (
          <meta name="google-site-verification" content={settings.googleVerification} />
        )}
        {settings?.customHeadScripts && (
          <script dangerouslySetInnerHTML={{ __html: settings.customHeadScripts }} />
        )}
      </head>
      <body>
        <SettingsProvider settings={settings}>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
