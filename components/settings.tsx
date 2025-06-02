import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor } from "lucide-react"
import { EnvironmentChecker } from "./environment-checker"

export function Settings() {
  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Environment Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnvironmentChecker />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
