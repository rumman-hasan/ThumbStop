import { EmptyRow, Flash, PageHeader, StatusBadge } from "@/components/app-ui";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Row } from "@/lib/types";
import { setRoleAction } from "./actions";

export default async function UsersPage({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const { supabase, user } = await requireRole(["admin"]);
  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,phone,role,created_at")
    .order("created_at", { ascending: true });
  const users = (data ?? []) as Row[];

  return (
    <>
      <PageHeader
        title="Users & Roles"
        text="Everyone who registers starts as a client. Promote a team member to Staff (clients, projects, invoices) or Admin (everything, including website content and roles)."
      />
      <Flash searchParams={searchParams} />

      <div className="card overflow-x-auto">
        <table className="data">
          <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Change role</th></tr></thead>
          <tbody>
            {users.length === 0 && <EmptyRow colSpan={4} text="No users yet." />}
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <p className="font-semibold text-white">{u.full_name || "—"}</p>
                  <p className="text-xs text-brand-muted">{u.email}</p>
                </td>
                <td><StatusBadge value={u.role} /></td>
                <td>{formatDate(u.created_at)}</td>
                <td>
                  {u.id === user.id ? (
                    <span className="text-xs text-brand-muted">This is you</span>
                  ) : (
                    <form action={setRoleAction} className="flex gap-2">
                      <input type="hidden" name="target" value={u.id} />
                      <select name="role" defaultValue={u.role} className="input !py-1.5 text-xs" aria-label={`Role for ${u.email}`}>
                        <option value="client">Client</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button className="btn-outline btn-sm">Save</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
