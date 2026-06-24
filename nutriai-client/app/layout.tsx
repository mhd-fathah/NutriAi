import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import InstallPWA from "@/components/shared/InstallPWA";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: {
    default: "NutriAI — AI-Powered Nutrition Tracker",
    template: "%s | NutriAI",
  },
  description:
    "Track your nutrition with AI. Upload meal photos, get instant calorie analysis, and receive personalized nutrition coaching powered by Gemini Vision AI.",
  keywords: ["nutrition tracker", "AI nutrition", "calorie counter", "meal tracker", "food AI"],
  authors: [{ name: "NutriAI" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NutriAI",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "NutriAI — AI-Powered Nutrition Tracker",
    description: "Track your nutrition with AI. Upload meal photos, get instant calorie analysis.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SessionProvider>
            {children}
            <InstallPWA />
            <Toaster
              position="top-right"
              richColors
              closeButton
              theme="system"
              toastOptions={{
                style: {
                  fontFamily: "Inter, sans-serif",
                  borderRadius: "12px",
                },
              }}
            />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
