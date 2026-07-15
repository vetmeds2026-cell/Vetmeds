import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const jost = localFont({
  src: [
    {
      path: '../public/fonts/Jost-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Jost-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Jost-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Jost-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-jost',
});

export const metadata = {
  metadataBase: new URL("https://www.thevetmeds.in"),

  title: {
    default: "VetMeds | AI-Powered Veterinary Healthcare Platform",
    template: "%s | VetMeds",
  },

  description:
    "VetMeds is an AI-powered veterinary healthcare platform helping pet owners, livestock farmers, veterinarians and animal welfare organizations through AI symptom analysis, Emergency SOS, Vet Locator, Digital Health Records and Livestock AI.",

  keywords: [
    "VetMeds",
    "AI Veterinary",
    "Veterinary Healthcare",
    "Pet Healthcare",
    "Animal Healthcare",
    "Pet Symptom Checker",
    "Emergency SOS",
    "Vet Locator",
    "Digital Health Records",
    "Livestock AI",
    "Veterinarian",
    "Dog Care",
    "Cat Care",
    "Pet Health",
    "Animal Welfare",
    "India",
  ],

  authors: [{ name: "Saeed Sande" }],

  creator: "VetMeds",

  publisher: "VetMeds",

  alternates: {
    canonical: "https://www.thevetmeds.in",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.thevetmeds.in",
    title: "VetMeds | AI-Powered Veterinary Healthcare Platform",
    description:
      "Making animal healthcare accessible through AI-powered technology.",

    siteName: "VetMeds",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VetMeds",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "VetMeds | AI-Powered Veterinary Healthcare Platform",
    description:
      "Making animal healthcare accessible through AI-powered technology.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

import NextTopLoader from 'nextjs-toploader';
import { ToastProvider } from "@/components/ToastProvider";
import NetworkStatusHandler from "@/components/NetworkStatusHandler";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`bg-background text-foreground ${jost.className} ${jost.variable} antialiased`}
      >
        <NextTopLoader 
          color="#1b3a34"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #1b3a34,0 0 5px #1b3a34"
        />
        <NetworkStatusHandler />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
