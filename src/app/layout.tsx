// app/layout.tsx
import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";
import { fetchUserSettings } from "@/lib/server/fetchUserSettings";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const adsenseAccount =
  process.env.GOOGLE_ADSENSE_ACCOUNT?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://germfx.com",
  ),

  applicationName: "GermFx",

  title: {
    default:
      "GermFx – Medication, Symptom & Health Tracking",
    template: "%s | GermFx",
  },

  description:
    "Track medications and symptoms, explore drug information, review recalls and health news, and generate personal reports with GermFx. For informational use only.",

  keywords: [
    "medication tracker",
    "symptom tracker",
    "drug information",
    "medication search",
    "drug recalls",
    "health news",
    "medication reports",
    "personal health tracking",
  ],

  creator: "GermFx",
  publisher: "GermFx",
  category: "health",

  openGraph: {
    type: "website",
    url: "/",
    siteName: "GermFx",
    title:
      "GermFx – Medication, Symptom & Health Tracking",
    description:
      "Track medications and symptoms, explore drug information, review recalls and health news, and generate personal reports with GermFx.",
    images: [
      {
        url: "public/logo/germfx-social.png",
        width: 1200,
        height: 630,
        alt: "GermFx",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title:
      "GermFx – Medication, Symptom & Health Tracking",
    description:
      "Track medications and symptoms, explore drug information, review recalls and health news, and generate personal reports with GermFx.",
    images: [
      "/germfx-social.png",
    ],
  },

  robots: {
    index: true,
    follow: true,
  },

  ...(adsenseAccount
    ? {
        other: {
          "google-adsense-account":
            adsenseAccount,
        },
      }
    : {}),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await fetchUserSettings();
  const initialTheme = settings.theme ?? "system";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={initialTheme === "dark" ? "dark" : ""}
    >
      <body
        className={`${dmSans.variable} ${dmSerif.variable} antialiased font-[family-name:var(--font-dm-sans)]`}
      >
        <ThemeProvider initialTheme={initialTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
