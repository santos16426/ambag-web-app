"use client";

import { useState, useEffect } from "react";

const ACCORDION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${ACCORDION_COOKIE_MAX_AGE}`;
}

export function useAccordionCookie(
  cookieName: string,
  defaultValue: boolean = true
): [boolean, (value: boolean) => void] {
  const [isOpen, setIsOpen] = useState<boolean>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from cookie on mount
  useEffect(() => {
    if (typeof document === "undefined") return;

    const cookieValue = getCookie(cookieName);
    if (cookieValue !== null) {
      setIsOpen(cookieValue === "true");
    } else {
      // Set default value in cookie if it doesn't exist
      setCookie(cookieName, String(defaultValue));
      setIsOpen(defaultValue);
    }
    setIsInitialized(true);
  }, [cookieName, defaultValue]);

  // Save to cookie when state changes (but not on initial load)
  const setValue = (value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === "function" ? value(isOpen) : value;
    setIsOpen(newValue);
    if (isInitialized) {
      setCookie(cookieName, String(newValue));
    }
  };

  return [isOpen, setValue];
}
