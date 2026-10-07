// 설계 문서 3-2 「오늘 클래스」
//   1바퀴 — 숫자 네 칸 + 명단
//   2바퀴 — 이름 또는 연락처 뒷자리로 찾는 검색 (명단.tsx)
// [취소] 버튼은 만드는 순서 5번. 여기서는 만들지 않는다.

import { connection } from "next/server";
import { 데이터읽기, 오늘구하기 } from "@/lib/데이터";
import 명단, { type 명단줄 } from "./명단";
import { type 자세히 } from "./자세히칸";

const 요일글 = ["일", "월", "화", "수", "목", "금", "토"];

function 오늘날짜글(오늘: string) {
  const d = new Date(오늘 + "T00:00:00");
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${요일글[d.getDay()]}요일`;
}

export default async function 오늘클래스() {
  await connection(); // 새로고침할 때마다 창고에서 새로 읽는다
  const 오늘 = 오늘구하기();
  const { 신청들, 클래스들, 살아있는신청, 수강생찾기, 지난기록들 } = await 데이터읽기();

  const 오늘클래스들 = 클래스들
    .filter((c) => c.날짜 === 오늘)
    .sort((a, b) => a.시작.localeCompare(b.시작));

  const 오늘신청들 = 신청들
    .filter((a) => 오늘클래스들.some((c) => c.id === a.클래스id))
    .sort((a, b) => {
      const ca = 오늘클래스들.find((c) => c.id === a.클래스id)!;
      const cb = 오늘클래스들.find((c) => c.id === b.클래스id)!;
      return ca.시작.localeCompare(cb.시작) || a.id - b.id; // 시간 순, 같은 시간은 신청한 순
    });

  const 살아있는것 = 오늘신청들.filter((a) => a.상태 !== "취소");
  const 숫자들 = [
    { 값: 살아있는것.length, 이름: "오늘 오는 사람" },
    {
      값: 오늘클래스들.reduce((합, c) => 합 + c.정원, 0) - 살아있는것.length,
      이름: "남은 자리",
    },
    { 값: 오늘신청들.filter((a) => a.상태 === "출석").length, 이름: "출석 체크함" },
    { 값: 오늘클래스들.length, 이름: "오늘 클래스 수" },
  ];

  const 줄들: 명단줄[] = 오늘신청들.map((a) => {
    const 수강생 = 수강생찾기(a.수강생id);
    const 클래스 = 오늘클래스들.find((c) => c.id === a.클래스id)!;
    return {
      id: a.id,
      수강생id: a.수강생id,
      이름: 수강생.이름,
      연락처: 수강생.연락처,
      클래스: 클래스.이름,
      시작: 클래스.시작,
      상태: a.상태,
    };
  });

  // 3-2-1 자세히 보기 — 명단에 있는 사람마다 오늘 신청과 지난 기록을 모아 둔다
  const 사람들: 자세히[] = [...new Set(오늘신청들.map((a) => a.수강생id))].map((수강생id) => {
    const 수강생 = 수강생찾기(수강생id);
    return {
      수강생id,
      이름: 수강생.이름,
      연락처: 수강생.연락처,
      오늘: 오늘신청들
        .filter((a) => a.수강생id === 수강생id)
        .map((a) => {
          const c = 오늘클래스들.find((x) => x.id === a.클래스id)!;
          return { 시작: c.시작, 클래스: c.이름, 상태: a.상태 };
        }),
      지난: 지난기록들
        .filter((r) => r.수강생id === 수강생id)
        .sort((a, b) => b.날짜.localeCompare(a.날짜))
        .map((r) => {
          const [, 달, 일] = r.날짜.split("-");
          return { 날짜: `${Number(달)}월 ${Number(일)}일`, 클래스: r.클래스, 상태: r.상태 };
        }),
    };
  });

  return (
    <div className="max-w-[1180px]">
      <h1 className="font-display text-[20px] font-bold">오늘 클래스</h1>
      <p className="mb-5 text-[13px] text-muted">{오늘날짜글(오늘)}</p>

      <div className="mb-5 flex gap-3">
        {숫자들.map((n) => (
          <div key={n.이름} className="flex-1 rounded-xl border border-line bg-card px-4 py-3">
            <p className="font-display text-[32px] leading-none font-bold text-accent tabular-nums">
              {n.값}
            </p>
            <p className="mt-1 text-[13px] text-muted">{n.이름}</p>
          </div>
        ))}
      </div>

      {오늘클래스들.length === 0 ? (
        <p className="rounded-xl border border-line bg-card px-4 py-10 text-center text-muted">
          오늘은 클래스가 없습니다
        </p>
      ) : (
        <명단 줄들={줄들} 사람들={사람들} />
      )}

      <p className="mt-4 text-[13px] text-muted">
        오늘 열린 클래스 —{" "}
        {오늘클래스들
          .map((c) => `${c.시작} ${c.이름} ${살아있는신청(c.id).length}/${c.정원}`)
          .join(" · ")}
      </p>
    </div>
  );
}
