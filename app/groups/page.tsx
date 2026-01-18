// Example: Server Component usage in dashboard page
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAllMyGroupsWithDetails } from "@/lib/supabase/queries/server";

export default async function GroupsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch groups
  const { data: groups, error } = await getAllMyGroupsWithDetails(user.id);

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-destructive">Error Loading Groups</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Groups</h1>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Create New Group
        </button>
      </div>

      {groups && groups.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-foreground text-lg">No groups yet</p>
          <p className="text-muted-foreground mt-2">Create your first group to start splitting bills!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups?.map((group) => (
            <div
              key={group.id}
              className="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">{group.name}</h2>
              {group.description && (
                <p className="text-muted-foreground text-sm mb-4">{group.description}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    group.user_role === 'admin'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {group.user_role}
                  </span>
                  {group.member_count && (
                    <span className="text-muted-foreground">
                      {group.member_count} member{group.member_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Created by {group.creator?.full_name || 'Unknown'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
