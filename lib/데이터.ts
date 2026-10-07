// 진짜 데이터 — Supabase에서 읽는다 (설계 문서 3.5 · 4장).
// 18단계에서 가짜 데이터(샘플데이터.ts) 대신 이 파일을 쓴다.
// 표 · 칸 이름은 설계 문서 4장의 영어 이름 그대로다.

import { createClient } from "@supabase/supabase-js";

export const 창고 = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export type 수강생 = { id: number; 이름: string; 연락처: string };
export type 클래스 = {
  id: number;
  날짜: string;        // 2026-09-18
  시작: string;        // 10:00
  걸리는시간: number;  // 분
  이름: string;
  정원: number;
};
export type 신청상태 = "신청" | "출석" | "취소";
export type 신청 = { id: number; 수강생id: number; 클래스id: number; 상태: 신청상태; 신청한때: string };
export type 지난기록 = { 수강생id: number; 날짜: string; 클래스: string; 상태: "참석함" | "안 옴" };

// 「오늘」 은 한국 시간으로 센다 — 창고에 넣은 데이터도 한국 시간 기준이다 (seed.sql)
export const 오늘구하기 = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());

// 창고의 시각은 "19:30:00" — 화면에는 "19:30"
const 시각글 = (t: string) => t.slice(0, 5);

function 막힘(표: string, error: { message: string } | null) {
  if (error) throw new Error(`${표} 표를 읽지 못했습니다 — ${error.message}`);
}

export async function 데이터읽기() {
  const [수강생, 클래스, 신청, 지난] = await Promise.all([
    창고.from("students").select("id, name, phone").order("id"),
    창고.from("classes").select("id, date, start_time, minutes, name, capacity").order("date").order("start_time"),
    창고.from("signups").select("id, student_id, class_id, status, created_at").order("id"),
    창고.from("past_visits").select("student_id, date, class_name, status"),
  ]);
  막힘("students", 수강생.error);
  막힘("classes", 클래스.error);
  막힘("signups", 신청.error);
  막힘("past_visits", 지난.error);

  const 수강생들: 수강생[] = 수강생.data!.map((r) => ({ id: r.id, 이름: r.name, 연락처: r.phone }));
  const 클래스들: 클래스[] = 클래스.data!.map((r) => ({
    id: r.id,
    날짜: r.date,
    시작: 시각글(r.start_time),
    걸리는시간: r.minutes,
    이름: r.name,
    정원: r.capacity,
  }));
  const 신청들: 신청[] = 신청.data!.map((r) => ({
    id: r.id,
    수강생id: r.student_id,
    클래스id: r.class_id,
    상태: r.status,
    신청한때: r.created_at,
  }));
  const 지난기록들: 지난기록[] = 지난.data!.map((r) => ({
    수강생id: r.student_id,
    날짜: r.date,
    클래스: r.class_name,
    상태: r.status,
  }));

  // ── 세는 법 (설계 문서 4장 · 5장) — 신청 수는 적어두지 않고 센다 ──
  const 살아있는신청 = (클래스id: number) =>
    신청들.filter((a) => a.클래스id === 클래스id && a.상태 !== "취소");
  const 수강생찾기 = (id: number) => 수강생들.find((s) => s.id === id)!;

  return { 수강생들, 클래스들, 신청들, 지난기록들, 살아있는신청, 수강생찾기 };
}
