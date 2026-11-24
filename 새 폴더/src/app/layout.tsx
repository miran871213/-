import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '핏체크 5kg (FitCheck) - 쇼핑몰 의류 체형별 AI 가상 피팅 및 핏 비교',
  description: '쇼핑몰 URL을 넣으면 45kg부터 95kg까지 5kg 단위 체형 모델에 의류를 가상으로 입혀보고 핏을 비교하는 AI 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
