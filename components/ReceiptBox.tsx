import { ReactNode } from "react";

interface ReceiptBoxProps {
  children: ReactNode;
  className?: string;
}

export default function ReceiptBox({
  children,
  className = "",
}: ReceiptBoxProps) {
  return <div className={`receipt-box bg-white ${className}`}>{children}</div>;
}
