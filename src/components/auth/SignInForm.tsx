import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await login(email, password);
      navigate("/school");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in. Please verify credentials.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await login(demoEmail, demoPass);
      navigate("/school");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-md pt-10">
        <Link
          to="/school"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5 rtl:rotate-180" />
          Back to School Dashboard
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
              Sign In to School Portal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your institutional account credentials to access your portal.
            </p>
          </div>

          {/* Quick Demo Logins Banner */}
          <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-500/20 dark:bg-brand-500/10">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Quick 1-Click Demo Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("admin@school.com", "admin123")}
                className="rounded-lg bg-white px-2 py-1.5 text-xs font-semibold text-gray-800 shadow-theme-xs hover:bg-brand-500 hover:text-white dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-brand-500"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("sarah.johnson@school.com", "teacher123")}
                className="rounded-lg bg-white px-2 py-1.5 text-xs font-semibold text-gray-800 shadow-theme-xs hover:bg-brand-500 hover:text-white dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-brand-500"
              >
                👩‍🏫 Teacher
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("student1@school.com", "student123")}
                className="rounded-lg bg-white px-2 py-1.5 text-xs font-semibold text-gray-800 shadow-theme-xs hover:bg-brand-500 hover:text-white dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-brand-500"
              >
                🎓 Student
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-error-200 bg-error-50 p-3 text-xs font-medium text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {errorMsg}
            </div>
          )}

          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="signin-email">
                    Institutional Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@school.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-e-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block text-theme-sm font-normal text-gray-700 dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Default pass: admin123
                  </span>
                </div>
                <div>
                  <Button className="w-full" size="md" disabled={isSubmitting}>
                    {isSubmitting ? "Signing In..." : "Sign In to Portal"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
