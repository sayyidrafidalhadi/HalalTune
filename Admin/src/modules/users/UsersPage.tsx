import { useState } from 'react';
import { Users, Shield, Ban, CheckCircle } from 'lucide-react';
import { DataTable, Button, Modal, StatusBadge, EmptyState, ConfirmDialog } from '@/components/ui';
import { useUsers } from '@/hooks';
import { formatDate } from '@/lib/utils';
import type { Profile, UserRole } from '@/types';

const roleOptions: UserRole[] = ['superadmin', 'admin', 'moderator', 'creator', 'user'];

export function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [banConfirm, setBanConfirm] = useState<string | null>(null);

  const handleRoleUpdate = async (userId: string, role: UserRole) => {
    const { db } = await import('@/services');
    await db.updateUser(userId, { role });
    setSelectedUser(null);
  };

  const handleBanToggle = async (userId: string, isBanned: boolean) => {
    const { db } = await import('@/services');
    await db.updateUser(userId, { is_banned: isBanned, ban_reason: isBanned ? 'Banned by admin' : null });
    setBanConfirm(null);
  };

  const columns = [
    {
      key: 'display_name',
      header: 'User',
      sortable: true,
      render: (u: Profile) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald/20 flex items-center justify-center text-emerald text-sm font-semibold">
            {u.display_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-white font-medium">{u.display_name || 'Unnamed'}</p>
            <p className="text-xs text-text-secondary">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u: Profile) => <StatusBadge status={u.role} />,
    },
    {
      key: 'is_verified_creator',
      header: 'Creator',
      render: (u: Profile) => (
        u.is_verified_creator ? <CheckCircle size={16} className="text-emerald" /> : null
      ),
    },
    {
      key: 'is_banned',
      header: 'Status',
      render: (u: Profile) => (
        u.is_banned ? <StatusBadge status="banned" /> : <StatusBadge status="active" />
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (u: Profile) => <span className="text-text-secondary">{formatDate(u.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (u: Profile) => (
        <button onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-white">
          <Shield size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-text-secondary text-sm mt-1">Manage users, roles, and permissions</p>
      </div>

      {users?.length === 0 && !isLoading ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <DataTable
          columns={columns}
          data={users || []}
          keyExtractor={(u) => u.id}
          isLoading={isLoading}
          searchKeys={['display_name', 'email']}
        />
      )}

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Manage User" size="md">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald/20 flex items-center justify-center text-emerald text-xl font-semibold">
                {selectedUser.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{selectedUser.display_name || 'Unnamed'}</p>
                <p className="text-sm text-text-secondary">{selectedUser.email}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">Role</p>
              <div className="flex flex-wrap gap-2">
                {roleOptions.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleUpdate(selectedUser.id, role)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      selectedUser.role === role
                        ? 'bg-emerald/10 text-emerald border-emerald/30'
                        : 'bg-surface text-text-secondary border-border hover:border-emerald/30 hover:text-white'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant={selectedUser.is_banned ? 'secondary' : 'danger'}
                onClick={() => { setBanConfirm(selectedUser.id); setSelectedUser(null); }}
                className="flex-1"
              >
                {selectedUser.is_banned ? <CheckCircle size={14} /> : <Ban size={14} />}
                {selectedUser.is_banned ? 'Unban User' : 'Ban User'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!banConfirm}
        onClose={() => setBanConfirm(null)}
        onConfirm={async () => {
          if (banConfirm) {
            const user = users?.find((u) => u.id === banConfirm);
            await handleBanToggle(banConfirm, !user?.is_banned);
          }
        }}
        title="Toggle User Ban"
        message="Are you sure you want to change this user's ban status?"
        confirmLabel="Confirm"
      />
    </div>
  );
}
