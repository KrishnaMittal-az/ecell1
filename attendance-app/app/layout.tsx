import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { TaskManagementProvider } from "@/components/providers/task-management-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Cell Attendance & MOM Management",
  description: "Attendance tracking and meeting management system for E-Cell",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Auth0Provider>
          <AuthProvider>
            <TaskManagementProvider>
              {children}
            </TaskManagementProvider>
          </AuthProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
