import type { Metadata } from "next";

import "./globals.css";
import { Header } from "./components";

export const metadata: Metadata = {
  title: "Digitals",
  description: " digital platform",
};


import { ReduxProvider } from "@/store/provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <Header />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
