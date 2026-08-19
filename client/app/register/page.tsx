"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { RegisterInput } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterInput>({ name: "", email: "", password: "" });
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
      const data = await api.register(form);
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
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Create your account</h1>
        <p className="mb-6 text-sm text-slate-500">Start sharing designs with clients today.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" required value={form.name} onChange={update} placeholder="Alex Morgan" />
          <Input label="Email" name="email" type="email" required value={form.email} onChange={update} placeholder="you@studio.com" />
          <Input label="Password" name="password" type="password" required minLength={6} value={form.password} onChange={update} placeholder="At least 6 characters" />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
