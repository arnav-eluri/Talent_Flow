import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('sarah.johnson@company.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-[hsl(var(--sidebar-background))] flex-col p-12 relative overflow-hidden shrink-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, hsl(172 65% 36% / 0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(172 65% 55% / 0.25) 0%, transparent 50%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">TalentFlow</span>
        </div>

        <div className="relative mt-auto">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Streamline your
            <br />
            hiring pipeline
          </h1>
          <p className="text-[hsl(var(--sidebar-foreground))] text-base leading-relaxed max-w-sm">
            From sourcing to onboarding, TalentFlow brings your entire HR
            workflow into one place.
          </p>
          <div className="mt-10 flex gap-8">
            {[
              { value: '40%', label: 'Faster time-to-hire' },
              { value: '2×', label: 'Pipeline visibility' },
              { value: '98%', label: 'User satisfaction' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-[hsl(var(--sidebar-foreground))] mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">TalentFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-10 font-medium"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Demo credentials are pre-filled — just click Sign In.
          </p>
          <p className="text-sm text-center text-muted-foreground mt-4">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-[hsl(var(--primary))] hover:underline font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
