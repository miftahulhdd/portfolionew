"use client";
import { useActionState } from "react";
import { login } from "@/actions/admin";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="card space-y-4 p-6">
      {state?.error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div>
        <label className="label" htmlFor="username">Username</label>
        <input id="username" name="username" defaultValue={state?.username} className="field" autoComplete="username" required autoFocus />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="field" autoComplete="current-password" required />
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Memeriksa…" : "Masuk"}</button>
    </form>
  );
}
