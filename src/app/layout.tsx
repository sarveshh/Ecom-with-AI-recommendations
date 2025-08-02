import CartButton from "@/components/CartButton";
import CartSidebar from "@/components/CartSidebar";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Powered E-Commerce",
  description: "Modern e-commerce platform with AI recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        
        {/* Cart Components */}
        <CartSidebar />
        
        {/* Floating Cart Button */}
        <div className="fixed bottom-6 right-6 z-30">
          <CartButton />
        </div>
      </body>
    </html>
  );
}
