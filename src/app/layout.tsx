import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site-config";

const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "ThumbStop | Digital Marketing Agency in Savar, Dhaka", template: "%s | ThumbStop" },
  description: site.description,
  openGraph: {
    title: "ThumbStop | Digital Marketing Agency",
    description: site.description,
    type: "website",
    images: ["/brand/thumbstop-logo.png"],
  },
  icons: { icon: "/brand/thumbstop-logo.png" },
};

export const viewport: Viewport = { themeColor: "#05070B", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
