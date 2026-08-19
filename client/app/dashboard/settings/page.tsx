// app/dashboard/settings/page.tsx
"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { api } from "@/lib/api";
import { getToken, saveAuth } from "@/lib/auth";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { AuthUser } from "@/types";

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadError, setLoadError] = useState("");

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    api
      .me()
      .then((u) => {
        setUser(u);
        setProfileForm({ name: u.name, email: u.email });
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : "Failed to load account"));
  }, []);

  function updateProfileField(e: ChangeEvent<HTMLInputElement>) {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  }
  function updatePasswordField(e: ChangeEvent<HTMLInputElement>) {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  }

  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);
    try {
      const updated = await api.updateProfile(profileForm);
      setUser(updated);
      const token = getToken();
      if (token) saveAuth(token, updated); // keep the sidebar's cached name/email fresh
      setProfileSuccess("Profile updated.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setPasswordSaving(true);
    try {
      await api.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Password updated.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loadError) {
    return <p className="p-10 text-sm text-rose-600">{loadError}</p>;
  }
  if (!user) {
    return <Spinner />;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account details.</p>
      </div>

      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input label="Name" name="name" required value={profileForm.name} onChange={updateProfileField} />
          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={profileForm.email}
            onChange={updateProfileField}
          />
          {profileError && <p className="text-sm text-rose-600">{profileError}</p>}
          {profileSuccess && <p className="text-sm text-emerald-600">{profileSuccess}</p>}
          <Button type="submit" loading={profileSaving}>
            Save profile
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-1 text-sm font-semibold text-slate-800">Change password</h2>
        <p className="mb-4 text-xs text-slate-400">You'll stay logged in on this device after changing it.</p>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current password"
            name="currentPassword"
            type="password"
            required
            value={passwordForm.currentPassword}
            onChange={updatePasswordField}
          />
          <Input
            label="New password"
            name="newPassword"
            type="password"
            required
            minLength={6}
            value={passwordForm.newPassword}
            onChange={updatePasswordField}
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            value={passwordForm.confirmPassword}
            onChange={updatePasswordField}
          />
          {passwordError && <p className="text-sm text-rose-600">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-emerald-600">{passwordSuccess}</p>}
          <Button type="submit" loading={passwordSaving}>
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
