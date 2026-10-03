import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Transcendent Recursion',
  description: 'A multiverse in progress: books, sound, physics, and transmissions from the edge of the known self.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}