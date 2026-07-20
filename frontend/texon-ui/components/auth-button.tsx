"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";
import { getSessionClaims } from "@/auth/actions/session";
import { useEffect, useState } from "react";

export function AuthButton() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionClaims().then((claims) => {
      if (claims) setEmail(claims.email)
      setLoading(false)
    })
  }, [])

  if (loading) return null

  if (email) {
    return (
      <div className="flex items-center gap-4">
        Hey, {email}!
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
