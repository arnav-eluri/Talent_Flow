import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { Settings as SettingsIcon, Bell, Lock, Palette, ShieldCheck } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    newCandidates: true,
  });
  const { theme, setTheme } = useTheme();

  type UserRecord = { id: string; name: string; email: string; role: string; permissions?: string[] };
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [roleChanges, setRoleChanges] = useState<Record<string, string>>({});
  const [permChanges, setPermChanges] = useState<Record<string, string[]>>({});

  const MODULES = [
    { key: 'candidates', label: 'Candidates' },
    { key: 'interviews', label: 'Interviews' },
    { key: 'employees', label: 'Employees' },
    { key: 'onboarding', label: 'Onboarding' },
    { key: 'offboarding', label: 'Offboarding' },
    { key: 'documents', label: 'Documents' },
    { key: 'analytics', label: 'Analytics', noManage: true },
  ] as const;

  const MANAGER_PERMISSIONS = [
    'candidates_view',
    'interviews_view', 'interviews_manage',
    'employees_view',
    'onboarding_view', 'onboarding_manage',
    'offboarding_view', 'offboarding_manage',
    'documents_view',
    'analytics_view',
  ];

  useEffect(() => {
    if (activeTab === 'permissions' && user?.role === 'hr') {
      api.getUsers().then(data => setAllUsers(data.users));
    }
  }, [activeTab, user?.role]);

  function effectiveRole(u: UserRecord) { return roleChanges[u.id] ?? u.role; }
  function effectivePerms(u: UserRecord): string[] { return permChanges[u.id] ?? u.permissions ?? []; }

  function togglePerm(u: UserRecord, perm: string) {
    const cur = effectivePerms(u);
    setPermChanges(prev => ({
      ...prev,
      [u.id]: cur.includes(perm) ? cur.filter(p => p !== perm) : [...cur, perm],
    }));
  }

  const handleSavePermissions = async () => {
    try {
      await Promise.all([
        ...Object.entries(roleChanges).map(([id, role]) => api.updateUserRole(id, role)),
        ...Object.entries(permChanges).map(([id, perms]) => api.updateUserPermissions(id, perms)),
      ]);
      setAllUsers(prev => prev.map(u => ({
        ...u,
        ...(roleChanges[u.id] ? { role: roleChanges[u.id] } : {}),
        ...(permChanges[u.id] !== undefined ? { permissions: permChanges[u.id] } : {}),
      })));
      setRoleChanges({});
      setPermChanges({});
      toast({ title: 'Permissions updated', description: 'Changes have been saved.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update', variant: 'destructive' });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await api.updateProfile(formData);
      updateUser(response.user);
      toast({ title: 'Profile updated', description: 'Your profile changes have been saved.' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Preferences updated',
      description: 'Your notification preferences have been saved.',
    });
  };

  const handleSaveTheme = (selected: string) => {
    setTheme(selected as 'light' | 'dark' | 'auto');
    toast({
      title: 'Theme updated',
      description: `Theme changed to ${selected}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#3B1E54] dark:text-foreground flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-slate-600 dark:text-muted-foreground mt-2">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-border">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'profile'
              ? 'text-[#3B1E54] dark:text-foreground border-b-2 border-[#3B1E54] dark:border-primary'
              : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'text-[#3B1E54] dark:text-foreground border-b-2 border-[#3B1E54] dark:border-primary'
              : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'theme'
              ? 'text-[#3B1E54] dark:text-foreground border-b-2 border-[#3B1E54] dark:border-primary'
              : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground'
          }`}
        >
          Theme
        </button>
        {user?.role === 'hr' && (
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'permissions'
                ? 'text-[#3B1E54] dark:text-foreground border-b-2 border-[#3B1E54] dark:border-primary'
                : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground'
            }`}
          >
            Permissions
          </button>
        )}
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={({ hr: 'HR Manager', manager: 'Manager', employee: 'Employee' } as Record<string,string>)[user?.role ?? ''] || user?.role || ''}
                disabled
                className="bg-slate-100 dark:bg-muted"
              />
              <p className="text-sm text-slate-500 dark:text-muted-foreground">Role cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={user?.department || ''}
                disabled
                className="bg-slate-100 dark:bg-muted"
              />
            </div>

            <Button onClick={handleSaveProfile} className="w-full bg-[#3B1E54] hover:bg-[#5a2d7a]">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Control how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-foreground">Email Notifications</p>
                <p className="text-sm text-slate-600 dark:text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, emailNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-foreground">Push Notifications</p>
                <p className="text-sm text-slate-600 dark:text-muted-foreground">Receive browser notifications</p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, pushNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-foreground">Weekly Report</p>
                <p className="text-sm text-slate-600 dark:text-muted-foreground">Get weekly summary reports</p>
              </div>
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, weeklyReport: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-foreground">New Candidates</p>
                <p className="text-sm text-slate-600 dark:text-muted-foreground">Notify about new candidates</p>
              </div>
              <Switch
                checked={notifications.newCandidates}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newCandidates: checked })
                }
              />
            </div>

            <Button onClick={handleSaveNotifications} className="w-full bg-[#3B1E54] hover:bg-[#5a2d7a]">
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Theme Settings */}
      {activeTab === 'theme' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme Settings
            </CardTitle>
            <CardDescription>Customize your interface appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  id="light"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={(e) => handleSaveTheme(e.target.value)}
                  className="w-4 h-4"
                />
                <label htmlFor="light" className="flex-1 cursor-pointer">
                  <p className="font-medium text-slate-900 dark:text-foreground">Light Theme</p>
                  <p className="text-sm text-slate-600 dark:text-muted-foreground">Bright and clean interface</p>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  id="dark"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={(e) => handleSaveTheme(e.target.value)}
                  className="w-4 h-4"
                />
                <label htmlFor="dark" className="flex-1 cursor-pointer">
                  <p className="font-medium text-slate-900 dark:text-foreground">Dark Theme</p>
                  <p className="text-sm text-slate-600 dark:text-muted-foreground">Easy on the eyes</p>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  id="auto"
                  name="theme"
                  value="auto"
                  checked={theme === 'auto'}
                  onChange={(e) => handleSaveTheme(e.target.value)}
                  className="w-4 h-4"
                />
                <label htmlFor="auto" className="flex-1 cursor-pointer">
                  <p className="font-medium text-slate-900 dark:text-foreground">Auto (System)</p>
                  <p className="text-sm text-slate-600 dark:text-muted-foreground">Follow system preferences</p>
                </label>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-muted-foreground">Theme applies immediately on selection.</p>
          </CardContent>
        </Card>
      )}

      {/* Permissions */}
      {activeTab === 'permissions' && user?.role === 'hr' && (
        <div className="space-y-4">
          {allUsers.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-muted-foreground">Loading users…</p>
          )}

          {allUsers.map(u => {
            const role = effectiveRole(u);
            const isSelf = u.id === user.id;
            return (
              <Card key={u.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{u.name}</CardTitle>
                      <CardDescription className="truncate">{u.email}</CardDescription>
                    </div>
                    <select
                      value={role}
                      onChange={e => setRoleChanges(prev => ({ ...prev, [u.id]: e.target.value }))}
                      disabled={isSelf}
                      className="border border-input rounded-md px-3 py-1.5 text-sm bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      <option value="hr">HR</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {role === 'hr' && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-medium">
                        Full Access
                      </span>
                      <span className="text-sm text-slate-500 dark:text-muted-foreground">All features, all actions</span>
                    </div>
                  )}

                  {role === 'manager' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-0.5 text-xs font-medium">
                          Standard Access
                        </span>
                        <span className="text-sm text-slate-500 dark:text-muted-foreground">Fixed set, cannot be customised</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {MANAGER_PERMISSIONS.map(p => (
                          <span key={p} className="text-xs bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground rounded px-2 py-0.5">
                            {p.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {role === 'employee' && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 dark:text-muted-foreground mb-2">Custom permissions</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                        {MODULES.map(m => (
                          <div key={m.key} className="space-y-0.5">
                            <p className="text-xs font-medium text-slate-700 dark:text-foreground">{m.label}</p>
                            <div className="flex gap-3">
                              {(['view', ...('noManage' in m && m.noManage ? [] : ['manage'])] as string[]).map(action => {
                                const perm = `${m.key}_${action}`;
                                const checked = effectivePerms(u).includes(perm);
                                return (
                                  <label key={perm} className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => togglePerm(u, perm)}
                                      className="w-3.5 h-3.5 accent-[#3B1E54]"
                                    />
                                    <span className="text-xs text-slate-600 dark:text-muted-foreground capitalize">{action}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {allUsers.length > 0 && (
            <Button
              onClick={handleSavePermissions}
              disabled={Object.keys(roleChanges).length === 0 && Object.keys(permChanges).length === 0}
              className="w-full bg-[#3B1E54] hover:bg-[#5a2d7a] disabled:opacity-50"
            >
              Save Changes
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
