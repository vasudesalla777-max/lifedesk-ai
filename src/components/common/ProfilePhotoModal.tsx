import React, { useState, useRef } from 'react';
import { Camera, Upload, Link as LinkIcon, Sparkles, Trash2, Check, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  {
    id: 'vasu-creator',
    name: 'Vasu Desalla (Founder)',
    role: 'Creator & Lead Engineer',
    url: '/creator-photo.png',
  },
  {
    id: 'cyber-orb',
    name: 'Neural AI Core',
    role: 'Synthesized Intelligence',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=360&auto=format&fit=crop&q=80',
  },
  {
    id: 'tech-lead',
    name: 'Futuristic Architect',
    role: 'Engineering Lead',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&auto=format&fit=crop&q=80',
  },
  {
    id: 'developer',
    name: 'Cyberpunk Engineer',
    role: 'Systems Developer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=360&auto=format&fit=crop&q=80',
  },
  {
    id: 'synthwave',
    name: 'Synthwave Matrix',
    role: 'Digital Nomad',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=360&auto=format&fit=crop&q=80',
  },
  {
    id: 'deep-space',
    name: 'Deep Space Voyager',
    role: 'Cosmic Explorer',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=360&auto=format&fit=crop&q=80',
  },
];

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { showToast } = useData();

  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(user?.avatar_url || '');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const initials = (user?.full_name || user?.email || 'U')
    .split(/\s+/)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (.png, .jpg, .webp)', 'warning');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleApplyPreset = (url: string) => {
    setSelectedFile(null);
    setPreviewUrl(url);
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) {
      showToast('Please enter an image URL', 'warning');
      return;
    }
    setSelectedFile(null);
    setPreviewUrl(customUrlInput.trim());
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedFile) {
        await uploadAvatar(selectedFile);
      } else {
        await updateProfile({ avatar_url: previewUrl });
      }
      showToast('Profile photo updated successfully!', 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update profile photo', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ avatar_url: '' });
      setPreviewUrl('');
      setSelectedFile(null);
      showToast('Profile photo removed. Showing initials.', 'info');
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to remove photo', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg glass-card border border-white/10 rounded-2xl p-6 z-10 shadow-2xl bg-slate-900/95 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Camera className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Customize Profile Photo</h3>
              <p className="text-xs text-slate-400">Update your personal 3D avatar or portrait</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar Live Preview */}
        <div className="py-6 flex flex-col items-center justify-center border-b border-white/5 bg-white/[0.01]">
          <div className="relative">
            {/* Glowing outer halo */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-500 blur-md opacity-40 animate-pulse" />

            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 bg-slate-950 flex items-center justify-center shadow-xl">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                  onError={() => {
                    showToast('Could not load image from URL', 'warning');
                    setPreviewUrl('');
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-2xl font-black text-white">
                  {initials}
                </div>
              )}
            </div>

            {previewUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                title="Remove photo and reset to initials"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-red-500/90 text-white hover:bg-red-600 border border-slate-950 shadow-md transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="mt-3 text-xs font-semibold text-slate-300">
            {previewUrl ? 'Current Preview' : 'Default Initials Avatar'}
          </p>
          <p className="text-[11px] text-slate-500">
            {user?.full_name || user?.email}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1.5 mt-5 p-1 rounded-xl bg-white/5 border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'presets'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'url'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" /> Image URL
          </button>
        </div>

        {/* Tab 1: Upload from Computer */}
        {activeTab === 'upload' && (
          <div className="mt-4 space-y-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-white/10 hover:border-amber-500/30 bg-white/[0.02]'
              }`}
            >
              <Upload className="w-7 h-7 text-amber-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-white">Click or drag image file here</p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, JPEG, WEBP up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>

            {selectedFile && (
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate max-w-[240px] font-mono">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-amber-400 font-semibold">Ready to save</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Presets Gallery */}
        {activeTab === 'presets' && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-slate-400 mb-2">Select a curated persona:</p>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = previewUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.url)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{preset.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{preset.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Custom URL */}
        {activeTab === 'url' && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Paste Direct Image Web Address
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="field text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all shrink-0"
                >
                  Preview
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Supports Gravatar, GitHub profile photos, Unsplash, or any public HTTPS image link.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {user?.avatar_url && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isSaving}
                className="px-3 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
              >
                Remove Photo
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary text-xs py-2 px-4 shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Apply Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
