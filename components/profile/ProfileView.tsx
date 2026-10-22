// components/profile/ProfileView.tsx
'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAvatar } from './useAvatar';
import { Camera, LockKeyhole, UserRound, SquarePen, Check, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserProfile, logout } from '@/store/slices/userSlice';
import ProfileSidebar from './ProfileSidebar';
import Avatar from './Avatar';
import Link from 'next/link';

const subscribeNever = () => () => {};

const buttonClass =
  'inline-flex min-h-10 items-center cursor-pointer justify-center gap-2 rounded-lg bg-[#fdde0b] px-4 py-2 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#f5d200] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525] disabled:cursor-not-allowed disabled:opacity-60';

const panelClass =
  'relative rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-7';

function formatBirthday(value?: string | null) {
  if (!value) return 'Not provided';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not provided';
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDateForInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function getNameParts(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
}

interface ProfileFieldProps {
  name: string;
  type: string;
  label: string;
  value: string;
  editable: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ProfileField({ name, type, label, value, editable, onChange }: ProfileFieldProps) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[#eeeeee] py-4 last:border-b-0 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-5 sm:items-center">
      <dt className="text-sm font-medium text-[#777777]">
        {label}
      </dt>

      <dd className="min-w-0 break-words text-sm font-semibold text-[#252525]">
        {editable ? (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-1.5 text-sm font-normal text-[#252525] transition-colors focus:border-[#252525] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#252525]"
          />
        ) : (
          <span>{value || 'Not provided'}</span>
        )}
      </dd>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div
      className="mx-auto grid min-h-[420px] max-w-[1200px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8"
      aria-label="Loading your profile"
      aria-busy="true"
      role="status"
    >
      <div className="h-56 animate-pulse rounded-2xl bg-[#f1f1f1]" />

      <div className="space-y-5 rounded-2xl border border-[#eeeeee] p-6">
        <div className="h-7 w-40 animate-pulse rounded bg-[#eeeeee]" />

        <div className="flex items-center gap-4">
          <div className="size-20 animate-pulse rounded-full bg-[#eeeeee]" />

          <div className="flex-1 space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#eeeeee]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[#eeeeee]" />
          </div>
        </div>

        <div className="space-y-4 pt-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-[#f5f5f5]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfileView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);
  const fileInput = useRef<HTMLInputElement>(null);

  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );

  const avatar = useAvatar(
    user?.user_id,
    user?.avatar_url
  );

  const { firstName, lastName } = getNameParts(user?.full_name || '');

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(() => ({
    firstName,
    lastName,
    email: user?.email || '',
    birthday: formatDateForInput(user?.birthday),
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (mounted && !user) {
      router.replace('/login');
    }
  }, [mounted, user, router]);

  if (!mounted || !user) {
    return <ProfileSkeleton />;
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleLogout() {
    dispatch(logout());
    router.replace('/login');
  }

  function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    void avatar.upload(file);
    event.target.value = '';
  }

  function handleStartEdit() {
    setFormData({
      firstName,
      lastName,
      email: user?.email || '',
      birthday: formatDateForInput(user?.birthday),
    });
    setSaveError(null);
    setIsEditMode(true);
  }

  function handleCancelEdit() {
    setIsEditMode(false);
    setSaveError(null);
  }

  async function handleSaveProfile() {
    if (!user) return;

    setIsSaving(true);
    setSaveError(null);

    const full_name = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.user_id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          birthday: formData.birthday || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      dispatch(
        updateUserProfile({
          full_name,
          email: formData.email,
          birthday: formData.birthday || null,
        })
      );

      setIsEditMode(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-[60vh] bg-[#fafafa]">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-7">
          <p className="text-sm font-medium text-[#777777]">
            Account / Profile
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#252525] sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#777777]">
            View your personal information and manage your account settings.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <ProfileSidebar
            name={user.full_name}
            avatarSrc={avatar.src}
            onLogout={handleLogout}
            isAdmin={user.role === 'admin'}
          />

          <div className="min-w-0 space-y-6">
            <section
              aria-labelledby="personal-information-heading"
              className={panelClass}
            >
              <div className="flex flex-col gap-5 border-b border-[#eeeeee] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserRound
                      size={20}
                      aria-hidden="true"
                      className="text-[#777777]"
                    />

                    <h2
                      id="personal-information-heading"
                      className="text-lg font-bold text-[#252525]"
                    >
                      Personal information
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-[#777777]">
                    Your profile details and contact information.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar
                    name={user.full_name}
                    src={avatar.src}
                    className="size-16 shrink-0 text-lg"
                  />

                  <div className="min-w-0">
                    <p className="break-words font-semibold text-[#252525]">
                      {user.full_name}
                    </p>

                    <p className="mt-1 text-xs text-[#777777]">
                      Profile photo
                    </p>
                  </div>
                </div>
              </div>

              <dl className="mt-2">
                <ProfileField
                  name="firstName"
                  type="text"
                  label="First name"
                  value={isEditMode ? formData.firstName : firstName}
                  editable={isEditMode}
                  onChange={handleInputChange}
                />
                <ProfileField
                  name="lastName"
                  type="text"
                  label="Last name"
                  value={isEditMode ? formData.lastName : lastName}
                  editable={isEditMode}
                  onChange={handleInputChange}
                />
                <ProfileField
                  name="email"
                  type="email"
                  label="Email address"
                  value={isEditMode ? formData.email : user.email || ''}
                  editable={isEditMode}
                  onChange={handleInputChange}
                />
                <ProfileField
                  name="birthday"
                  type="date"
                  label="Birthday"
                  value={isEditMode ? formData.birthday : formatBirthday(user.birthday)}
                  editable={isEditMode}
                  onChange={handleInputChange}
                />
              </dl>

              {saveError && (
                <p className="mt-3 text-xs font-medium text-red-600" role="alert">
                  {saveError}
                </p>
              )}

              {isEditMode ? (
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 cursor-pointer rounded-lg bg-[#fdde0b] px-3 py-1.5 text-xs font-semibold text-[#252525] transition-colors hover:bg-[#f5d200] disabled:opacity-50"
                  >
                    <Check size={14} /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label="Edit personal information"
                  className="absolute bottom-4 right-4 flex size-12 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={handleStartEdit}
                >
                  <SquarePen size={18} aria-hidden="true" />
                </button>
              )}
            </section>

            <section
              aria-labelledby="profile-photo-heading"
              className={panelClass}
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff8cc] text-[#252525]">
                  <Camera size={20} aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    id="profile-photo-heading"
                    className="font-bold text-[#252525]"
                  >
                    Profile photo
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#777777]">
                    Personalize your account with a photo. Use an image
                    smaller than 5 MB.
                  </p>

                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    aria-label="Choose a profile photo"
                    onChange={handlePhotoChange}
                  />

                  <button
                    type="button"
                    className={`${buttonClass} mt-4`}
                    disabled={avatar.isUploading}
                    onClick={() => fileInput.current?.click()}
                  >
                    <Camera size={16} aria-hidden="true" />
                    {avatar.isUploading ? 'Uploading...' : 'Change photo'}
                  </button>

                  {avatar.error && (
                    <p
                      role="alert"
                      className="mt-3 text-sm text-red-600"
                    >
                      {avatar.error}
                    </p>
                  )}

                  <p className="mt-3 text-xs leading-5 text-[#888888]">
                    Your photo is saved to your account and will
                    appear on every device you sign in from.
                  </p>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="security-heading"
              className={panelClass}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f2f2] text-[#252525]">
                    <LockKeyhole size={20} aria-hidden="true" />
                  </div>

                  <div>
                    <h2
                      id="security-heading"
                      className="font-bold text-[#252525]"
                    >
                      Password and security
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#777777]">
                      Manage your account password.
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile/password"
                  className={buttonClass}
                >
                  Change password
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}