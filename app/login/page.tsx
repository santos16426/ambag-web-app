"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Use server action for proper cookie handling
      const result = await loginAction({
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // If we get here, redirect happened

    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign in";
      setServerError(
        errorMessage === "Invalid login credentials"
          ? "Invalid email or password"
          : errorMessage,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-white px-4 py-12'>
      <div className='w-full max-w-sm'>
        <div className='text-center mb-12'>
          <div className='text-2xl font-semibold mb-8'>ambag</div>
          <h1 className='text-2xl font-medium mb-2'>Welcome back</h1>
          <p className='text-sm text-gray-500'>Sign in to continue</p>
        </div>

        {serverError && (
          <div className='mb-6 p-3 bg-red-50 rounded text-center'>
            <p className='text-red-700 text-sm'>{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <input
              id='email'
              name='email'
              type='email'
              placeholder='Email'
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete='email'
              className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all ${
                errors.email ? "ring-1 ring-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className='text-red-500 text-xs mt-1.5'>{errors.email}</p>
            )}
          </div>

          <div>
            <input
              id='password'
              name='password'
              type='password'
              placeholder='Password'
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete='current-password'
              className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all ${
                errors.password ? "ring-1 ring-red-500" : ""
              }`}
            />
            {errors.password && (
              <p className='text-red-500 text-xs mt-1.5'>{errors.password}</p>
            )}
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6'
          >
            {isLoading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <div className='relative my-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-200'></div>
          </div>
          <div className='relative flex justify-center text-xs'>
            <span className='bg-white px-2 text-gray-400'>or</span>
          </div>
        </div>

        <button
          type='button'
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
              },
            });
          }}
          disabled={isLoading}
          className='w-full border border-gray-200 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2'
        >
          <svg width='18' height='18' viewBox='0 0 18 18'>
            <path
              fill='#4285F4'
              d='M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z'
            />
            <path
              fill='#34A853'
              d='M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z'
            />
            <path
              fill='#FBBC05'
              d='M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z'
            />
            <path
              fill='#EA4335'
              d='M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z'
            />
          </svg>
          Continue with Google
        </button>

        <p className='text-center text-xs text-gray-500 mt-8'>
          Don&apos;t have an account?{" "}
          <Link href='/signup' className='text-black hover:underline'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
