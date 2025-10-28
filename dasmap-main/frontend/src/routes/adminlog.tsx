import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "@tanstack/react-router"
import { useState, useEffect} from 'react'
import { supabase } from '@/makeclient'

export const Route = createFileRoute('/adminlog')({
  component: RouteComponent,
})

export function useSession() {
  const [session, setSession] = useState(supabase.auth.getSession())

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return session
}

function RouteComponent() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      // Redirect to admin page
      navigate({to: "/adminpage"})
    }
  }

  return (
     <div className="bg-grid font-[Formula] flex justify-center items-center h-screen bg-[#1D2129]">
      <Card className="w-full bg-[#1D2129] max-w-sm text-white shadow-xl/30"> 
        <CardHeader>
          <img className='w-[90px] ml-1 mr-1 mb-4 justify-self-center'src='./DASMA-P.png' />
          <CardTitle>Login to an Admin Account</CardTitle>
          <CardDescription>
            Enter Credentials Below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="maxver33@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button disabled={loading} type="submit" className="w-full mt-5">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
        </CardFooter>
      </Card>
     </div>
  )
}
