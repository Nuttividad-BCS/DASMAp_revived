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


export const Route = createFileRoute('/adminlog')({
  component: RouteComponent,
})

function RouteComponent() {
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
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="maxver33@gmail.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
     </div>
  )
}
