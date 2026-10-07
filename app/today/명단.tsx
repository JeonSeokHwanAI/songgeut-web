"use client";

import { useState } from "react";
import 자세히칸, { type 자세히 } from "./자세히칸";

// 설계 문서 3-2 — 검색 + 명단, 3-2-1 — 이름을 누르면 오른쪽 칸
export type 명단줄 = {
  id: number;
  수강생id: number;
  이름: string;
  연락처: string;
  클래스: string;
  시작: string;
  상태: "신청" | "출석" | "취소";
};

export function 찾기(줄들: 명단줄[], 찾는말: string) {
  const 말 = 찾는말.trim();
  if (말 === "") return 줄들;
  const 숫자만 = 말.replace(/[^0-9]/g, "");
  // 이름 · 연락처 뒷자리 · 클래스 이름 — 셋 중 하나만 맞아도 남는다 (설계 문서 3-2)
  return 줄들.filter(
    (r) =>
      r.이름.includes(말) ||
      r.클래스.includes(말) ||
      // 연락처는 **뒷자리**로 찾는다 — 가운데에 든 숫자는 세지 않는다
      (숫자만 !== "" && r.연락처.replace(/[^0-9]/g, "").endsWith(숫자만))
  );
}

export default function 명단({ 줄들, 사람들 }: { 줄들: 명단줄[]; 사람들: 자세히[] }) {
  const [찾는말, 찾는말바꾸기] = useState("");
  const [고른사람, 고른사람바꾸기] = useState<number | null>(null);
  const 보일줄 = 찾기(줄들, 찾는말);
  const 열린사람 = 사람들.find((p) => p.수강생id === 고른사람) ?? null;

  const 이름누름 = (수강생id: number) =>
    고른사람바꾸기((지금) => (지금 === 수강생id ? null : 수강생id));

  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <input
          id="이름검색"
          value={찾는말}
          onChange={(e) => 찾는말바꾸기(e.target.value)}
          placeholder="이름 · 연락처 뒷자리 · 클래스"
          className="mb-3 w-[280px] rounded-lg border border-line bg-card px-3 py-2 text-[15px] placeholder:text-muted focus:border-accent focus:outline-none"
        />

        <table className="w-full overflow-hidden rounded-xl border border-line bg-card text-[15px]">
          <thead>
            <tr className="bg-bg text-[13px] text-muted">
              <th className="w-[60px] px-3 py-2 text-left font-medium">출석</th>
              <th className="px-3 py-2 text-left font-medium">이름</th>
              <th className="px-3 py-2 text-left font-medium">연락처</th>
              <th className="px-3 py-2 text-left font-medium">클래스</th>
              <th className="w-[90px] px-3 py-2 text-left font-medium">시간</th>
              <th className="w-[90px] px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {보일줄.length === 0 ? (
              <tr className="border-t border-line">
                <td colSpan={6} className="px-3 py-10 text-center text-muted">
                  찾는 분이 없습니다
                </td>
              </tr>
            ) : (
              보일줄.map((r) => {
                const 취소됨 = r.상태 === "취소";
                const 고름 = r.수강생id === 고른사람;
                return (
                  <tr
                    key={r.id}
                    className={
                      "border-t border-line " +
                      (취소됨 ? "bg-cancel-bg text-cancel-text " : "") +
                      (고름 ? "outline outline-2 -outline-offset-2 outline-accent" : "")
                    }
                  >
                    <td className="px-3 py-2">
                      <span
                        className={
                          "inline-grid h-[18px] w-[18px] place-items-center rounded border text-[12px] text-white " +
                          (r.상태 === "출석"
                            ? "border-accent bg-accent"
                            : "border-line " + (취소됨 ? "opacity-40" : ""))
                        }
                      >
                        {r.상태 === "출석" ? "✓" : ""}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => 이름누름(r.수강생id)}
                        className="rounded px-1 underline-offset-4 hover:underline focus:outline-none focus-visible:underline"
                      >
                        {r.이름}
                      </button>
                    </td>
                    <td className="px-3 py-2 tabular-nums">{r.연락처}</td>
                    <td className="px-3 py-2">{r.클래스}</td>
                    <td className="px-3 py-2 tabular-nums">{r.시작}</td>
                    <td className="px-3 py-2 text-right">
                      {취소됨 && (
                        <span className="rounded-full bg-cancel-pill px-2 py-[2px] text-[13px] text-white">
                          취소됨
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {열린사람 && <자세히칸 사람={열린사람} 닫기={() => 고른사람바꾸기(null)} />}
    </div>
  );
}
