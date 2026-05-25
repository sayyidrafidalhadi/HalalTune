import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon,
  Globe,
  Bell,
  Shield,
  Palette,
  Cloud,
  Database,
  Save,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export function Settings() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
  };

  const SettingSection = ({ icon: Icon, title, children }: any) => (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-6">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">Settings</h1>
          <p className="text-white/40 mt-3 text-lg font-medium">Configure platform defaults and integrations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-black font-black cinematic-shadow hover:scale-105 transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? <><Check className="w-5 h-5" /> Saved</> : <><Save className="w-5 h-5" /> Save Changes</>}
        </button>
      </div>

      <div className="space-y-8">
        <SettingSection icon={Globe} title="General Configuration">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Platform Name</label>
              <Input defaultValue="HalalTune" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Support Email</label>
              <Input defaultValue="support@halaltune.com" />
            </div>
          </div>
        </SettingSection>

        <SettingSection icon={Cloud} title="Cloud Infrastructure">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-bold">Firebase Firestore</p>
                  <p className="text-xs text-white/40">Real-time database connection</p>
                </div>
              </div>
              <Badge variant="halal">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Cloud className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-bold">Cloudinary Storage</p>
                  <p className="text-xs text-white/40">Media delivery network</p>
                </div>
              </div>
              <Badge variant="halal">Connected</Badge>
            </div>
          </div>
        </SettingSection>

        <SettingSection icon={Shield} title="Security & Compliance">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Strict Halal Verification</p>
                <p className="text-xs text-white/40 italic">All tracks must undergo manual verification before publishing.</p>
              </div>
              <div className="w-12 h-6 rounded-full bg-primary/20 border border-primary/50 relative p-1 cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-primary absolute right-1 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Auto-Ban Flagged Content</p>
                <p className="text-xs text-white/40 italic">Ban tracks automatically if they receive more than 10 reports.</p>
              </div>
              <div className="w-12 h-6 rounded-full bg-white/5 border border-white/10 relative p-1 cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-white/20 absolute left-1" />
              </div>
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}
