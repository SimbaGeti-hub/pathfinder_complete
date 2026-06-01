import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import GoogleNameModal from "./components/GoogleNameModal";

export const metadata: Metadata = {
  title: "Pathfinder — AI Career Coach",
  description: "Your AI-powered career compass. Discover your path, build your skills, land your dream career.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧭</text></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            {/* Global Google name modal — shows whenever pendingGoogleUser is set */}
            <GoogleNameModal />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { fontFamily: "'DM Sans', sans-serif", borderRadius: '12px' },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
