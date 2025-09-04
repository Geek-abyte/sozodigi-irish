"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { postData } from "@/utils/api";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_KEY;

export default function CreateSpecialistPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      alertError("Please complete the CAPTCHA");
      return;
    }
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      alertError("Please fill all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alertError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await postData("users/register", {
        email: formData.email,
        password: formData.password,
        role: "specialist",
        captchaToken,
      });

      if (res?.userId || /otp|successful/i.test(res?.message || "")) {
        alertSuccess("Specialist created. OTP sent to email.");
        router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        alertError(res?.message || "Failed to create specialist");
      }
    } catch (err) {
      alertError(err?.message || "Failed to create specialist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Create Specialist</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="w-full p-2 border rounded"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {RECAPTCHA_SITE_KEY && (
          <ReCAPTCHA
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={setCaptchaToken}
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Creating…" : "+ Create Specialist"}
        </button>
      </form>
    </div>
  );
}


