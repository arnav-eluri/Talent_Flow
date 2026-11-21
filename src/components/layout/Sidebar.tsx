import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  UserPlus,
  Calendar,
  ClipboardCheck,
  LogOut as LogOutIcon,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  Briefcase,
  Home,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navGroups = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', href: '/', icon: Home, roles: ['hr', 'manager', 'employee'] },
      { name: 'Candidates', href: '/candidates', icon: UserPlus, roles: ['hr', 'manager'] },
      { name: 'Interviews', href: '/interviews', icon: Calendar, roles: ['hr', 'manager'] },
      { name: 'Employees', href: '/employees', icon: Users, roles: ['hr', 'manager', 'employee'] },
    ],
  },
  {
    label: 'Workflows',
    items: [
      { name: 'Onboarding', href: '/onboarding', icon: ClipboardCheck, roles: ['hr', 'manager'] },
      { name: 'Offboarding', href: '/offboarding', icon: LogOutIcon, roles: ['hr'] },
    ],
  },
  {
    label: 'Other',
    items: [
      { name: 'Documents', href: '/documents', icon: FileText, roles: ['hr', 'manager', 'employee'] },
      { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['hr', 'manager'] },
      { name: 'Settings', href: '/settings', icon: Settings, roles: ['hr', 'manager', 'employee'] },
    ],
  },
];

interface SidebarProps {
  onToggle?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ onToggle, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleToggle = () => {
    setCollapsed(!collapsed);
    onToggle?.();
  };

  return (
    <aside
      className={cn(
        'h-screen flex flex-col transition-all duration-300 ease-in-out',
        'bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]',
        collapsed ? 'w-[56px]' : 'w-[220px]',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-[hsl(var(--sidebar-border))] shrink-0',
          collapsed ? 'justify-center px-0' : 'justify-between px-4',
        )}
      >
        {collapsed ? (
          <button
            onClick={handleToggle}
            className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Briefcase className="w-4 h-4 text-white" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white text-sm tracking-tight">TalentFlow</span>
            </div>
            <button
              onClick={handleToggle}
              className="hidden md:flex items-center justify-center w-6 h-6 rounded text-[hsl(var(--sidebar-foreground))] hover:text-white hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-5">
        {navGroups.map((group) => {
          const visible = group.items.filter((item) => user && item.roles.includes(user.role));
          if (visible.length === 0) return null;

          return (
            <div key={group.label}>
              {!collapsed && (
                <p className="text-[9px] font-bold uppercase tracking-widest px-4 mb-1.5 text-[hsl(var(--sidebar-muted))]">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visible.map((item) => {
                  const isActive = location.pathname === item.href;
                  const link = (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center gap-2.5 py-2 text-[13px] font-medium transition-all duration-150',
                        collapsed
                          ? 'justify-center px-0 mx-2 rounded-lg'
                          : 'pl-3.5 pr-3 mr-2 rounded-r-lg',
                        isActive
                          ? collapsed
                            ? 'bg-[hsl(var(--sidebar-accent))] text-white'
                            : 'border-l-2 border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--sidebar-accent))] text-white pl-3'
                          : collapsed
                            ? 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-white'
                            : 'border-l-2 border-transparent text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]/60 hover:text-white',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'shrink-0 w-4 h-4',
                          isActive ? 'text-[hsl(var(--sidebar-primary))]' : '',
                        )}
                      />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href} delayDuration={0}>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return link;
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-[hsl(var(--sidebar-border))] shrink-0">
        {user && (
          <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-[11px] bg-[hsl(var(--primary))] text-white font-semibold">
                {user.name.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-[hsl(var(--sidebar-muted))] capitalize">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-[hsl(var(--sidebar-foreground))] hover:text-white transition-colors p-1 rounded hover:bg-[hsl(var(--sidebar-accent))]"
                  title="Log out"
                >
                  <LogOutIcon className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
