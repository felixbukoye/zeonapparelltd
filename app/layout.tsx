import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { OfflineWatcher, Toaster, WhatsAppFloat } from "@/components/ui";

export const metadata: Metadata = {
  title: {
    default: "ZEON Healthcare Apparels — Fitted, Made-to-Order Workwear",
    template: "%s | ZEON Healthcare Apparels",
  },
  description:
    "Made-to-order scrubs, lab coats and theatre wear for Nigerian healthcare professionals. Outfit your team or shop as an individual — fitted, never boxy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AppProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloat />
          <OfflineWatcher />
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
