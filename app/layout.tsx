import type { Metadata } from "next";
import React from "react";

import "./globals.css";
import { Header } from "./components";

export const metadata: Metadata = {
  title: "Digitals",
  description: " digital platform",
};
import { ToastProvider } from "@/context/ToastContext";
import { ReduxProvider } from "@/store/provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ReduxProvider>
          <ToastProvider>
            <Header />
            {children}
          </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
