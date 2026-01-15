"use client";
import { twMerge } from "tailwind-merge";

type ReceiptLine = { item: string; price: string; person: string };
type ReceiptData = {
  title: string;
  table: number;
  guests: number;
  lines: ReceiptLine[];
  total: string;
  splitWays: number;
  perHead: string;
};

interface BillSplittingMockupProps {
  className?: string;
  data?: ReceiptData;
  variant?:
    | "receipt"
    | "split-options"
    | "expense-tracker"
    | "upload-notification";
}

export default function BillSplittingMockup({
  variant = "receipt",
  data,
  className,
}: BillSplittingMockupProps) {
  if (variant === "receipt" && data) {
    const { title, table, guests, lines, total, splitWays, perHead } = data;
    return (
      <div
        className={twMerge(
          "relative w-100 max-w-sm bg-white p-6 receipt shadow-2xl h-full align-middle",
          className,
        )}
      >
        <div className='mb-4 border-b-2 border-dashed border-slate-300 pb-4'>
          <h3 className='text-center text-lg font-bold text-slate-900'>
            {title}
          </h3>
          <p className='text-center text-xs text-slate-500'>
            Table {table} • {guests} Guests
          </p>
        </div>

        <div className='space-y-3'>
          {lines.map((line, idx) => (
            <div
              key={`${line.item}-${idx}`}
              className='flex items-center justify-between border-b border-slate-100 pb-2'
            >
              <div className='flex-1'>
                <p className='text-sm font-medium text-slate-900'>
                  {line.item}
                </p>
                <p className='text-xs text-purple-600'>{line.person}</p>
              </div>
              <p className='text-sm font-semibold text-slate-900'>
                {line.price}
              </p>
            </div>
          ))}
        </div>

        <div className='mt-4 border-t-2 border-slate-300 pt-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-semibold text-slate-900'>Total</span>
            <span className='text-lg font-bold text-purple-600'>{total}</span>
          </div>
          <div className='mt-2 flex items-center justify-between text-xs text-slate-500'>
            <span>Split {splitWays} ways</span>
            <span>{perHead} each</span>
          </div>
        </div>

        <div className='mt-4 rounded-lg bg-emerald-50 p-3 text-center'>
          <p className='text-xs font-semibold text-emerald-700'>
            ✓ Receipt Uploaded &amp; Split
          </p>
        </div>
      </div>
    );
  }

  if (variant === "split-options") {
    return (
      <div className='w-full max-w-sm  bg-white p-6 '>
        <h3 className='mb-4 text-lg font-bold text-slate-900'>Split Options</h3>
        <div className='space-y-1.5'>
          {[
            { option: "Evenly", icon: "⚖️", active: true },
            { option: "By Share", icon: "📊", active: false },
            { option: "By Role", icon: "👤", active: false },
            { option: "Exact Amount", icon: "🔐", active: false },
            { option: "Custom", icon: "✏️", active: false },
          ].map((opt, idx) => (
            <button
              key={idx}
              className={`w-full rounded-lg border-2 p-3 text-left transition ${
                opt.active
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 bg-white hover:border-purple-300"
              }`}
            >
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>{opt.icon}</span>
                <span className='font-semibold text-slate-900'>
                  {opt.option}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className='mt-4 rounded-lg bg-purple-600 p-4 text-center text-white'>
          <p className='font-semibold'>Confirm Split</p>
        </div>
      </div>
    );
  }

  if (variant === "expense-tracker") {
    return (
      <div className='w-full max-w-sm  bg-white p-6 '>
        <h3 className='mb-4 text-lg font-bold text-slate-900'>
          Group Expenses
        </h3>
        <div className='mb-4 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 p-4 text-white'>
          <p className='text-sm opacity-90'>Total Group Balance</p>
          <p className='text-3xl font-bold'>₱140,000</p>
          <p className='mt-1 text-xs opacity-75'>Weekend Trip • 6 people</p>
        </div>
        <div className='space-y-2'>
          {[
            {
              name: "Alex",
              amount: "₱42,500",
              status: "paid",
              color: "bg-emerald-500",
            },
            {
              name: "Sarah",
              amount: "₱32,500",
              status: "paid",
              color: "bg-emerald-500",
            },
            {
              name: "Mike",
              amount: "₱22,500",
              status: "pending",
              color: "bg-amber-500",
            },
            {
              name: "Emma",
              amount: "₱42,500",
              status: "paid",
              color: "bg-emerald-500",
            },
          ].map((person, idx) => (
            <div
              key={idx}
              className='flex items-center justify-between rounded-lg bg-slate-50 p-3'
            >
              <div className='flex items-center gap-3'>
                <div
                  className={`h-10 w-10 rounded-full ${person.color} flex items-center justify-center text-white font-semibold`}
                >
                  {person.name[0]}
                </div>
                <div>
                  <p className='font-semibold text-slate-900'>{person.name}</p>
                  <p className='text-xs text-slate-500'>{person.status}</p>
                </div>
              </div>
              <p className='font-bold text-slate-900'>{person.amount}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "upload-notification") {
    return (
      <div className='w-full max-w-sm  bg-white p-6 shadow-xl receipt'>
        <div className='mb-4 flex items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-100'>
            <span className='text-2xl'>📸</span>
          </div>
          <div>
            <h3 className='font-bold text-slate-900'>Receipt Scanned</h3>
            <p className='text-xs text-slate-500'>Just now</p>
          </div>
        </div>
        <div className='mb-4 rounded-lg bg-slate-50 p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm text-slate-600'>Items detected</span>
            <span className='font-semibold text-slate-900'>5 items</span>
          </div>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm text-slate-600'>Total amount</span>
            <span className='font-semibold text-slate-900'>₱2,362</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-slate-600'>Split in</span>
            <span className='rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white'>
              4 seconds
            </span>
          </div>
        </div>
        <div className='rounded-lg bg-emerald-50 p-3 text-center'>
          <p className='text-sm font-semibold text-emerald-700'>
            ✓ Receipt uploaded and split automatically
          </p>
        </div>
      </div>
    );
  }

  return null;
}
