import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: "Zeon Apparel Ltd — Healthcare Apparel for Healthcare Professionals",
    template: "%s | Zeon Apparel Ltd",
  },
  description:
    "Premium scrubs, lab coats, theatre wear and nursing footwear — designed and tailored in Lagos, Nigeria. Retail and wholesale for hospitals & clinics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
