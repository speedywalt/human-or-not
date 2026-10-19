import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col justify-center overflow-hidden px-4 pb-20">
      <p className="font-display text-sm tracking-wide text-accent">Doodle duel</p>
      <h1 className="font-display text-5xl leading-none text-fg">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Studio nights belong to the host. Free modes don't need an account.</p>
      <div className="mt-6 flex flex-col gap-2">
        {authEnabled ? (
          GROK_PROVIDERS.map((provider) => (
            <button
              key={provider.providerId}
              type="button"
              onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
              className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink"
            >
              Continue with {provider.label}
            </button>
          ))
        ) : (
          <p className="text-sm text-muted">Sign-in is off.</p>
        )}
      </div>
    </main>
  );
}
