import Link from "next/link";

export const metadata = { title: "Privacy Policy — SIXTY" };

export default function Privacy() {
  return (
    <main className="mx-auto max-w-app px-5 py-10 prose-invert">
      <Link href="/" className="eyebrow">
        ← SIXTY
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold">Privacy Policy</h1>
      <p className="text-muted text-sm mt-2">
        SIXTY is operated from France and complies with the GDPR. This is a template — replace with
        counsel-reviewed text before public launch.
      </p>
      <div className="mt-6 grid gap-4 text-sm text-text/90">
        <section>
          <h2 className="font-bold mb-1">What we collect</h2>
          <p className="text-muted">
            Account email, display name, optional avatar, your challenge activity (workout type,
            duration, calories, water, nutrition, notes) and progress photos you upload.
          </p>
        </section>
        <section>
          <h2 className="font-bold mb-1">How it&apos;s used</h2>
          <p className="text-muted">
            To run the challenge, render the shared social feed and leaderboard, and send in-app
            notifications. We do not sell your data.
          </p>
        </section>
        <section>
          <h2 className="font-bold mb-1">Your rights</h2>
          <p className="text-muted">
            You can access, correct, export, or delete your data at any time. Account deletion (in
            Profile → Delete account) permanently removes your profile, activities, and photos.
          </p>
        </section>
        <section>
          <h2 className="font-bold mb-1">Storage</h2>
          <p className="text-muted">
            Data is stored with Supabase (Postgres + Storage) in the EU (Paris region).
          </p>
        </section>
      </div>
    </main>
  );
}
