"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Settings as SettingsIcon, Bell, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [aiPreferences, setAiPreferences] = useState({
    defaultTone: "PROFESSIONAL",
    defaultIntensity: "MEDIUM",
    contentLength: "MEDIUM",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    publishNotifications: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/settings");
    } else if (status === "authenticated") {
      loadSettings();
    }
  }, [status, router]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);

      // Load user profile
      if (session?.user) {
        setProfile({
          name: session.user.name || "",
          email: session.user.email || "",
        });
      }

      // Load settings
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setAiPreferences({
          defaultTone: data.defaultTone || "PROFESSIONAL",
          defaultIntensity: data.defaultIntensity || "MEDIUM",
          contentLength: data.contentLength || "MEDIUM",
        });
        setNotifications({
          emailNotifications: data.emailNotifications ?? true,
          publishNotifications: data.publishNotifications ?? true,
        });
      }
    } catch (error: any) {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Update profile
      const profileResponse = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name }),
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to update profile");
      }

      // Update settings
      const settingsResponse = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...aiPreferences,
          ...notifications,
        }),
      });

      if (!settingsResponse.ok) {
        throw new Error("Failed to update settings");
      }

      // Update session
      await update();

      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="input-field"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="input-field bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-text-secondary mt-1">
                Email cannot be changed
              </p>
            </div>
          </div>
        </div>

        {/* AI Preferences */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">AI Preferences</h2>
          </div>
          <p className="text-sm text-text-secondary mb-6">
            These preferences will be used as defaults when generating new posts
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Default Tone
              </label>
              <select
                value={aiPreferences.defaultTone}
                onChange={(e) =>
                  setAiPreferences({ ...aiPreferences, defaultTone: e.target.value })
                }
                className="input-field"
              >
                <option value="PROFESSIONAL">Professional</option>
                <option value="CASUAL">Casual</option>
                <option value="BOLD">Bold</option>
                <option value="INSPIRATIONAL">Inspirational</option>
                <option value="EDUCATIONAL">Educational</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Default Intensity
              </label>
              <select
                value={aiPreferences.defaultIntensity}
                onChange={(e) =>
                  setAiPreferences({ ...aiPreferences, defaultIntensity: e.target.value })
                }
                className="input-field"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="EXTREME">Extreme</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Content Length
              </label>
              <select
                value={aiPreferences.contentLength}
                onChange={(e) =>
                  setAiPreferences({ ...aiPreferences, contentLength: e.target.value })
                }
                className="input-field"
              >
                <option value="SHORT">Short (100-150 words)</option>
                <option value="MEDIUM">Medium (150-250 words)</option>
                <option value="LONG">Long (250+ words)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-text-primary">Email Notifications</div>
                <div className="text-sm text-text-secondary">
                  Receive updates via email
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-text-primary">Post Reminders</div>
                <div className="text-sm text-text-secondary">
                  Get reminded about scheduled posts
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.publishNotifications}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      publishNotifications: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
