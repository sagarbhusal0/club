"use client";
import { useState } from "react";
import { unlockFinalSubmission } from "@/actions/hackathon";
import { Button } from "@/components/ui";
export default function FinalUnlockButton({ id }: { id:string }) {
  const [done,setDone]=useState(false);const [loading,setLoading]=useState(false);
  return done ? <p className="text-sm font-medium text-emerald-600">Unlocked - team can resubmit.</p> : <Button onClick={async()=>{setLoading(true);await unlockFinalSubmission(id);setLoading(false);setDone(true);}} disabled={loading} className="bg-white text-zinc-900 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100">{loading?"Unlocking...":"Unlock final submission"}</Button>;
}
