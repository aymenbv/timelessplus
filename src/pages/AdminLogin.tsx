import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

const AdminLogin = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user, isAdmin, loading } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;
    
    if (!loading && user && isAdmin) {
      hasRedirected.current = true;
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setErrors({});
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('بيانات الدخول غير صحيحة');
      } else {
        toast.error('حدث خطأ أثناء تسجيل الدخول');
      }
      return;
    }

    toast.success('تم تسجيل الدخول بنجاح');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = signUpSchema.safeParse({ fullName, email, password });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('هذا البريد الإلكتروني مسجل مسبقاً');
      } else {
        toast.error('حدث خطأ أثناء إنشاء الحساب');
      }
      return;
    }

    toast.success('تم إنشاء الحساب بنجاح! يرجى التواصل مع المدير للحصول على صلاحية الوصول');
    resetForm();
    setMode('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border/50 rounded-lg p-8">
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="Timeless" 
              className="h-16 w-auto object-contain mx-auto mb-4"
            />
            <h1 className="font-display text-2xl text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'login' ? 'سجل دخولك للوصول' : 'إنشاء حساب جديد'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex mb-6 bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); resetForm(); }}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); resetForm(); }}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                mode === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              حساب جديد
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6" dir="rtl">
              <div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="البريد الإلكتروني"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary"
                    dir="ltr"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="كلمة المرور"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-luxury w-full disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'جاري الدخول...' : 'دخول'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-6" dir="rtl">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="الاسم الكامل"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary"
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>
                {errors.fullName && (
                  <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="البريد الإلكتروني"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary"
                    dir="ltr"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="كلمة المرور"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-luxury w-full disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
