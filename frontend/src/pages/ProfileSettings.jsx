import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Camera,
  Globe,
  KeyRound,
  Loader2,
  LogOut,
  MapPin,
  Moon,
  ShieldAlert,
  Trash2,
  User,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { userApi } from "../lib/api.js";
import { mediaUrl } from "../lib/mediaUrl.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { Button } from "../components/ui/Button.jsx";

const LANGS = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "pt", label: "Português" },
  { value: "it", label: "Italiano" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "INR", "BRL", "CHF"];

const NAV = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: KeyRound },
  { id: "saved", label: "Saved places", icon: MapPin },
  { id: "danger", label: "Account", icon: ShieldAlert },
];

function scrollToId(id) {
  document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function ProfileSettings() {
  const { user, logout, refreshUser } = useAuth();
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [destinations, setDestinations] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profileErrors, setProfileErrors] = useState({});

  const [language, setLanguage] = useState("en");
  const [themePref, setThemePref] = useState("system");
  const [currency, setCurrency] = useState("USD");

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifyTripReminders, setNotifyTripReminders] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deleteEmail, setDeleteEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);

  const [savedCity, setSavedCity] = useState("");
  const [savedCountry, setSavedCountry] = useState("");
  const [savedImage, setSavedImage] = useState("");
  const [addingDest, setAddingDest] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, d] = await Promise.all([userApi.getProfile(), userApi.savedDestinations()]);
      const u = p.profile;
      setProfile(u);
      setName(u.name || "");
      setEmail(u.email || "");
      setBio(u.bio || "");
      setLanguage(u.language || "en");
      setThemePref(u.theme || "system");
      setCurrency(u.currency || "USD");
      setNotificationsEnabled(!!u.notificationsEnabled);
      setNotifyTripReminders(!!u.notifyTripReminders);
      setNotifyWeeklyDigest(!!u.notifyWeeklyDigest);
      setDestinations(d.destinations || []);
    } catch (e) {
      toast.error(e.message || "Could not load settings");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleSaveProfile(ev) {
    ev.preventDefault();
    setProfileErrors({});
    if (!name.trim()) {
      setProfileErrors({ name: "Name is required" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setProfileErrors({ email: "Enter a valid email" });
      return;
    }
    setSavingProfile(true);
    try {
      const { profile: next } = await userApi.updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        bio,
      });
      setProfile(next);
      await refreshUser();
      toast.success("Profile updated");
    } catch (e) {
      const errs = e.data?.errors;
      if (errs && typeof errs === "object") setProfileErrors(errs);
      toast.error(e.message || "Could not save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePreferences(ev) {
    ev.preventDefault();
    setSavingPrefs(true);
    try {
      const { profile: next } = await userApi.updatePreferences({
        language,
        theme: themePref,
        currency,
        notificationsEnabled,
        notifyTripReminders,
        notifyWeeklyDigest,
      });
      setProfile(next);
      await refreshUser();
      if (themePref === "system") {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(dark ? "dark" : "light");
      } else {
        setTheme(themePref);
      }
      toast.success("Preferences saved");
    } catch (e) {
      toast.error(e.message || "Could not save preferences");
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handlePhotoPick(ev) {
    const file = ev.target.files?.[0];
    const input = ev.target;
    if (!file) return;

    const looksImage =
      (file.type && file.type.startsWith("image/")) || /\.(jpe?g|png|gif|webp|bmp)$/i.test(file.name);
    if (!looksImage) {
      toast.error("Choose an image file");
      input.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller");
      input.value = "";
      return;
    }

    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("photo", file);
    setUploadingPhoto(true);
    try {
      const data = await userApi.uploadPhoto(fd);
      setProfile((p) => (p ? { ...p, profilePhoto: data.profilePhoto } : p));
      setPreviewUrl(null);
      await refreshUser();
      toast.success("Profile photo updated");
    } catch (e) {
      toast.error(e.message || "Upload failed");
      setPreviewUrl(null);
    } finally {
      setUploadingPhoto(false);
      input.value = "";
    }
  }

  async function removePhoto() {
    setSavingProfile(true);
    try {
      const { profile: next } = await userApi.updateProfile({ profilePhoto: "" });
      setProfile(next);
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = "";
      await refreshUser();
      toast.success("Photo removed");
    } catch (e) {
      toast.error(e.message || "Could not remove photo");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(ev) {
    ev.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed");
    } catch (e) {
      toast.error(e.message || "Could not change password");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deleteEmail.trim()) {
      toast.error("Enter your email to confirm");
      return;
    }
    setDeleting(true);
    try {
      await userApi.deleteAccount({ confirmEmail: deleteEmail.trim() });
      toast.success("Account deleted");
      logout();
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(e.message || "Could not delete account");
    } finally {
      setDeleting(false);
    }
  }

  async function addDestination(ev) {
    ev.preventDefault();
    if (!savedCity.trim() || !savedCountry.trim()) {
      toast.error("City and country are required");
      return;
    }
    setAddingDest(true);
    try {
      const { destination } = await userApi.addSavedDestination({
        cityName: savedCity.trim(),
        country: savedCountry.trim(),
        imageUrl: savedImage.trim(),
      });
      setDestinations((d) => [destination, ...d]);
      setSavedCity("");
      setSavedCountry("");
      setSavedImage("");
      toast.success("Destination saved");
    } catch (e) {
      toast.error(e.message || "Could not save");
    } finally {
      setAddingDest(false);
    }
  }

  async function removeDestination(id) {
    if (!window.confirm("Remove this saved place?")) return;
    try {
      await userApi.removeSavedDestination(id);
      setDestinations((d) => d.filter((x) => x.id !== id));
      toast.success("Removed");
    } catch (e) {
      toast.error(e.message || "Could not remove");
    }
  }

  const displayPhoto = previewUrl || mediaUrl(profile?.profilePhoto);

  if (loading && !profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        Loading settings…
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Profile & settings"
        subtitle={user?.email ? `Signed in as ${user.email}` : "Manage your account"}
        actions={
          <Button
            variant="secondary"
            type="button"
            className="gap-2"
            onClick={() => {
              logout();
              navigate("/");
              toast.info("Signed out");
            }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        }
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start">
        <nav className="glass-panel sticky top-20 z-10 flex shrink-0 gap-1 overflow-x-auto rounded-2xl p-2 lg:top-24 lg:w-56 lg:flex-col lg:overflow-visible">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToId(id)}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-slate-800/80"
            >
              <Icon className="h-4 w-4 opacity-80" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-10 pb-16">
          <section id="settings-profile" className="scroll-mt-28">
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Profile</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Photo, name, email, and bio visible to you only.</p>

              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                    {displayPhoto ? (
                      <img src={displayPhoto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl text-slate-400">👤</div>
                    )}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                        <Loader2 className="h-9 w-9 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoPick}
                  />
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="gap-2"
                      disabled={uploadingPhoto}
                      onClick={() => fileRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                      {uploadingPhoto ? "Uploading…" : "Change photo"}
                    </Button>
                    {profile?.profilePhoto && !uploadingPhoto && (
                      <Button type="button" size="sm" variant="ghost" onClick={removePhoto}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <form className="min-w-0 flex-1 space-y-4" onSubmit={handleSaveProfile}>
                  <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={profileErrors.name} />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={profileErrors.email}
                  />
                  <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} hint="Max 5000 characters" />
                  {profileErrors.bio && <p className="text-sm text-red-600 dark:text-red-400">{profileErrors.bio}</p>}
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save profile"}
                  </Button>
                </form>
              </div>
            </Card>
          </section>

          <section id="settings-preferences" className="scroll-mt-28">
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Preferences</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Language, theme, and default currency for budgets.</p>
              <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSavePreferences}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Language</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {LANGS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Moon className="h-4 w-4" />
                    Theme
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
                    value={themePref}
                    onChange={(e) => setThemePref(e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full sm:w-auto" disabled={savingPrefs}>
                    {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save preferences"}
                  </Button>
                </div>
              </form>
            </Card>
          </section>

          <section id="settings-notifications" className="scroll-mt-28">
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Control planning alerts and digests (email delivery can be added later).</p>
              <form className="mt-6 space-y-3" onSubmit={handleSavePreferences}>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/60 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/50">
                  <span className="text-sm text-slate-800 dark:text-slate-200">Enable notifications</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/60 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/50">
                  <span className="text-sm text-slate-800 dark:text-slate-200">Trip reminders</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={notifyTripReminders}
                    disabled={!notificationsEnabled}
                    onChange={(e) => setNotifyTripReminders(e.target.checked)}
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/60 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/50">
                  <span className="text-sm text-slate-800 dark:text-slate-200">Weekly digest</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={notifyWeeklyDigest}
                    disabled={!notificationsEnabled}
                    onChange={(e) => setNotifyWeeklyDigest(e.target.checked)}
                  />
                </label>
                <Button type="submit" variant="secondary" disabled={savingPrefs}>
                  Save notification settings
                </Button>
              </form>
            </Card>
          </section>

          <section id="settings-security" className="scroll-mt-28">
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Security</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Change your password. You will stay signed in.</p>
              <form className="mt-6 max-w-md space-y-4" onSubmit={handleChangePassword}>
                <Input
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  hint="At least 8 characters"
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button type="submit" variant="secondary" disabled={savingPassword}>
                  {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
                </Button>
              </form>
            </Card>
          </section>

          <section id="settings-saved" className="scroll-mt-28">
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Saved destinations</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Places you want to revisit — add manually for now.</p>
              <form className="mt-6 grid gap-3 sm:grid-cols-3" onSubmit={addDestination}>
                <Input label="City" value={savedCity} onChange={(e) => setSavedCity(e.target.value)} placeholder="Lisbon" />
                <Input label="Country" value={savedCountry} onChange={(e) => setSavedCountry(e.target.value)} placeholder="Portugal" />
                <Input label="Image URL (optional)" value={savedImage} onChange={(e) => setSavedImage(e.target.value)} />
                <div className="sm:col-span-3">
                  <Button type="submit" variant="secondary" disabled={addingDest}>
                    {addingDest ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add destination"}
                  </Button>
                </div>
              </form>
              {destinations.length === 0 ? (
                <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">No saved destinations yet.</p>
              ) : (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {destinations.map((d) => (
                    <li key={d.id} className="flex gap-3 rounded-xl border border-slate-200/80 p-3 dark:border-slate-700">
                      {d.imageUrl ? (
                        <img src={mediaUrl(d.imageUrl)} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl dark:bg-slate-800">📍</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{d.cityName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{d.country}</p>
                        <button
                          type="button"
                          className="mt-2 text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                          onClick={() => removeDestination(d.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

          <section id="settings-danger" className="scroll-mt-28">
            <Card className="border-red-200/80 bg-red-50/40 p-5 dark:border-red-900/50 dark:bg-red-950/20 sm:p-6">
              <h2 className="font-display text-lg font-semibold text-red-900 dark:text-red-200">Delete account</h2>
              <p className="mt-1 text-sm text-red-800/90 dark:text-red-300/90">
                Permanently delete your account, trips, notes, and saved data. This cannot be undone.
              </p>
              <div className="mt-6 max-w-md space-y-3">
                <Input
                  label={`Type your email to confirm`}
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                <Button type="button" variant="danger" className="gap-2" disabled={deleting} onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting…" : "Delete my account"}
                </Button>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}
