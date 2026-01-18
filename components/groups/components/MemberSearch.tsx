"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Mail, UserPlus, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MemberInvite[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    // TODO: Replace with actual API call to search users
    // Simulated search
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock results
    const mockResults: MemberInvite[] = [
      {
        id: 'user-1',
        email: `${query}@example.com`,
        full_name: query.charAt(0).toUpperCase() + query.slice(1),
        avatar_url: null,
        isExistingUser: true
      }
    ];

    setSearchResults(mockResults);
    setIsSearching(false);
  };

  const handleAddByEmail = () => {
    if (!searchQuery.includes('@')) return;

    const emailMember: MemberInvite = {
      id: `email-${Date.now()}`,
      email: searchQuery,
      full_name: null,
      avatar_url: null,
      isExistingUser: false
    };

    onAddMember(emailMember);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const isAlreadyAdded = (id: string) => {
    return selectedMembers.some(m => m.id === id);
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-1">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      if (!isAlreadyAdded(result.id)) {
                        onAddMember(result);
                        setSearchQuery("");
                        setShowResults(false);
                      }
                    }}
                    disabled={isAlreadyAdded(result.id)}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={result.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {result.full_name?.charAt(0) || result.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{result.full_name || result.email}</p>
                      {result.full_name && (
                        <p className="text-xs text-muted-foreground">{result.email}</p>
                      )}
                    </div>
                    {isAlreadyAdded(result.id) && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            ) : searchQuery.includes('@') ? (
              <div className="p-3">
                <p className="text-sm text-muted-foreground mb-2">User not found</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddByEmail}
                  className="w-full gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send invite to {searchQuery}
                </Button>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No users found
              </div>
            )}
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
