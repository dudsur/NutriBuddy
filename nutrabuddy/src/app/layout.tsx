import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { DarkModeSync } from "@/components/DarkModeSync";

export const metadata: Metadata = {
  title: "NutraBuddy",
  description: "Your Wellness Companion",
};

const darkModeScript = `
(function(){
  try {
    var s = localStorage.getItem('nutrabuddy-wellness');
    var isDark = false;
    var textSize = 'medium';
    if (s) {
      var d = JSON.parse(s);
      isDark = !!(d.state && d.state.darkMode) || !!d.darkMode;
      textSize = (d.state && d.state.textSize) || d.textSize || 'medium';
    }
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    ['text-size-small','text-size-medium','text-size-large'].forEach(function(c){ document.documentElement.classList.remove(c); });
    document.documentElement.classList.add('text-size-' + textSize);
    document.documentElement.style.fontSize = textSize === 'small' ? '8px' : textSize === 'large' ? '20.8px' : '16px';
  } catch (e) {
    document.documentElement.classList.remove('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
      </head>
      <body className="min-h-screen antialiased bg-[var(--background)] text-[var(--foreground)]" suppressHydrationWarning>
        <DarkModeSync />
        {children}
      </body>
    </html>
  );
}