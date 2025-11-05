import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novel-Like - AI Writing Assistant",
  description: "Write and extend your stories with AI assistance via OpenRouter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
