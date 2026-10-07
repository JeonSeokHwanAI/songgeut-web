"use client";

// 설계 문서 10장 「실시간으로 바뀐다」 (v0.5.6)
// 창고의 클래스 · 신청 · 공지가 바뀌면 지금 화면을 다시 그린다 — F5 를 누르지 않는다.
// 부담 안 되게: 바뀜이 몰려 와도 0.5초 모아 한 번만. 다시 붙을 때 · 창으로 돌아올 때도 한 번.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 창고 } from "@/lib/데이터";

export default function 실시간() {
  const router = useRouter();

  useEffect(() => {
    let 타이머: ReturnType<typeof setTimeout> | undefined;
    const 곧다시읽기 = () => {
      clearTimeout(타이머);
      타이머 = setTimeout(() => router.refresh(), 500);
    };

    const 채널 = 창고
      .channel(`웹-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "classes" }, 곧다시읽기)
      .on("postgres_changes", { event: "*", schema: "public", table: "signups" }, 곧다시읽기)
      .on("postgres_changes", { event: "*", schema: "public", table: "notices" }, 곧다시읽기)
      .subscribe((상태) => {
        // 끊겼다 다시 붙으면 그사이 놓친 것을 채운다
        if (상태 === "SUBSCRIBED") 곧다시읽기();
      });

    const 돌아옴 = () => {
      if (document.visibilityState === "visible") 곧다시읽기();
    };
    document.addEventListener("visibilitychange", 돌아옴);
    window.addEventListener("focus", 돌아옴);

    return () => {
      clearTimeout(타이머);
      document.removeEventListener("visibilitychange", 돌아옴);
      window.removeEventListener("focus", 돌아옴);
      창고.removeChannel(채널);
    };
  }, [router]);

  return null;
}
