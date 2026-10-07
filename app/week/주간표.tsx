"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 창고 } from "@/lib/데이터";

// 설계 문서 3-3 「주간」 — 표 + 빈 칸을 눌러 클래스 열기
// 고치기 · 지우기 · 주 넘기기는 다음 바퀴.

export type 칸클래스 = {
  id: number;
  날짜: string;
  시작: string;
  걸리는시간: number;
  이름: string;
  정원: number;
  신청수: number;
};

const 요일글 = ["월", "화", "수", "목", "금", "토", "일"];
const 기본시간줄 = ["10:00", "14:00", "19:30"];

// 5장 — 숫자는 한 곳에
const 정원최소 = 6;
const 정원최대 = 10;
const 처음정원 = 8;
const 처음걸리는시간 = 120;

const 시각목록 = Array.from({ length: 26 }, (_, i) => {
  const 분 = 9 * 60 + i * 30; // 09:00 ~ 21:30
  return `${String(Math.floor(분 / 60)).padStart(2, "0")}:${String(분 % 60).padStart(2, "0")}`;
});
const 걸리는시간목록 = [30, 60, 90, 120, 150, 180];

const 날짜보기 = (날짜: string) => {
  const [, 달, 일] = 날짜.split("-");
  return `${Number(달)}월 ${Number(일)}일`;
};

type 여는창 = { 날짜: string; 시작: string; 이름: string; 걸리는시간: number; 정원: number };

export default function 주간표({
  처음클래스,
  이번주,
  오늘,
}: {
  처음클래스: 칸클래스[];
  이번주: string[];
  오늘: string;
}) {
  // 표는 늘 창고에서 온 것을 그린다 — 실시간으로 다시 읽으면 바로 바뀐다 (설계 문서 10장)
  const 클래스들 = 처음클래스;
  const router = useRouter();
  const [창, 창바꾸기] = useState<여는창 | null>(null);
  const [막힘, 막힘바꾸기] = useState<{ 칸: string; 말: string } | null>(null);

  const 시간줄 = [...new Set([...기본시간줄, ...클래스들.map((c) => c.시작)])].sort();

  const 창열기 = (날짜: string, 시작: string) => {
    막힘바꾸기(null);
    창바꾸기({ 날짜, 시작, 이름: "", 걸리는시간: 처음걸리는시간, 정원: 처음정원 });
  };

  const 열기 = async () => {
    if (!창) return;
    if (창.이름.trim() === "") return 막힘바꾸기({ 칸: "이름", 말: "클래스 이름을 적어주세요" });
    if (창.정원 < 정원최소 || 창.정원 > 정원최대)
      return 막힘바꾸기({ 칸: "정원", 말: `정원은 ${정원최소}~${정원최대}명입니다` });
    if (창.날짜 === "" ) return 막힘바꾸기({ 칸: "날짜", 말: "날짜를 골라주세요" });
    if (클래스들.some((c) => c.날짜 === 창.날짜 && c.시작 === 창.시작))
      return 막힘바꾸기({ 칸: "시작", 말: "그 시간에는 이미 클래스가 있습니다" });

    // 창고에 넣는다 — 새로고침해도 남는다 (18단계)
    const { error } = await 창고
      .from("classes")
      .insert({
        date: 창.날짜,
        start_time: 창.시작,
        minutes: 창.걸리는시간,
        name: 창.이름.trim(),
        capacity: 창.정원,
      });
    if (error) {
      // 23505 — 누르는 사이 다른 곳에서 같은 칸에 먼저 열었다 (한 칸에 하나)
      if (error.code === "23505")
        return 막힘바꾸기({ 칸: "시작", 말: "그 시간에는 이미 클래스가 있습니다" });
      return 막힘바꾸기({ 칸: "이름", 말: "저장하지 못했습니다. 잠시 뒤 다시 눌러 주세요" });
    }

    router.refresh(); // 방금 연 것을 창고에서 다시 읽어 그린다
    창바꾸기(null);
    막힘바꾸기(null);
  };

  const 지난날 = (날짜: string) => 날짜 < 오늘;

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[20px] font-bold">주간</h1>
          <p className="text-[13px] text-muted tabular-nums">
            {날짜보기(이번주[0])} — {날짜보기(이번주[6])}
          </p>
        </div>
        <button
          onClick={() => 창열기(이번주[0], 기본시간줄[0])}
          className="rounded-lg bg-accent px-4 py-2 text-[15px] font-medium text-white"
        >
          클래스 열기
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse overflow-hidden rounded-xl border border-line bg-card text-[13px]">
          <thead>
            <tr className="bg-bg text-muted">
              <th className="w-[70px] border border-line px-2 py-2 font-medium">　</th>
              {이번주.map((날짜, i) => (
                <th key={날짜} className="border border-line px-2 py-2 font-medium tabular-nums">
                  {요일글[i]} {Number(날짜.split("-")[2])}
                  {날짜 === 오늘 && <span className="ml-1 text-accent">· 오늘</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {시간줄.map((시각) => (
              <tr key={시각}>
                <td className="border border-line bg-bg px-2 py-2 text-right text-muted tabular-nums">
                  {시각}
                </td>
                {이번주.map((날짜) => {
                  const 수업 = 클래스들.find((c) => c.날짜 === 날짜 && c.시작 === 시각);
                  if (수업) {
                    const 마감 = 수업.신청수 >= 수업.정원;
                    return (
                      <td key={날짜} className="h-[54px] border border-line p-1 align-top">
                        <div
                          className={
                            "rounded-md px-2 py-1 leading-tight " +
                            (마감 ? "bg-line text-muted" : "bg-accent text-white")
                          }
                        >
                          <span className="block">{수업.이름}</span>
                          <span className="tabular-nums">
                            {마감 ? "마감" : `${수업.신청수}/${수업.정원}`}
                          </span>
                        </div>
                      </td>
                    );
                  }
                  if (지난날(날짜))
                    return <td key={날짜} className="h-[54px] border border-line bg-bg/60" />;
                  return (
                    <td key={날짜} className="h-[54px] border border-line p-0">
                      <button
                        onClick={() => 창열기(날짜, 시각)}
                        aria-label={`${날짜보기(날짜)} ${시각} 클래스 열기`}
                        className="h-full w-full hover:bg-bg"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {창 && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-black/25 p-4">
          <div className="w-[360px] rounded-xl border border-line bg-card p-5">
            <p className="font-display text-[20px] font-bold">클래스 열기</p>

            <label className="mt-4 block text-[13px] text-muted" htmlFor="창-날짜">
              날짜
            </label>
            <select
              id="창-날짜"
              value={창.날짜}
              onChange={(e) => 창바꾸기({ ...창, 날짜: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-[15px]"
            >
              {이번주.map((날짜, i) => (
                <option key={날짜} value={날짜}>
                  {요일글[i]} {날짜보기(날짜)}
                </option>
              ))}
            </select>

            <label className="mt-3 block text-[13px] text-muted" htmlFor="창-시작">
              시작
            </label>
            <select
              id="창-시작"
              value={창.시작}
              onChange={(e) => 창바꾸기({ ...창, 시작: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-[15px] tabular-nums"
            >
              {시각목록.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {막힘?.칸 === "시작" && <p className="mt-1 text-[13px] text-cancel-pill">{막힘.말}</p>}

            <label className="mt-3 block text-[13px] text-muted" htmlFor="창-걸리는시간">
              걸리는 시간
            </label>
            <select
              id="창-걸리는시간"
              value={창.걸리는시간}
              onChange={(e) => 창바꾸기({ ...창, 걸리는시간: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-[15px]"
            >
              {걸리는시간목록.map((분) => (
                <option key={분} value={분}>
                  {분 >= 60 ? `${Math.floor(분 / 60)}시간${분 % 60 ? ` ${분 % 60}분` : ""}` : `${분}분`}
                </option>
              ))}
            </select>

            <label className="mt-3 block text-[13px] text-muted" htmlFor="창-이름">
              클래스 이름
            </label>
            <input
              id="창-이름"
              value={창.이름}
              onChange={(e) => 창바꾸기({ ...창, 이름: e.target.value })}
              placeholder="예) 도자기 물레"
              className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-[15px] placeholder:text-muted"
            />
            {막힘?.칸 === "이름" && <p className="mt-1 text-[13px] text-cancel-pill">{막힘.말}</p>}

            <label className="mt-3 block text-[13px] text-muted" htmlFor="창-정원">
              정원 ({정원최소}~{정원최대}명)
            </label>
            <input
              id="창-정원"
              type="number"
              value={창.정원}
              onChange={(e) => 창바꾸기({ ...창, 정원: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-[15px] tabular-nums"
            />
            {막힘?.칸 === "정원" && <p className="mt-1 text-[13px] text-cancel-pill">{막힘.말}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  창바꾸기(null);
                  막힘바꾸기(null);
                }}
                className="rounded-lg border border-line px-4 py-2 text-[15px] text-muted"
              >
                닫기
              </button>
              <button
                onClick={열기}
                className="rounded-lg bg-accent px-4 py-2 text-[15px] font-medium text-white"
              >
                열기
              </button>
            </div>
          </div>
        </div>
      )}

      {클래스들.length === 0 && (
        <p className="mt-4 text-[13px] text-muted">
          이번 주에 열린 클래스가 없습니다. 빈 칸을 눌러 여세요
        </p>
      )}
    </>
  );
}
