import type { Metadata } from "next";
import { Noto_Sans_KR, Gowun_Dodum } from "next/font/google";
import "./globals.css";
import 메뉴줄 from "./메뉴줄";
import 실시간 from "./실시간";

const 본문글꼴 = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const 제목글꼴 = Gowun_Dodum({
  variable: "--font-gowun-dodum",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "손끝 공방 — 클래스 예약 관리",
  description: "공방 원데이 클래스를 신청받고 오늘 누가 오는지 본다",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${본문글꼴.variable} ${제목글꼴.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <div className="flex min-h-screen">
          <메뉴줄 />
          <실시간 />
          <main className="min-w-0 flex-1 px-8 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
