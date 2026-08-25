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
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Login</h1>
      <Card className="mt-6" style={{ animation:"fadeUp 260ms var(--ease-out) both" }}>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Email</Label><Input value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          {err && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{err}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading?"Signing in...":"Sign In"}</Button>
        </form>
      </Card>
    </div>
  );
}
