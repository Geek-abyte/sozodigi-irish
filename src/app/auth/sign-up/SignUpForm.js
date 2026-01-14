"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { postData } from "@/utils/api";
import AuthLayout from "@/app/authLayout";
import Link from "next/link";
import Image from "next/image";
import { doctors } from "@/assets";
import { useToast } from "@/context/ToastContext";
import { FaSpinner, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";

const formInput =
  "border-[3px] border-primary-5 text-primary-2 rounded-[20px] overflow-hidden p-3 w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-5";

// Replace with your actual site key from Google reCAPTCHA v2
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_KEY;

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get("role");
  const [mounted, setMounted] = useState(false);

  // console.log("captcha", RECAPTCHA_SITE_KEY)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      role: roleFromUrl || "user",
    }));
  }, [roleFromUrl]);

  useEffect(() => {
    // Avoid hydration mismatches from extensions/auto-fill by only rendering after mount
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    validatePassword(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!captchaToken) {
      setError("Please verify the CAPTCHA.");
      alertError("Please complete the CAPTCHA.");
      setLoading(false);
      return;
    }

    // Check password validation
    if (!validatePassword(formData.password)) {
      setError("Please ensure your password meets all requirements.");
      alertError("Password does not meet requirements.");
      setLoading(false);
      return;
    }

    try {
      const res = await postData("users/register", {
        ...formData,
        captchaToken,
      });

      console.log("Registration response:", res)

      // Check for successful registration - API returns userId for success
      if (res?.userId || res?.message?.toLowerCase().includes("successful") || res?.message?.toLowerCase().includes("otp")) {
        alertSuccess("Sign-up successful! Check your email for OTP.");
        router.push(`/auth/verify-otp?email=${formData.email}`);
      } else {
        const knownErrors = {
          "email already registered": "An account with this email already exists.",
          "invalid input": "Please fill all fields correctly.",
          "failed captcha verification": "CAPTCHA verification failed. Please try again.",
        };
        const message =
          knownErrors[res?.message?.toLowerCase()] ||
          res?.message ||
          "Registration failed. Please try again.";
        setError(message);
        alertError(message);
      }
    } catch (err) {
      console.error("Signup error:", err);
      
      // Handle different types of errors
      let errorMessage = "Something went wrong. Please try again.";
      
      if (err?.status === 400) {
        errorMessage = err?.data?.message || "Invalid input. Please check your details.";
      } else if (err?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      alertError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          {/* LEFT SIDE IMAGE */}
          <div className="w-full lg:w-1/2 hidden lg:block">
            <Image
              src={doctors.src}
              alt="Healthcare professionals"
              width={600}
              height={400}
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="w-full lg:w-1/2 bg-white p-8 sm:p-12 rounded-[24px]">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
              Create your {formData.role} account
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Please fill in your details to get started
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-y-5"
              suppressHydrationWarning
              autoComplete="off"
            >
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleChange}
                className={formInput}
                autoComplete="email"
                suppressHydrationWarning
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className={formInput}
                  autoComplete="new-password"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 font-medium">Password Requirements:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className={`flex items-center gap-2 ${passwordValidation.length ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.length ? <FaCheck size={14} /> : <FaTimes size={14} />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.uppercase ? <FaCheck size={14} /> : <FaTimes size={14} />}
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.lowercase ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.lowercase ? <FaCheck size={14} /> : <FaTimes size={14} />}
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.number ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.number ? <FaCheck size={14} /> : <FaTimes size={14} />}
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.special ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.special ? <FaCheck size={14} /> : <FaTimes size={14} />}
                      <span>One special character</span>
                    </div>
                  </div>
                </div>
              )}

              {/* reCAPTCHA box */}
              <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                className="mx-auto"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-[20px] bg-[var(--color-primary-5)] text-white font-semibold text-lg hover:bg-[var(--color-primary-4)] transition-transform transform hover:scale-105 flex items-center justify-center"
              >
                {loading && <FaSpinner className="animate-spin mr-2" />}
                {loading ? "Signing Up..." : "Sign Up"}
              </button>

              <div className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[var(--color-primary-5)] underline"
                >
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
