import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DebugInviteCodesPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get all groups with their invite codes
  const { data: groups } = await supabase
    .from('groups')
    .select(`
      id,
      name,
      invite_code,
      created_by,
      creator:users!groups_created_by_fkey (
        email,
        full_name
      ),
      members:group_members(count)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Debug: Invite Codes</h1>
      <p className="text-muted-foreground mb-6">
        All groups and their invite codes in the database
      </p>

      <div className="space-y-4">
        {groups && groups.length > 0 ? (
          groups.map((group: any) => (
            <div
              key={group.id}
              className="p-4 bg-white border rounded-lg shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created by: {group.creator?.full_name || group.creator?.email || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Group ID: {group.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Members: {group.members?.[0]?.count || 0}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Invite Code</p>
                  <div className="font-mono text-2xl font-bold bg-purple-100 px-4 py-2 rounded">
                    {group.invite_code || 'N/A'}
                  </div>
                  <button
                    onClick={() => {
                      if (group.invite_code) {
                        navigator.clipboard.writeText(group.invite_code);
                      }
                    }}
                    className="text-xs text-purple-600 hover:underline mt-2"
                  >
                    Copy Code
                  </button>
                </div>
              </div>

              {user.id === group.created_by && (
                <div className="mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded inline-block">
                  You created this group
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No groups found in database</p>
          </div>
        )}
      </div>

      {/* Test Join Section */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Test Join Functionality</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Copy an invite code from above and try joining the group from your groups page.
        </p>
        <ol className="text-sm space-y-2 list-decimal list-inside">
          <li>Copy an invite code from a group you're NOT a member of</li>
          <li>Go to the Groups page</li>
          <li>Click "Join Group"</li>
          <li>Paste the code and submit</li>
          <li>Check the browser console for debug logs</li>
        </ol>
      </div>

      {/* Current User Info */}
      <div className="mt-8 p-6 bg-gray-50 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Current User</h2>
        <p className="text-sm">
          <strong>ID:</strong> {user.id}
        </p>
        <p className="text-sm">
          <strong>Email:</strong> {user.email}
        </p>
      </div>
    </div>
  );
}
