import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BackToListLink } from "@/app/back-to-list-link";
import { isOperator } from "@/lib/operator";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "운영자 로그인 · 투표 앱" };

export default async function LoginPage() {
  if (await isOperator()) redirect("/admin");

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <BackToListLink />
      <h1 className="text-xl font-bold">운영자 로그인</h1>
      <LoginForm />
    </div>
  );
}
