import { Search, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/candidates': 'Candidates',
  '/interviews': 'Interviews',
  '/employees': 'Employees',
  '/onboarding': 'Onboarding',
  '/offboarding': 'Offboarding',
  '/documents': 'Documents',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/hr-dashboard': 'HR Dashboard',
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = routeTitles[location.pathname] ?? 'TalentFlow';

  const roles: { value: UserRole; label: string }[] = [
    { value: 'hr', label: 'HR Manager' },
    { value: 'manager', label: 'Department Manager' },
    { value: 'employee', label: 'Employee' },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-card flex items-center px-4 md:px-6 gap-4 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="md:hidden h-8 w-8 shrink-0"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <h1 className="text-sm font-semibold text-foreground hidden md:block shrink-0">{pageTitle}</h1>

      <div className="hidden md:block w-px h-4 bg-border shrink-0" />

      <div className="hidden sm:flex flex-1 max-w-xs">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 h-8 text-sm bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {user?.role === 'hr' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex h-8 text-xs gap-1.5 font-normal"
              >
                <span className="text-muted-foreground">Role:</span>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 capitalize font-medium h-4"
                >
                  {roles.find(r => r.value === user?.role)?.label ?? user?.role}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal pb-1">
                Switch view as
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {roles.map((role) => (
                <DropdownMenuItem
                  key={role.value}
                  onClick={() => switchRole(role.value)}
                  className={user?.role === role.value ? 'bg-accent' : ''}
                >
                  {role.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-[11px] bg-primary text-primary-foreground font-semibold">
                  {user?.name?.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email?.split('@')[0]}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
