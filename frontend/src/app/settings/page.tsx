"use client";

import { useState } from "react";
import { useProviders, patchProvider, type ProviderInfo } from "@/lib/hooks";

export default function SettingsPage() {
  const { providers, refresh } = useProviders();
  const [editing, setEditing] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (p: ProviderInfo) => {
    setEditing(p.name);
    setKeyInput("");
    setUrlInput(p.baseUrl);
  };

  const handleSave = async (name: string) => {
    setSaving(true);
    const update: Record<string, unknown> = {};
    if (keyInput) update.apiKey = keyInput;
    if (urlInput) update.baseUrl = urlInput;
    await patchProvider(name, update);
    await refresh();
    setEditing(null);
    setKeyInput("");
    setSaving(false);
  };

  const handleToggle = async (name: string, enabled: boolean) => {
    await patchProvider(name, { enabled: !enabled });
    await refresh();
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-xs text-gray-500 mt-1">Configure LLM providers and API keys</p>
      </div>

      <div className="space-y-3">
        {providers.map((p) => (
          <div key={p.name} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className={`w-2 h-2 rounded-full ${p.hasKey ? "bg-emerald-400" : "bg-gray-600"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{p.label || p.name}</span>
                  {!p.enabled && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-500">disabled</span>}
                </div>
                <p className="text-[10px] text-gray-500 truncate">{p.baseUrl}</p>
                <p className="text-[10px] text-gray-600">
                  {p.models.length} models · Key: {p.hasKey ? p.apiKey : "not set"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(p.name, p.enabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${p.enabled ? "bg-blue-600" : "bg-gray-700"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${p.enabled ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
                </button>
                <button
                  onClick={() => editing === p.name ? setEditing(null) : startEdit(p)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-colors"
                >
                  {editing === p.name ? "Cancel" : "Edit"}
                </button>
              </div>
            </div>

            {editing === p.name && (
              <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02] space-y-3">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">API Key</label>
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Enter new API key..."
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Base URL</label>
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave(p.name)}
                    disabled={saving}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium transition-colors"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {providers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">Loading providers...</p>
        </div>
      )}
    </div>
  );
}
