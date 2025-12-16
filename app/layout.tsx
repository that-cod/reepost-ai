import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reepost.ai - AI-Powered LinkedIn Content Generator",
  description: "Generate viral LinkedIn posts with AI. Create, schedule, and manage professional content effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto bg-background p-6">
                {children}
              </main>
            </div>
          </div>
        </Providers>
        <ToasterProvider />
      </body>
    </html>
  );
}

