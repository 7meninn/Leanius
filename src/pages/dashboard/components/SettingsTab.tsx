import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useUI } from '../../../hooks/useUI';
import { profileUpdateSchema, passwordChangeSchema, ProfileUpdateFormData, PasswordChangeFormData } from '../../../utils/validation';

/**
 * Settings Tab - User profile and password management
 */
export const SettingsTab: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useUI();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onProfileSubmit = async (data: ProfileUpdateFormData) => {
    setIsUpdatingProfile(true);
    try {
      await updateProfile(data.name);
      showToast('success', 'Profile updated successfully!');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordChangeFormData) => {
    setIsChangingPassword(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      showToast('success', 'Password changed successfully!');
      passwordForm.reset();
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-[var(--ink)] mb-8">Settings</h1>

      {/* Profile Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Profile</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 card p-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
              Name
            </label>
            <input
              {...profileForm.register('name')}
              type="text"
              id="name"
              className="input-base"
            />
            {profileForm.formState.errors.name && (
              <p className="mt-1 text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="input-muted"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingProfile ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </section>

      {/* Password Section */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 card p-6">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
              Current Password
            </label>
            <input
              {...passwordForm.register('currentPassword')}
              type="password"
              id="currentPassword"
              className="input-base"
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="mt-1 text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
              New Password
            </label>
            <input
              {...passwordForm.register('newPassword')}
              type="password"
              id="newPassword"
              className="input-base"
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="mt-1 text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
              Confirm New Password
            </label>
            <input
              {...passwordForm.register('confirmNewPassword')}
              type="password"
              id="confirmNewPassword"
              className="input-base"
            />
            {passwordForm.formState.errors.confirmNewPassword && (
              <p className="mt-1 text-sm text-red-500">{passwordForm.formState.errors.confirmNewPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </section>
    </div>
  );
};

export default SettingsTab;
