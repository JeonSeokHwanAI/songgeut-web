// 설계 문서 3-3 「주간」
//   1바퀴 — 표 틀
//   2바퀴 — 빈 칸을 눌러 클래스 열기 (주간표.tsx)
// 고치기 · 지우기 · 주 넘기기는 다음 바퀴.

import { connection } from "next/server";
import { 데이터읽기, 오늘구하기 } from "@/lib/데이터";
import 주간표, { type 칸클래스 } from "./주간표";

const 날짜글 = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function 이번주날짜들(오늘: string) {
  const 기준 = new Date(오늘 + "T00:00:00");
  const 월요일 = new Date(기준);
  월요일.setDate(기준.getDate() - ((기준.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(월요일);
    d.setDate(월요일.getDate() + i);
    return 날짜글(d);
  });
}

export default async function 주간() {
  await connection(); // 새로고침할 때마다 창고에서 새로 읽는다
  const 오늘 = 오늘구하기();
  const { 클래스들, 살아있는신청 } = await 데이터읽기();
  const 이번주 = 이번주날짜들(오늘);
  const 처음클래스: 칸클래스[] = 클래스들
    .filter((c) => 이번주.includes(c.날짜))
    .map((c) => ({ ...c, 신청수: 살아있는신청(c.id).length }));

  return (
    <div className="max-w-[1180px]">
      <주간표 처음클래스={처음클래스} 이번주={이번주} 오늘={오늘} />
    </div>
  );
}
