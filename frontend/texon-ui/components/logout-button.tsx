"use client";

import { logoutAction } from "@/auth/actions/logout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    localStorage.removeItem("django_access_token");
    localStorage.removeItem("django_refresh_token");
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <Button onClick={handleLogout} className={className}>
      {children ?? "Logout"}
    </Button>
  );
}