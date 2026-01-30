import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PPOP DB Manager - 고객 연락처 관리',
  description: '고객 연락처를 관리하고, 컨택 이력을 추적하고, 콜드메일을 쉽게 발송하세요. CSV/Excel에서 가져오기 지원.',
  keywords: ['고객 관리', '연락처 관리', '콜드메일', 'CRM', '데스크탑 앱'],
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'PPOP DB Manager',
    description: '고객 연락처 관리 데스크탑 애플리케이션',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
