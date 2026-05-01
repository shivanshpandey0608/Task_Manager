import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '@/api/users';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const profileMutation = useMutation({
    mutationFn: (data) => usersApi.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => usersApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return toast.error('Name is required');
    profileMutation.mutate(profile);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    const { confirm, ...data } = passwords;
    passwordMutation.mutate(data);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your display name and avatar</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar || user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-lg bg-primary/20 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  placeholder="https://example.com/avatar.jpg"
                  value={profile.avatar}
                  onChange={e => setProfile(p => ({ ...p, avatar: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email} disabled className="mt-1 bg-muted" />
            </div>
            <div className="flex items-center gap-2">
              <Label>Role</Label>
              <span className="ml-2 text-sm capitalize text-muted-foreground">{user?.role}</span>
            </div>
            <Button type="submit" disabled={profileMutation.isPending}>
              {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cur-pass">Current Password</Label>
              <Input
                id="cur-pass"
                type="password"
                value={passwords.currentPassword}
                onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="new-pass">New Password</Label>
              <Input
                id="new-pass"
                type="password"
                value={passwords.newPassword}
                onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm-pass">Confirm New Password</Label>
              <Input
                id="confirm-pass"
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
