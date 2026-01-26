## Supabase RLS (collated by feature)

These files are **human-friendly, feature-grouped** versions of the Row Level Security policies that already exist in `supabase/migrations/`.

- They are **optional** (your numbered migrations still work as-is).
- They’re **idempotent**: most policies are dropped/recreated so you can rerun them safely.
- They’re designed so you can apply RLS **step-by-step per feature** after a DB reset.

### Suggested run order (RLS only)

1. `00_enable_rls.sql`
2. `01_users.sql`
3. `02_groups.sql`
4. `03_group_members.sql`
5. `04_expenses.sql`
6. `05_settlements.sql`
7. `06_invitations_and_requests.sql`
8. `07_notifications.sql`
9. `08_storage_avatars.sql`
10. `09_storage_groups.sql`

