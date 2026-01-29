import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PPOP DB Manager - Customer Contact Management',
  description: 'Manage your customer contacts, track communication history, and send cold emails with ease. Import from CSV/Excel and stay organized.',
  keywords: ['customer management', 'contact management', 'cold email', 'CRM', 'desktop app'],
  openGraph: {
    title: 'PPOP DB Manager',
    description: 'Customer contact management desktop application',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
