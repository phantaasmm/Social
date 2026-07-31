import {
  BadgeCheck,
  Camera,
  Globe2,
  ImageUp,
  LockKeyhole,
  LogOut,
  Pencil,
  RefreshCw,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Switch,
  Textarea,
  useToast,
} from "../components/ui";
import { useAuth } from "../features/auth/use-auth";
import { useProfile } from "../features/profile/use-profile";
import { supabase } from "../lib/supabase";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function ProfileSkeleton() {
  return (
    <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
      <CardContent className="animate-pulse p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-surface-2" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 rounded bg-surface-2" />
            <div className="h-4 w-28 rounded bg-surface-2" />
          </div>
        </div>
        <div className="mt-7 h-24 rounded-lg bg-surface-2" />
      </CardContent>
    </Card>
  );
}

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { profile, isLoading, error, refreshProfile } = useProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!profile || isEditing) {
      return;
    }

    setDisplayName(profile.display_name ?? "");
    setBio(profile.bio ?? "");
    setIsPrivate(profile.is_private);
  }, [isEditing, profile]);

  useEffect(
    () => () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    },
    [avatarPreview],
  );

  const name =
    profile?.display_name || profile?.username || user?.email || "Your profile";
  const visibleAvatar = avatarPreview ?? profile?.avatar_url ?? null;

  const startEditing = () => {
    if (!profile) {
      return;
    }

    setDisplayName(profile.display_name ?? "");
    setBio(profile.bio ?? "");
    setIsPrivate(profile.is_private);
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormError(null);
    setIsEditing(false);
  };

  const handleAvatarSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ACCEPTED_AVATAR_TYPES.has(file.type)) {
      setFormError("Choose a JPG, PNG, WebP, or GIF image.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setFormError("Avatar images must be 5 MB or smaller.");
      return;
    }

    setFormError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      throw new Error("Your session has expired. Sign in again.");
    }

    const extensionByType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const extension = extensionByType[file.type] ?? "jpg";
    const objectPath = `avatars/${user.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(objectPath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Avatar upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("media").getPublicUrl(objectPath);
    return data.publicUrl;
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !profile) {
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      const avatarUrl = avatarFile
        ? await uploadAvatar(avatarFile)
        : profile.avatar_url;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          is_private: isPrivate,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      await refreshProfile();
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your changes are now visible.",
        variant: "success",
      });
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "Your profile could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (signOutError) {
      setIsSigningOut(false);
      toast({
        title: "Could not sign out",
        description:
          signOutError instanceof Error
            ? signOutError.message
            : "Please try again.",
        variant: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <section aria-labelledby="profile-title">
        <PageHeader
          id="profile-title"
          title="Profile"
          description="Your identity, connections, and contributions in one place."
        />
        <ProfileSkeleton />
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section aria-labelledby="profile-title">
        <PageHeader
          id="profile-title"
          title="Profile"
          description="Your identity, connections, and contributions in one place."
        />
        <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
          <CardContent className="flex min-h-80 flex-col items-center justify-center p-6 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
              <ShieldCheck size={23} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-h2 text-foreground">
              Profile unavailable
            </h2>
            <p className="mt-2 max-w-md text-small leading-6 text-muted">
              {error ??
                "No profile row was found for this account. The app will not create one manually."}
            </p>
            <Button
              className="mt-5"
              variant="secondary"
              leftIcon={<RefreshCw size={17} aria-hidden="true" />}
              onClick={() => void refreshProfile()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section aria-labelledby="profile-title">
      <PageHeader
        id="profile-title"
        title="Profile"
        description="Manage how you appear and who can see your public posts."
        action={
          isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={cancelEditing}
              aria-label="Cancel editing"
              title="Cancel editing"
              disabled={isSaving}
            >
              <X size={19} aria-hidden="true" />
            </Button>
          ) : (
            <Button
              variant="secondary"
              leftIcon={<Pencil size={17} aria-hidden="true" />}
              onClick={startEditing}
            >
              Edit
            </Button>
          )
        }
      />

      {isEditing ? (
        <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
          <form onSubmit={handleSave}>
            <CardHeader className="border-b border-border">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <div className="relative">
                  <Avatar src={visibleAvatar} name={name} size="xl" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Choose a new avatar"
                    title="Choose a new avatar"
                  >
                    <Camera size={17} aria-hidden="true" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    aria-label="Choose a new profile photo"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarSelection}
                  />
                </div>
                <div>
                  <h2 className="text-h3 text-foreground">Profile photo</h2>
                  <p className="mt-1 text-small text-muted">
                    JPG, PNG, WebP, or GIF. Maximum 5 MB.
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    leftIcon={<ImageUp size={16} aria-hidden="true" />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose image
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-5 sm:pt-6">
              {formError && (
                <div
                  className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-small text-danger"
                  role="alert"
                >
                  {formError}
                </div>
              )}
              <Input
                label="Display name"
                placeholder="How should people know you?"
                maxLength={80}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
              <Textarea
                label="Bio"
                placeholder="Tell your network a little about yourself."
                maxLength={240}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
              />
              <Switch
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                label="Private account"
                description={
                  isPrivate
                    ? "Only accepted friends can see posts you mark public."
                    : "Anyone can see posts you mark public."
                }
              />
              <div className="rounded-lg border border-accent/25 bg-accent/10 p-3 text-xs leading-5 text-muted">
                Organisation posts remain visible to verified members of the
                same email domain, even when your account is private.
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftIcon={<Save size={17} aria-hidden="true" />}
                  isLoading={isSaving}
                >
                  Save changes
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
            <CardHeader className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <Avatar src={profile.avatar_url} name={name} size="xl" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h2 className="truncate text-h2 text-foreground">{name}</h2>
                  <BadgeCheck
                    size={19}
                    className="shrink-0 text-accent"
                    aria-label="Verified email"
                  />
                </div>
                <p className="mt-1 truncate text-small text-muted">
                  @{profile.username}
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                    <BadgeCheck size={13} aria-hidden="true" />
                    {profile.email_domain}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
                    {profile.is_private ? (
                      <LockKeyhole size={13} aria-hidden="true" />
                    ) : (
                      <Globe2 size={13} aria-hidden="true" />
                    )}
                    {profile.is_private ? "Private account" : "Public account"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="border-t border-border pt-5 sm:pt-6">
              <h3 className="text-small font-semibold text-foreground">About</h3>
              <p className="mt-2 whitespace-pre-wrap text-body leading-7 text-muted">
                {profile.bio || "No bio yet. Add one to introduce yourself."}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-none border-x-0 shadow-none sm:rounded-card sm:border-x">
            <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
              <div>
                <p className="text-small font-semibold text-foreground">
                  Signed in as
                </p>
                <p className="mt-1 break-all text-small text-muted">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                leftIcon={<LogOut size={17} aria-hidden="true" />}
                isLoading={isSigningOut}
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
