import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
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
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="flex items-center justify-between p-4 print-hidden">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </span>
                Shopping Planner
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/plan" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Plan
                </Link>
                <Link href="/recipes" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Recipes
                </Link>
              </nav>
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
              <UserButton />
            </SignedIn>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
