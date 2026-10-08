"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "Invalid email or password" : null
  );

  const emailError =
    touched.email && !email
      ? "Email is required."
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
    setTouched({ email: true, password: true });

    if (!email || !/\S+@\S+\.\S+/.test(email) || !password || password.length < 6) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    setError(null);
    setTouched({ email: false, password: false });
  };

  return (
    <div className="card p-8 bg-surface border border-border shadow-md w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-ink">Sign in to SkillBridge</h1>
        <p className="text-xs text-muted mt-1">
          Access your clinical-grade career readiness benchmark and action plan
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
          <label htmlFor="login-email" className="block text-xs font-semibold text-ink mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-[18px] h-[18px] text-muted"
              aria-hidden="true"
            />
            <input
              id="login-email"
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
              placeholder="you@example.com"
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold text-ink">
              Password
            </label>
            <span className="text-[11px] text-muted font-mono">Demo: demo1234</span>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-[18px] h-[18px] text-muted"
              aria-hidden="true"
            />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              required
              placeholder="••••••••"
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
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in to Dashboard</span>
          )}
        </button>
      </form>

      {/* Demo Account Quick-Fill */}
      <div className="mt-6 pt-5 border-t border-border space-y-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block text-center">
          1-Click Demo Profiles:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => fillDemo("alex@demo.skillbridge.dev")}
            className="chip chip-neutral hover:bg-surface-subtle transition cursor-pointer text-xs py-1.5 px-3"
          >
            Alex (Candidate · CS)
          </button>
          <button
            type="button"
            onClick={() => fillDemo("jordan@demo.skillbridge.dev")}
            className="chip chip-neutral hover:bg-surface-subtle transition cursor-pointer text-xs py-1.5 px-3"
          >
            Jordan (Candidate · Data)
          </button>
          <button
            type="button"
            onClick={() => fillDemo("counselor@demo.skillbridge.dev")}
            className="chip chip-strong hover:opacity-90 transition cursor-pointer text-xs py-1.5 px-3"
          >
            Dr. Mehta (Counselor)
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-muted">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Sign up free
        </Link>
      </div>
    </div>
  );
}
