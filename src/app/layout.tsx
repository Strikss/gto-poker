import type { Metadata } from "next";
import { geistSans, geistMono } from "@/styles/fonts";

import clsx from "clsx";
import { PropsWithChildren } from "react";

import "@/styles/tailwind.css";
import BackgroundMedia from "./(root)/blocks/BackgroundMedia";
import { QueryProvider } from "@/libs/QueryProvider";

export const metadata: Metadata = {
  title: ``,
  description: "",
};

function BaseLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body
        className={clsx(geistSans.variable, geistMono.variable, "antialiased")}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

function RootLayout({ children }: PropsWithChildren) {
  return (
    <BaseLayout>
      <BackgroundMedia />
      {/* <Header /> */}
      <main>{children}</main>
    </BaseLayout>
  );
}

export default RootLayout;
