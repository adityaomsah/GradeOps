import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { profileSchema, passwordSchema } from '@/lib/validators/schemas'
import { authService } from '@/services/authService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useThemeContext } from '@/context/ThemeContext'

export function SettingsPage() {
  const { user, setUser } = useAuth()
  const { theme, setTheme } = useThemeContext()

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '', email: user?.email ?? '' },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  })

  const profileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updated) => {
      setUser(updated)
      toast.success('Profile updated')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const passwordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password updated')
      passwordForm.reset()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <div>
      <PageHeader title="Settings" description="Manage your profile, security and preferences." />

      <Tabs defaultValue="profile" className="max-w-3xl">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={profileForm.handleSubmit((values) => profileMutation.mutate(values))}>
                <div className="space-y-2"><Label>Name</Label><Input {...profileForm.register('name')} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" {...profileForm.register('email')} /></div>
                <Button type="submit" disabled={profileMutation.isPending}>Save Profile</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader><CardTitle className="text-base">Password</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={passwordForm.handleSubmit(({ current_password, new_password }) => passwordMutation.mutate({ current_password, new_password }))}>
                <div className="space-y-2"><Label>Current Password</Label><Input type="password" {...passwordForm.register('current_password')} /></div>
                <div className="space-y-2"><Label>New Password</Label><Input type="password" {...passwordForm.register('new_password')} /></div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" {...passwordForm.register('confirm_password')} /></div>
                <Button type="submit" disabled={passwordMutation.isPending}>Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader><CardTitle className="text-base">Theme</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {(['light', 'dark', 'system'] as const).map((option) => (
                <Button key={option} variant={theme === option ? 'default' : 'outline'} onClick={() => setTheme(option)} className="capitalize">
                  {option}
                </Button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
