"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData, postData, updateData } from "@/utils/api";
import { ALL_PERMISSIONS } from "./permissions";

function PermissionChecklist({ value, onChange, disabled = false }) {
  const selected = useMemo(() => new Set(value || []), [value]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ALL_PERMISSIONS.map((p) => {
        const checked = selected.has(p.key);
        return (
          <label
            key={p.key}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              disabled
                ? "opacity-60 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              disabled={disabled}
              checked={checked}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) next.add(p.key);
                else next.delete(p.key);
                onChange(Array.from(next));
              }}
            />
            <div>
              <div className="text-sm font-medium text-gray-900">{p.label}</div>
              <div className="text-xs text-gray-500">{p.key}</div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

export default function SuperAdminConsolePage() {
  const { data: session, status } = useSession();
  const token = session?.user?.jwt;
  const role = session?.user?.role;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);

  // Create admin form
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminPerms, setAdminPerms] = useState(["admin:dashboard_view"]);

  // Role editor
  const [roleName, setRoleName] = useState("admin");
  const currentRole = useMemo(
    () => roles.find((r) => r.name === roleName),
    [roles, roleName],
  );
  const [rolePerms, setRolePerms] = useState([]);

  // User permissions editor
  const [selectedUserId, setSelectedUserId] = useState("");
  const selectedUser = useMemo(
    () => users.find((u) => u._id === selectedUserId),
    [users, selectedUserId],
  );
  const [userPerms, setUserPerms] = useState([]);

  useEffect(() => {
    setRolePerms(currentRole?.permissions || []);
  }, [currentRole]);

  useEffect(() => {
    setUserPerms(selectedUser?.permissions || []);
  }, [selectedUser]);

  async function refreshData() {
    if (!token) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        fetchData("rbac/roles", token),
        fetchData("users/get-all/no-pagination", token),
      ]);
      setRoles(rolesRes?.roles || []);
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes?.users || []);
    } catch (e) {
      setError(e?.message || "Failed to load RBAC data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onBootstrap() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await postData("rbac/bootstrap", {}, token);
      setMessage("✅ Roles bootstrapped.");
      await refreshData();
    } catch (e) {
      setError(e?.message || "Bootstrap failed");
    } finally {
      setLoading(false);
    }
  }

  async function onCreateAdmin(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await postData(
        "rbac/admins",
        {
          email: adminEmail,
          password: adminPassword,
          firstName: adminFirstName,
          lastName: adminLastName,
          permissions: adminPerms,
        },
        token,
      );
      setMessage("✅ Admin created.");
      setAdminEmail("");
      setAdminPassword("");
      setAdminFirstName("");
      setAdminLastName("");
      await refreshData();
    } catch (e2) {
      setError(e2?.message || "Create admin failed");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveRolePermissions() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await updateData(`rbac/roles/${roleName}`, { permissions: rolePerms }, token);
      setMessage(`✅ Updated role "${roleName}" permissions.`);
      await refreshData();
    } catch (e) {
      setError(e?.message || "Update role failed");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveUserPermissions() {
    if (!selectedUserId) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await updateData(
        `rbac/users/${selectedUserId}/permissions`,
        { permissions: userPerms },
        token,
      );
      setMessage("✅ Updated user permissions.");
      await refreshData();
    } catch (e) {
      setError(e?.message || "Update user permissions failed");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <div className="p-6">Loading…</div>;
  }

  if (!session) {
    return (
      <div className="p-6">
        <div className="text-lg font-semibold">You’re not logged in.</div>
        <div className="text-sm text-gray-600">
          Please log in as a <span className="font-medium">superAdmin</span>.
        </div>
      </div>
    );
  }

  if (role !== "superAdmin") {
    return (
      <div className="p-6">
        <div className="text-lg font-semibold">403 — Super Admin only</div>
        <div className="text-sm text-gray-600">
          Your role is <span className="font-mono">{String(role)}</span>.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Super Admin Console
            </h1>
            <p className="text-sm text-gray-600">
              Manage admins, roles, and permissions.
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        {(message || error) && (
          <div
            className={`rounded-lg border p-4 ${
              error ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
            }`}
          >
            <div className="text-sm">{error || message}</div>
          </div>
        )}

        {/* Bootstrap */}
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                Bootstrap default roles
              </div>
              <div className="text-sm text-gray-600">
                Creates default permissions for <span className="font-mono">admin</span> and{" "}
                <span className="font-mono">superAdmin</span> (safe to run multiple times).
              </div>
            </div>
            <button
              onClick={onBootstrap}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60"
            >
              Bootstrap
            </button>
          </div>
        </div>

        {/* Create admin */}
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-lg font-semibold text-gray-900">Create admin</div>
          <form onSubmit={onCreateAdmin} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={adminFirstName}
                onChange={(e) => setAdminFirstName(e.target.value)}
                placeholder="First name"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                value={adminLastName}
                onChange={(e) => setAdminLastName(e.target.value)}
                placeholder="Last name"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Email"
                type="email"
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Password"
                type="password"
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="text-sm font-medium text-gray-700">Admin permissions</div>
            <PermissionChecklist value={adminPerms} onChange={setAdminPerms} />

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Create admin
            </button>
          </form>
        </div>

        {/* Role permissions */}
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                Role permissions
              </div>
              <div className="text-sm text-gray-600">
                Set the default permissions for a role (e.g. admin).
              </div>
            </div>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              {[...new Set(["admin", "superAdmin", ...roles.map((r) => r.name)])].map(
                (r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="mt-4">
            <PermissionChecklist value={rolePerms} onChange={setRolePerms} />
          </div>

          <button
            onClick={onSaveRolePermissions}
            disabled={loading}
            className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60"
          >
            Save role permissions
          </button>
        </div>

        {/* User permissions */}
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-lg font-semibold text-gray-900">
            User permission overrides
          </div>
          <div className="text-sm text-gray-600">
            Assign explicit permissions to a specific user (overrides role defaults).
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Select a user…</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.email} ({u.role})
                </option>
              ))}
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              {selectedUser ? (
                <span>
                  Editing: <span className="font-medium">{selectedUser.email}</span>{" "}
                  (<span className="font-mono">{selectedUser.role}</span>)
                </span>
              ) : (
                <span>Select a user to edit.</span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <PermissionChecklist
              value={userPerms}
              onChange={setUserPerms}
              disabled={!selectedUserId}
            />
          </div>

          <button
            onClick={onSaveUserPermissions}
            disabled={loading || !selectedUserId}
            className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
          >
            Save user permissions
          </button>
        </div>
      </div>
    </div>
  );
}

