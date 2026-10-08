"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [error, setError] = useState<string | null>(null);

  const nameError =
    touched.name && !name.trim()
      ? "Full name is required."
      : touched.name && name.trim().length < 2
      ? "Name must be at least 2 characters."
      : null;

  const emailError =
    touched.email && !email
      ? "Email address is required."
      : touched.email && !/\S+@\S+\.\S+/.test(email)
      ? "Please enter a valid email address."
      : null;

  const passwordError =
    touched.password && !password
      ? "Password is required."
      : touched.password && password.length < 6
      ? "Password must be at least 6 characters."
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });

    if (
      !name.trim() ||
      name.trim().length < 2 ||
      !email ||
      !/\S+@\S+\.\S+/.test(email) ||
      !password ||
      password.length < 6
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        throw new Error(regData.error || "Failed to create account");
      }

      // Automatically sign in upon successful registration
      const signRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signRes?.error) {
        router.push("/login?message=Account created. Please log in.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8 bg-surface border border-border shadow-md w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-ink">Create an Account</h1>
        <p className="text-xs text-muted mt-1">
          Start your personalized Career Readiness Analysis
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3 rounded-control bg-status-critical-bg border border-status-critical/20 text-status-critical-text text-xs flex items-center gap-2 mb-4"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-status-critical" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="register-name" className="block text-xs font-semibold text-ink mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-[18px] h-[18px] text-muted"
              aria-hidden="true"
            />
            <input
              id="register-name"
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              required
              placeholder="Alex Chen"
              className={`control-input pl-11 pr-4 h-12 text-sm ${
                nameError ? "border-status-critical focus:border-status-critical" : ""
              }`}
            />
          </div>
          {nameError && (
            <p className="text-[11px] text-status-critical font-medium mt-1">{nameError}</p>
          )}
        </div>

        <div>
          <label htmlFor="register-email" className="block text-xs font-semibold text-ink mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-[18px] h-[18px] text-muted"
              aria-hidden="true"
            />
            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              required
              placeholder="alex@example.com"
              className={`control-input pl-11 pr-4 h-12 text-sm ${
                emailError ? "border-status-critical focus:border-status-critical" : ""
              }`}
            />
          </div>
          {emailError && (
            <p className="text-[11px] text-status-critical font-medium mt-1">{emailError}</p>
          )}
        </div>

        <div>
          <label htmlFor="register-password" className="block text-xs font-semibold text-ink mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-[18px] h-[18px] text-muted"
              aria-hidden="true"
            />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              required
              placeholder="At least 6 characters"
              className={`control-input pl-11 pr-12 h-12 text-sm ${
                passwordError ? "border-status-critical focus:border-status-critical" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-muted hover:text-ink transition cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-[11px] text-status-critical font-medium mt-1">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-sm h-12 mt-2 font-semibold shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account & Continue</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
