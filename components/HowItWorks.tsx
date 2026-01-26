"use client";

import { useState } from "react";

interface Step {
  num: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    num: "01",
    title: "Create a Group",
    description:
      "Create a group for your barkada, family, or roommates. Set a name and keep all shared expenses in one place.",
  },
  {
    num: "02",
    title: "Invite & Join",
    description:
      "Invite people via email or share an invite code. Invited users are auto-approved, others create join requests you can review.",
  },
  {
    num: "03",
    title: "Add Expenses",
    description:
      "Log group expenses with flexible splits. Assign who paid, choose equal or custom splits, and categorize each expense.",
  },
  {
    num: "04",
    title: "Track Balances",
    description:
      "Ambag calculates real-time balances per person, netting debts across the group so everyone clearly sees who owes what.",
  },
  {
    num: "05",
    title: "Settle Up & Stay Notified",
    description:
      "Record settlements, close out balances, and get notifications when you’re added to groups, expenses, or receive payments.",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div>
      <h2 className="mb-12 text-5xl font-bold text-[#1A1A1A] tracking-[-0.02em] leading-[1.2]">How It Works</h2>

      {/* Steps */}
      <div className="mb-8">
        <div className="relative mb-8">
          {/* Progress Line */}
          <div className="absolute left-0 top-6 h-1 w-full bg-[#E5E7EB] rounded-full" />
          <div
            className="absolute top-6 h-1 bg-[#6B46C1] rounded-full transition-all duration-500"
            style={{
              left: `${(activeStep - 1) * 25}%`,
              width: "25%",
            }}
          />

          {/* Steps */}
          <div className="relative flex items-start justify-between">
            {steps.map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === activeStep;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(stepNum)}
                  className={`flex flex-col items-center transition-all ${
                    isActive ? "scale-110" : "scale-100 hover:scale-105"
                  }`}
                >
                  <div
                    className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] cursor-pointer transition-all ${
                      isActive
                        ? "border-[#6B46C1] bg-[rgba(107,70,193,0.1)] ring-4 ring-[rgba(107,70,193,0.2)]"
                        : "border-[#E5E7EB] bg-white hover:border-[#6B46C1]/40"
                    }`}
                  >
                    <span
                      className={`text-base font-bold ${
                        isActive ? "text-[#6B46C1]" : "text-[#A0AEC0]"
                      }`}
                    >
                      {step.num}
                    </span>
                  </div>
                  <p
                    className={`max-w-[120px] text-center text-xs font-medium transition-colors ${
                      isActive
                        ? "text-[#1A1A1A] font-semibold"
                        : "text-[#6B7280]"
                    }`}
                  >
                    {step.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl bg-white p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] min-h-[120px] transition-all">
          <p className="text-lg text-[#1A1A1A]/80 leading-relaxed">
            {steps[activeStep - 1].description}
          </p>
        </div>
      </div>
    </div>
  );
}
