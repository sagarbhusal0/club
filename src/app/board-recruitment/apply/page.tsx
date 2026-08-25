import { db } from "@/db";
import { boardPositions } from "@/db/schema";
import { eq } from "drizzle-orm";
import ApplyForm from "./ApplyForm";

export default async function ApplyPage() {
  let positions: { id:string; name:string }[] = [];
  try {
    positions = await db.select({ id: boardPositions.id, name: boardPositions.name }).from(boardPositions).where(eq(boardPositions.isActive,true));
  } catch {}
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Board Application</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">All fields marked * are required. Takes ~5 minutes.</p>
      <div className="mt-6"><ApplyForm positions={positions} /></div>
    </div>
  );
}
