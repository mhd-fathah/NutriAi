import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "NutriAI — AI-Powered Nutrition Tracker",
    template: "%s | NutriAI",
  },
  description:
    "Track your nutrition with AI. Upload meal photos, get instant calorie analysis, and receive personalized nutrition coaching powered by Gemini Vision AI.",
  keywords: ["nutrition tracker", "AI nutrition", "calorie counter", "meal tracker", "food AI"],
  authors: [{ name: "NutriAI" }],
  openGraph: {
    title: "NutriAI — AI-Powered Nutrition Tracker",
    description: "Track your nutrition with AI. Upload meal photos, get instant calorie analysis.",
    type: "website",
  },
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
          {children}
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
        </ThemeProvider>
      </body>
    </html>
  );
}
