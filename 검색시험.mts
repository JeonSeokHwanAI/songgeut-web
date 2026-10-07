import { 찾기, type 명단줄 } from "./app/today/명단";
import { 신청들, 클래스들, 수강생찾기, 클래스찾기, 오늘 } from "./lib/샘플데이터";

const 줄들: 명단줄[] = 신청들
  .filter((a) => 클래스찾기(a.클래스id).날짜 === 오늘)
  .map((a) => {
    const s = 수강생찾기(a.수강생id);
    const c = 클래스찾기(a.클래스id);
    return { id: a.id, 수강생id: a.수강생id, 이름: s.이름, 연락처: s.연락처, 클래스: c.이름, 시작: c.시작, 상태: a.상태 };
  });

console.log("오늘 명단 줄 수 —", 줄들.length);
for (const 말 of ["도자기", "가죽", "0003", "0001", "김", "9999"]) {
  const 결과 = 찾기(줄들, 말);
  const 이름들 = [...new Set(결과.map((r) => `${r.이름}(${r.연락처})`))];
  console.log(`「${말}」 → ${결과.length}줄 : ${이름들.join(", ") || "찾는 분이 없습니다"}`);
}
