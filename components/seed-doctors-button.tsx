"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SeedDoctorsButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [seedResults, setSeedResults] = useState<any>(null)
  const { toast } = useToast()

  const seedDoctors = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/doctors/seed", {
        method: "POST",
      })
      const data = await response.json()
      setSeedResults(data)
      
      if (data.success) {
        toast({
          title: "Doctors Seeded Successfully",
          description: `${data.count} doctors have been added to the database.`,
        })
      } else {
        toast({
          title: "Seeding Failed",
          description: data.error || "Failed to seed doctors",
          variant: "destructive",
        })
      }
    } catch (error) {
      setSeedResults({ error: "Failed to seed doctors" })
      toast({
        title: "Error",
        description: "Failed to seed doctors. Please try again.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const checkDoctors = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/doctors/seed")
      const data = await response.json()
      setSeedResults(data)
    } catch (error) {
      setSeedResults({ error: "Failed to check doctors" })
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button onClick={seedDoctors} disabled={isLoading} variant="outline">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
          Seed Sample Doctors
        </Button>
        <Button onClick={checkDoctors} disabled={isLoading} variant="ghost">
          Check Doctors
        </Button>
      </div>

      {seedResults && (
        <Card>
          <CardHeader>
            <CardTitle>Doctor Database Status</CardTitle>
            <CardDescription>Current doctors in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {seedResults.error ? (
              <div className="text-red-600">Error: {seedResults.error}</div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Total Doctors:</span>
                  <Badge variant="default">{seedResults.count}</Badge>
                </div>
                {seedResults.doctors && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Available Doctors:</h4>
                    {seedResults.doctors.map((doctor: any) => (
                      <div key={doctor._id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{doctor.name}</p>
                          <p className="text-xs text-gray-500">{doctor.specialty}</p>
                        </div>
                        <Badge variant={doctor.status === "active" ? "default" : "secondary"}>
                          {doctor.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}