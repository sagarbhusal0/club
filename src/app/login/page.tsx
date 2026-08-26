"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Button, Card } from "@/components/ui";

export default function LoginPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent){
    e.preventDefault(); setErr(""); setLoading(true);
    const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
    const j=await r.json();
    if(!r.ok) { setErr(j.error||"Login failed"); setLoading(false); return; }
    router.push(j.role==="ADMIN" ? "/admin" : "/dashboard");
  }
  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-16">
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Login</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Board members and admins — sign in to continue.</p>
      <Card className="mt-6" style={{ animation:"fadeUp 260ms var(--ease-out) both" }}>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" inputMode="email" autoComplete="email" enterKeyHint="next" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" enterKeyHint="done" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" /></div>
          {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900" role="alert">{err}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading?"Signing in...":"Sign In"}</Button>
        </form>
      </Card>
    </div>
  );
}
