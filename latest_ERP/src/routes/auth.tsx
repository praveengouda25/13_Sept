import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const ERP_BASE_PATH = "/erp";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

type AuthTab = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — SVRST ERP" },
      {
        name: "description",
        content:
          "Sign in to SVRST ERP to manage hostels, students and welfare operations across your trust's branches.",
      },
      { property: "og:title", content: "Sign in — SVRST ERP" },
      {
        property: "og:description",
        content: "Secure access to your NGO trust's hostel and student operations platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const destination = safePath(search.redirect);
  const [loading, setLoading] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: destination, replace: true });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: destination, replace: true });
    });

    void videoRef.current?.play().catch(() => undefined);

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [destination, navigate]);

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("invalid api key") || message.includes("invalid api")) {
        toast.error("Supabase authentication is not configured with a valid public API key.");
      } else if (message.includes("email not confirmed")) {
        toast.error("Please confirm your email before signing in.");
      } else if (message.includes("invalid login credentials")) {
        toast.error("The email or password is incorrect.");
      } else {
        toast.error(error.message);
      }
      return;
    }
  }

  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password confirmation does not match.");
      return;
    }

    setLoading(true);
    const mobileNumber = `${countryCode}${mobile.replace(/\D/g, "")}`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${ERP_BASE_PATH}${destination}`,
        data: { full_name: fullName, mobile_number: mobileNumber },
      },
    });
    setLoading(false);
    if (error) {
      const message = error.message.toLowerCase();
      toast.error(
        message.includes("invalid api key") || message.includes("invalid api")
          ? "Supabase authentication is not configured with a valid public API key."
          : error.message,
      );
      return;
    }

    toast.success("Account created. Your default access is Student — please sign in to continue.");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMobile("");
    setAuthTab("signin");
  }

  async function handleForgotPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}${ERP_BASE_PATH}/auth`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setResetSent(true);
    toast.success("Reset link sent. Please check your inbox.");
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${ERP_BASE_PATH}${destination}`,
      },
    });
    if (error) {
      toast.error("Google sign-in failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <section className="relative min-h-[320px] overflow-hidden bg-slate-950 lg:min-h-screen lg:w-[55%]">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={`${import.meta.env.BASE_URL}svrst-login.mp4`}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => console.error("Video failed to load")}
          />
        </section>

        <section className="flex flex-1 flex-col items-center justify-center gap-5 bg-transparent px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              SV
            </div>
            <p className="text-base font-semibold text-slate-900">
              SVRST Trust – Hostel Management ERP
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Developed by VISTARX Solutions Pvt. Ltd. · www.vistarxsolutions.com ·
              contact@vistarxsolutions.com
            </p>
          </div>
          <Card className="w-full max-w-md border border-slate-200/70 bg-white/90 shadow-2xl shadow-slate-200/70 backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back home
                </Link>
                <div className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-700">
                  Secure access
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900">Welcome back</CardTitle>
                <CardDescription>
                  Sign in, create an account or recover your password with enterprise-grade
                  security.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={authTab} onValueChange={(value) => setAuthTab(value as AuthTab)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create</TabsTrigger>
                  <TabsTrigger value="forgot">Forgot</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-5 space-y-4">
                  <form className="space-y-4" onSubmit={handleSignIn}>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@svrst.org"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                          onClick={() => setShowPassword((value) => !value)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in…" : "Sign in"}
                    </Button>
                  </form>
                  <div className="flex items-center justify-between text-sm">
                    <button
                      className="text-amber-700 hover:underline"
                      onClick={() => setAuthTab("forgot")}
                    >
                      Forgot password?
                    </button>
                    <button
                      className="text-slate-600 hover:underline"
                      onClick={() => setAuthTab("signup")}
                    >
                      Create account
                    </button>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="mt-5 space-y-4">
                  <form className="space-y-4" onSubmit={handleSignUp}>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Praveen Kumar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-up">Email address</Label>
                      <Input
                        id="email-up"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@svrst.org"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile number</Label>
                      <div className="flex gap-2">
                        <select
                          className="h-10 w-24 rounded-md border border-slate-200 bg-white px-3 text-sm"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+971">+971</option>
                        </select>
                        <Input
                          id="mobile"
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="9876543210"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-up">Password</Label>
                      <div className="relative">
                        <Input
                          id="password-up"
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 8 characters"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                          onClick={() => setShowPassword((value) => !value)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                          onClick={() => setShowConfirmPassword((value) => !value)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account…" : "Create account"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="forgot" className="mt-5 space-y-4">
                  <form className="space-y-4" onSubmit={handleForgotPassword}>
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email address</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@svrst.org"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Sending link…" : "Send reset link"}
                    </Button>
                    {resetSent ? (
                      <p className="text-sm text-emerald-600">
                        A reset link has been sent to your inbox. Please follow the instructions.
                      </p>
                    ) : null}
                  </form>
                </TabsContent>
              </Tabs>

              <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
                <span className="h-px flex-1 bg-slate-200" /> or{" "}
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogle}>
                Continue with Google
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
