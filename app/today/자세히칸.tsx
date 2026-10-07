"use client";

// 설계 문서 3-2-1 — 이름을 누르면 열리는 오른쪽 칸

export type 오늘줄 = { 시작: string; 클래스: string; 상태: "신청" | "출석" | "취소" };
export type 기록줄 = { 날짜: string; 클래스: string; 상태: "참석함" | "안 옴" };
export type 자세히 = {
  수강생id: number;
  이름: string;
  연락처: string;
  오늘: 오늘줄[];
  지난: 기록줄[];
};

const 상태글 = { 신청: "신청", 출석: "출석", 취소: "취소됨" } as const;

export default function 자세히칸({ 사람, 닫기 }: { 사람: 자세히; 닫기: () => void }) {
  const 온횟수 = 사람.지난.length;
  const 출석횟수 = 사람.지난.filter((r) => r.상태 === "참석함").length;

  return (
    <aside className="w-[320px] shrink-0 rounded-xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-[20px] font-bold">{사람.이름}</p>
          <p className="text-[13px] text-muted tabular-nums">{사람.연락처}</p>
        </div>
        <button
          onClick={닫기}
          className="rounded-lg border border-line px-2 py-1 text-[13px] text-muted hover:border-accent hover:text-accent"
        >
          닫기
        </button>
      </div>

      <p className="mt-5 mb-2 text-[13px] text-muted">오늘</p>
      {사람.오늘.map((r, i) => (
        <p key={i} className="flex items-baseline gap-2 py-1 text-[15px]">
          <span className="tabular-nums text-accent">{r.시작}</span>
          <span className="flex-1">{r.클래스}</span>
          <span className={r.상태 === "취소" ? "text-[13px] text-cancel-pill" : "text-[13px] text-muted"}>
            {상태글[r.상태]}
          </span>
        </p>
      ))}

      <p className="mt-5 mb-2 text-[13px] text-muted">
        지난 기록{온횟수 > 0 && ` — ${온횟수}번 왔고 ${출석횟수}번 출석`}
      </p>
      {온횟수 === 0 ? (
        <p className="py-2 text-[15px] text-muted">처음 오시는 분입니다</p>
      ) : (
        사람.지난.map((r, i) => (
          <p key={i} className="flex items-baseline gap-2 py-1 text-[15px]">
            <span className="tabular-nums text-muted">{r.날짜}</span>
            <span className="flex-1">{r.클래스}</span>
            <span className="text-[13px] text-muted">{r.상태}</span>
          </p>
        ))
      )}
    </aside>
  );
}
