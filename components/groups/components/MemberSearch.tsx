"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Mail, UserPlus, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchUserByEmailAction } from "@/hooks/users";

export type MemberInvite = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  isExistingUser: boolean;
};

interface MemberSearchProps {
  selectedMembers: MemberInvite[];
  onAddMember: (member: MemberInvite) => void;
  onRemoveMember: (id: string) => void;
}

export function MemberSearch({ selectedMembers, onAddMember, onRemoveMember }: MemberSearchProps) {
  const [emailInput, setEmailInput] = useState("");
  const [searchResult, setSearchResult] = useState<MemberInvite | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Simple email validation regex
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = async (email: string) => {
    setEmailInput(email);

    // Reset if empty
    if (!email.trim()) {
      setSearchResult(null);
      setShowResult(false);
      return;
    }

    // Only search if valid email format
    if (!isValidEmail(email)) {
      setSearchResult(null);
      setShowResult(false);
      return;
    }

    setIsSearching(true);
    setShowResult(true);

    try {
      const { data, error } = await searchUserByEmailAction(email);

      if (error) {
        console.error('Search error:', error);
        setSearchResult(null);
        setIsSearching(false);
        return;
      }

      if (data) {
        // User exists
        setSearchResult({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          isExistingUser: true
        });
      } else {
        // User doesn't exist - will send invite
        setSearchResult({
          id: `invite-${Date.now()}`,
          email: email,
          full_name: null,
          avatar_url: null,
          isExistingUser: false
        });
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = () => {
    if (!searchResult) return;

    // Check if already added
    const alreadyAdded = selectedMembers.some(m =>
      m.email.toLowerCase() === searchResult.email.toLowerCase()
    );

    if (alreadyAdded) return;

    onAddMember(searchResult);
    setEmailInput("");
    setSearchResult(null);
    setShowResult(false);
  };

  const isAlreadyAdded = (email: string) => {
    return selectedMembers.some(m => m.email.toLowerCase() === email.toLowerCase());
  };

  return (
    <div className="space-y-3">
      {/* Email Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="Enter email address..."
          value={emailInput}
          onChange={(e) => handleEmailChange(e.target.value)}
          onFocus={() => emailInput && setShowResult(true)}
          className="pl-10 pr-10"
        />
        {emailInput && (
          <button
            onClick={() => {
              setEmailInput("");
              setSearchResult(null);
              setShowResult(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Result Dropdown */}
        {showResult && isValidEmail(emailInput) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50">
            {isSearching ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Checking email...
              </div>
            ) : searchResult ? (
              <div className="p-3">
                {searchResult.isExistingUser ? (
                  // Existing user
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={searchResult.avatar_url || undefined} />
                        <AvatarFallback className="text-sm">
                          {searchResult.full_name?.charAt(0) || searchResult.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{searchResult.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{searchResult.email}</p>
                      </div>
                      <UserPlus className="w-4 h-4 text-green-500" />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleAddMember}
                      disabled={isAlreadyAdded(searchResult.email)}
                      className="w-full"
                    >
                      {isAlreadyAdded(searchResult.email) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Already Added
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Member
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  // Non-existing user - will invite
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">User not found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {searchResult.email}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Will send email invitation
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddMember}
                      disabled={isAlreadyAdded(searchResult.email)}
                      className="w-full gap-2"
                    >
                      {isAlreadyAdded(searchResult.email) ? (
                        <>
                          <Check className="w-4 h-4" />
                          Already Added
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Add & Send Invite
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Selected Members */}
      {selectedMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {selectedMembers.length} {selectedMembers.length === 1 ? 'member' : 'members'} to add
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm"
              >
                {member.isExistingUser ? (
                  <UserPlus className="w-3 h-3 text-green-500" />
                ) : (
                  <Mail className="w-3 h-3 text-blue-500" />
                )}
                <span className="font-medium">
                  {member.full_name || member.email}
                </span>
                {!member.isExistingUser && (
                  <span className="text-xs text-muted-foreground">(invite)</span>
                )}
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
