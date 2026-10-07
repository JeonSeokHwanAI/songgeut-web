"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 설계 문서 3장 — 왼쪽 메뉴 줄. 지금 있는 화면이 강조색으로 칠해진다
const 메뉴 = [
  { 이름: "오늘 클래스", 주소: "/today" },
  { 이름: "주간", 주소: "/week" },
  { 이름: "알림판", 주소: "/notice" },
];

export default function 메뉴줄() {
  const 지금주소 = usePathname();

  return (
    <nav className="w-[180px] shrink-0 border-r border-line bg-card px-3 py-5">
      <p className="mb-5 px-2 font-display text-[20px] font-bold">손끝 공방</p>
      {메뉴.map((m) => {
        const 지금화면 = 지금주소 === m.주소;
        return (
          <Link
            key={m.주소}
            href={m.주소}
            className={
              "mb-1 block rounded-lg px-3 py-2 text-[15px] " +
              (지금화면 ? "bg-accent font-medium text-white" : "text-muted hover:bg-bg")
            }
          >
            {m.이름}
          </Link>
        );
      })}
    </nav>
  );
}
