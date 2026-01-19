"use client";

import { useState } from "react";
import { Group } from "@/types/group";
import { Users, DollarSign, Calendar, User, Share2, X, UserPlus } from "lucide-react";
import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
interface GroupCardCreditFlippableProps {
  group: Group & { image_url?: string | null; total_expenses?: number };
  isActive: boolean;
  onClick: () => void;
}

export function GroupCardCreditFlippable({ group, isActive, onClick }: GroupCardCreditFlippableProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const firstChar = group.name.charAt(0).toUpperCase();
  const memberCount = group.member_count || 0;
  const pendingInvitationsCount = group.pending_invitations_count || 0;
  const totalExpenses = group.total_expenses || 0;

  // Generate gradient if no image
  const gradients = [
    "from-purple-500 via-pink-500 to-red-500",
    "from-blue-500 via-cyan-500 to-teal-500",
    "from-green-500 via-emerald-500 to-lime-500",
    "from-orange-500 via-amber-500 to-yellow-500",
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-rose-500 via-red-500 to-orange-500",
  ];

  const gradientIndex = group.id.charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIndex];

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleCopyInvite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (group.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      // TODO: Add toast notification
      toast(`Invite code copied: ${group.invite_code}`);
    }
  };

  return (
    <div
      className="relative w-64 h-40 perspective-1000 shrink-0"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front Side */}
        <button
          onClick={handleCardClick}
          className={`absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] backface-hidden ${
            isFlipped ? "pointer-events-none" : ""
          } ${!isActive ? "opacity-50 grayscale" : ""}`}
        >
          {/* Background - Image or Gradient */}
          {group.image_url ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${group.image_url})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ) : (
            <div className={`absolute inset-0 bg-linear-to-br ${gradient}`}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
              </div>
            </div>
          )}

          {/* Card Content */}
          <div className="relative h-full p-4 flex flex-col justify-between text-white">
            <div className="flex items-start justify-between">
              <div className="w-10 h-8 bg-linear-to-br from-yellow-200 to-yellow-400 rounded-md opacity-80" />
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm">
                {firstChar}
              </div>
            </div>

            <div className="space-y-2 grow flex flex-col">
              <div className="grow flex flex-col items-start justify-end" >
                <p className="text-base font-bold tracking-wide drop-shadow-lg truncate">
                  {group.name}
                </p>
                {group.description && (
                  <p className="text-xs opacity-90 truncate">
                    {group.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Users className="w-3 h-3" />
                  <span className="font-medium">{memberCount}</span>
                  {pendingInvitationsCount > 0 && (
                    <span className="text-[10px] opacity-75">
                      (+{pendingInvitationsCount} pending)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-medium">{formatCurrency(totalExpenses, DEFAULT_CURRENCY, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors" />

          {/* Active indicator ring */}
          {isActive && (
            <div className="absolute inset-0 border-4 border-purple-500 rounded-xl pointer-events-none" />
          )}
        </button>

        {/* Back Side */}
        <div
          onClick={handleCardClick}
          className={`absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-lg rotate-y-180 backface-hidden bg-slate-950 cursor-pointer ${
            !isFlipped ? "pointer-events-none" : ""
          } ${!isActive ? "opacity-50" : ""}`}
        >
          <div className="relative h-full p-3 flex flex-col text-white">
            {/* Header */}

            {/* Content - 2x2 Grid */}
            <div className="flex-1 grid grid-cols-5 gap-1.5">
              {/* Total Members */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center col-span-2">
                <p className="text-[9px] opacity-75 mb-0.5">Members</p>
                <p className="text-lg font-bold">{memberCount}</p>
                {pendingInvitationsCount > 0 && (
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <UserPlus className="w-2.5 h-2.5 text-yellow-400" />
                    <span className="text-[9px] text-yellow-400">+{pendingInvitationsCount} pending</span>
                  </div>
                )}
              </div>

              {/* Total Expenses */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center col-span-3">
                <p className="text-[9px] opacity-75 mb-0.5">Expenses</p>
                <p className="text-lg font-bold">{formatCurrency(totalExpenses)}</p>
              </div>

              {/* Invite Code - spans 3 columns */}
              {group.invite_code && (
                <div className="col-span-3 bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[9px] opacity-75">Invite Code</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 text-[9px] px-1.5 text-white hover:text-white hover:bg-white/20"
                      onClick={handleCopyInvite}
                    >
                      <Share2 className="w-2.5 h-2.5 mr-0.5" />
                      Copy
                    </Button>
                  </div>
                  <p className="font-mono text-xs font-bold tracking-wide text-center">
                    {group.invite_code}
                  </p>
                </div>
              )}

              {/* Role Badge - spans 2 columns */}
              {group.user_role && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center col-span-2">
                  <p className="text-[9px] opacity-75 mb-0.5">Your Role</p>
                  <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase">
                    {group.user_role}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
