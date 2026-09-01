import BroadcastForm from "./BroadcastForm";

export default function BroadcastPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Broadcast Email</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Send an announcement to board applicants, hackathon members, or everyone.</p>
      <div className="mt-6"><BroadcastForm /></div>
    </div>
  );
}
