import Link from "next/link";

export const metadata = { title: "Terms of Service — SIXTY" };

export default function Terms() {
  return (
    <main className="mx-auto max-w-app px-5 py-10">
      <Link href="/" className="eyebrow">
        ← SIXTY
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold">Terms of Service</h1>
      <p className="text-muted text-sm mt-2">
        A template — replace with counsel-reviewed text before public launch.
      </p>
      <div className="mt-6 grid gap-4 text-sm text-muted">
        <p>
          SIXTY is a fitness-tracking community app. It does not provide medical advice; consult a
          professional before starting any exercise program.
        </p>
        <p>
          You are responsible for the content you post (photos, notes, comments). Be respectful —
          harassment or abusive content may result in removal.
        </p>
        <p>The service is provided “as is” during this build phase, without warranty.</p>
      </div>
    </main>
  );
}
