import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, GraduationCap, Monitor, Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginFormValues } from '@/lib/validators/schemas'
import { useAuth, useLoginMutation } from '@/features/auth/hooks/useAuth'
import { useThemeContext } from '@/context/ThemeContext'
import { ROUTES } from '@/constants/routes'
import { ROLE_HOME } from '@/constants/routes'

export function LoginPage() {
  const { isAuthenticated, user } = useAuth()
  const loginMutation = useLoginMutation()
  const { theme, setTheme } = useThemeContext()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember_me: true },
  })

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role] ?? ROUTES.dashboard} replace />
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold">GradeOps</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h2 className="max-w-md text-4xl font-semibold leading-tight">
            AI-powered grading for modern academic institutions
          </h2>
          <p className="mt-4 max-w-md text-slate-300">
            Rubric-based evaluation, human review workflows, and executive analytics in one platform.
          </p>
        </motion.div>
        <p className="text-sm text-slate-400">Trusted by instructors, TAs, and students worldwide.</p>
      </div>

      <div className="relative flex items-center justify-center p-6">
        <div className="absolute right-6 top-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
          >
            {theme === 'light' ? <Sun className="h-4 w-4" /> : theme === 'dark' ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </Button>
        </div>

        <Card className="w-full max-w-md border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access GradeOps</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@university.edu" {...form.register('email')} />
                {form.formState.errors.email ? (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...form.register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {form.formState.errors.password ? (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={form.watch('remember_me')}
                  onCheckedChange={(checked) => form.setValue('remember_me', Boolean(checked))}
                />
                <Label htmlFor="remember" className="font-normal">
                  Remember me
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
