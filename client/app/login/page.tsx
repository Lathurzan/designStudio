"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { LoginInput } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(form);
      saveAuth(data.token, data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mb-6 text-sm text-slate-500">Log in to manage your projects.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" name="email" type="email" required value={form.email} onChange={update} placeholder="you@studio.com" />
          <Input label="Password" name="password" type="password" required value={form.password} onChange={update} placeholder="••••••••" />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          No account yet?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
