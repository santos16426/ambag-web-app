"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [localTheme, setLocalTheme] = React.useState<"light" | "dark">("light");
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Avoid hydration mismatch and sync with theme
  React.useEffect(() => {
    setMounted(true);
    setLocalTheme(theme === "dark" ? "dark" : "light");
  }, [theme]);

  const handleToggle = () => {
    if (isAnimating) return; // Prevent multiple clicks during animation

    const newTheme = theme === "dark" ? "light" : "dark";
    setIsAnimating(true);

    // Update local theme immediately for visual transition
    setLocalTheme(newTheme);

    // Apply theme class to html immediately for smooth page transition
    const html = document.documentElement;
    if (newTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    // Change theme immediately - no delay for smoother experience
    setTheme(newTheme);

    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  if (!mounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="px-2 py-2">
            <div className="h-12 rounded-lg bg-muted animate-pulse" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const isDark = localTheme === "dark";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="px-2 py-2">
          {/* Single Switch that toggles between Day and Night */}
          <div
            className="relative h-12 w-full rounded-lg border-2 overflow-hidden cursor-pointer border-primary shadow-lg"
            style={{
              background: isDark
                ? "linear-gradient(to bottom right, rgb(30, 27, 75), rgb(88, 28, 135), rgb(30, 27, 75))"
                : "linear-gradient(to bottom right, rgb(96, 165, 250), rgb(59, 130, 246))",
              transition: "background 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "background, border-color",
            }}
            onClick={handleToggle}
            role="switch"
            aria-checked={isDark}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
              }
            }}
          >
            {/* Cloud pattern background for day mode */}
            <div
              className="absolute inset-0"
              style={{
                opacity: !isDark ? 0.2 : 0,
                transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div className="absolute top-2 left-4 w-8 h-8 bg-white rounded-full blur-sm"></div>
              <div className="absolute top-1 left-8 w-6 h-6 bg-white rounded-full blur-sm"></div>
              <div className="absolute top-3 left-12 w-10 h-10 bg-white rounded-full blur-sm"></div>
              <div className="absolute top-2 right-8 w-7 h-7 bg-white rounded-full blur-sm"></div>
              <div className="absolute top-1 right-12 w-5 h-5 bg-white rounded-full blur-sm"></div>
            </div>

            {/* Star pattern background for night mode */}
            <div
              className="absolute inset-0"
              style={{
                opacity: isDark ? 1 : 0,
                transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div className="absolute top-2 left-6 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute top-4 left-12 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute top-1 left-20 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-5 left-24 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute top-3 right-8 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-1 right-16 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute top-4 right-20 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-6 right-12 w-1 h-1 bg-white rounded-full"></div>
            </div>

            <div className="relative flex items-center justify-between h-full px-3">
              <span
                className="text-sm font-medium text-white"
                style={{
                  transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {isDark ? "Night Mode" : "Day Mode"}
              </span>

              {/* Switch Toggle */}
              <div className="flex items-center">
                <div
                  className="relative w-11 h-6 rounded-full"
                  style={{
                    backgroundColor: isDark ? "rgb(51, 65, 85)" : "rgb(250, 204, 21)",
                    transition: "background-color 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                    willChange: "background-color",
                  }}
                >
                  <div
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                    style={{
                      transform: isDark ? "translateX(20px)" : "translateX(0px)",
                      transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                      willChange: "transform",
                    }}
                  >
                    <div
                      style={{
                        opacity: isDark ? 1 : 0,
                        transform: isDark ? "scale(1) rotate(0deg)" : "scale(0) rotate(-90deg)",
                        transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "absolute",
                      }}
                    >
                      <Moon
                        className="w-3.5 h-3.5 text-slate-700"
                        fill="currentColor"
                      />
                    </div>
                    <div
                      style={{
                        opacity: !isDark ? 1 : 0,
                        transform: !isDark ? "scale(1) rotate(0deg)" : "scale(0) rotate(90deg)",
                        transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "absolute",
                      }}
                    >
                      <Sun
                        className="w-3.5 h-3.5 text-yellow-400"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
