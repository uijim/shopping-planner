import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { NavLinks } from "@/components/nav-links";
import { ThemeProvider } from "@/components/theme-provider";
import { ShoppingCart } from "lucide-react";
import { UserMenu } from "@/components/user-menu";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shopping Planner",
  description: "Plan your shopping lists and meals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <header className="flex items-center justify-between p-4 print-hidden">
            <div className="flex items-center gap-2 md:gap-8">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-xl">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </span>
                <span className="hidden sm:inline">Shopping Planner</span>
              </Link>
              <NavLinks />
            </div>
            <div className="flex gap-4">
              <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">Sign in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserMenu />
            </SignedIn>
            </div>
          </header>
          {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
