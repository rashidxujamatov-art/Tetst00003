"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Kirishda xatolik");
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-7 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-brand" />
          <span className="font-bold text-brand">Admin panel</span>
        </div>
        <h1 className="text-xl font-bold mb-1">Tizimga kirish</h1>
        <p className="text-sm text-slate-500 mb-5">Davom etish uchun kiring.</p>

        <label className="block text-sm font-semibold mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="admin@texnikum.uz"
          autoComplete="username"
        />

        <label className="block text-sm font-semibold mb-1 mt-4">Parol</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-600 transition disabled:opacity-60"
        >
          {loading ? "Kirilmoqda…" : "Kirish"}
        </button>
      </form>
    </main>
  );
}
