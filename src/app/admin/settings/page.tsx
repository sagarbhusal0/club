import { db } from "@/db";
import { settings, boardPositions } from "@/db/schema";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  let s: Record<string,string> = {};
  let positions: { id:string; name:string; isActive:boolean; description:string|null }[] = [];
  try {
    const rows = await db.select().from(settings);
    s = Object.fromEntries(rows.map(r=>[r.key,r.value]));
    positions = await db.select().from(boardPositions);
  } catch {}
  return (
    <div>
      <h1 className="text-xl font-bold">Settings</h1>
      <div className="mt-6"><SettingsForm initial={s} positions={positions} /></div>
    </div>
  );
}
