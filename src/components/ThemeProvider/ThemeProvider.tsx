"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

type ThemeValue = "system" | "light" | "dark";

type Props = ThemeProviderProps & {
  initialTheme?: ThemeValue;
};

export function ThemeProvider({
  children,
  initialTheme = "system",
  ...props
}: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={initialTheme}
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}