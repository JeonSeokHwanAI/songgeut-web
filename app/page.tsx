import { redirect } from "next/navigation";

// 주인이 들어오면 「오늘 클래스」부터 본다 (설계 문서 7장 만드는 순서 1번)
export default function Home() {
  redirect("/today");
}
