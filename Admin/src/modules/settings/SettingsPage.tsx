import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store';

export function SettingsPage() {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Manage platform settings</p>
      </div>

      <div className="glass rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Display Name</label>
              <input type="text" defaultValue={user?.display_name || ''}
                className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-emerald/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input type="email" defaultValue={user?.email || ''} disabled
                className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-text-muted cursor-not-allowed" />
            </div>
          </div>
          <Button type="submit" isLoading={saving}>
            <Save size={16} /> Save Changes
          </Button>
        </form>
      </div>

      <div className="glass rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Platform</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white text-sm font-medium">Maintenance Mode</p>
              <p className="text-text-secondary text-xs">Disable public access to the platform</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 bg-surface-hover rounded-full peer peer-checked:bg-emerald after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white text-sm font-medium">Allow Registration</p>
              <p className="text-text-secondary text-xs">Enable new user sign-ups</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-surface-hover rounded-full peer peer-checked:bg-emerald after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
