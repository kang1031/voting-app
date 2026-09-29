"use client";

import { useFormStatus } from "react-dom";

/** 누르면 확인 창을 띄우고, 확인했을 때만 감싼 form을 제출하는 버튼 */
export function ConfirmButton({
  message,
  children,
  className,
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
