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
    title: "Group Creation & Invitation",
    description:
      "Create a group and invite your friends. Set up your group name and add members via email or phone number.",
  },
  {
    num: "02",
    title: "Bill Input (Scan or Manual)",
    description:
      "Take a photo of your receipt or manually enter the bill. Our OCR technology automatically extracts items and prices.",
  },
  {
    num: "03",
    title: "Item Assignment",
    description:
      "Assign each item to the person who ordered it. Drag and drop or tap to assign items quickly.",
  },
  {
    num: "04",
    title: "Automatic Calculation",
    description:
      "Ambag automatically calculates each person's share, including tax and tip. No math required!",
  },
  {
    num: "05",
    title: "Settle Up",
    description:
      "Review the split and settle up with one tap. Send payment requests or mark as paid directly in the app.",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div>
      <h2 className="mb-12 text-5xl font-bold text-slate-900">How It Works</h2>

      {/* Steps */}
      <div className="mb-8">
        <div className="relative mb-8">
          {/* Progress Line */}
          <div className="absolute left-0 top-6 h-1 w-full bg-purple-100 rounded-full" />
          <div
            className="absolute top-6 h-1 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all duration-500"
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
                    className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-lg cursor-pointer transition-all ${
                      isActive
                        ? "border-purple-600 bg-purple-100 ring-4 ring-purple-200"
                        : "border-purple-200 bg-white hover:border-purple-300"
                    }`}
                  >
                    <span
                      className={`text-base font-bold ${
                        isActive ? "text-purple-700" : "text-slate-400"
                      }`}
                    >
                      {step.num}
                    </span>
                  </div>
                  <p
                    className={`max-w-[120px] text-center text-xs font-medium transition-colors ${
                      isActive
                        ? "text-slate-900 font-semibold"
                        : "text-slate-500"
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
        <div className="rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 p-8 border-2 border-purple-100 min-h-[120px] transition-all">
          <p className="text-lg text-slate-700">
            {steps[activeStep - 1].description}
          </p>
        </div>
      </div>
    </div>
  );
}
