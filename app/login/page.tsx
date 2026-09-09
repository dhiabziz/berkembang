import { LoginForm } from '@/components/auth/login-form'
import { Card } from '@/components/ui/card'

// UC-01: Admin Login, UC-02: Mentee Login
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-primary">ber-kembang 🌱</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        <LoginForm />
      </Card>
    </main>
  )
}
