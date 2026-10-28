import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#042f2e",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Vishwakarma Atta Chakki - Pure Fresh Flour",
  description: "100% Pure, Stone Milled Fresh Chakki Atta delivered to your doorstep.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vishwakarma",
  },
};

import { CartProvider } from "@/context/CartContext";
import { OrderProvider } from "@/context/OrderContext";
import { LanguageProvider } from "@/context/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <OrderProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </OrderProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
