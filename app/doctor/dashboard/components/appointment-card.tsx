import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, XCircle, MessageSquare, Phone, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type AppointmentCardProps = {
  appointment: {
    id: number
    patientName: string
    patientEmail: string
    symptoms: string
    severity: string
    requestedTime: string
    status: string
    aiAnalysis: string
    vitalSigns: {
      heartRate: number
      spO2: number
      temperature: number
    }
  }
  onStatusChange: (id: number, status: 'approved' | 'rejected') => void
}

export function AppointmentCard({ appointment, onStatusChange }: AppointmentCardProps) {
  const { toast } = useToast()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20"
      case "medium":
        return "bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20"
      case "low":
        return "bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20"
      default:
        return "bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-900/20"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleApprove = () => {
    onStatusChange(appointment.id, 'approved')
    toast({
      title: "Appointment Approved",
      description: "Patient notified via email in real-time!",
    })
  }

  const handleReject = () => {
    onStatusChange(appointment.id, 'rejected')
    toast({
      title: "Appointment Rejected",
      description: "Patient notified via email in real-time!",
    })
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{appointment.patientName}</h3>
            <p className="text-sm text-gray-500">{appointment.patientEmail}</p>
          </div>
          <Badge className={getSeverityColor(appointment.severity)}>
            {appointment.severity} priority
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Symptoms</h4>
          <p className="text-sm">{appointment.symptoms}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">AI Analysis</h4>
          <p className="text-sm">{appointment.aiAnalysis}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">HR:</span>
            <span className="text-sm">{appointment.vitalSigns.heartRate} bpm</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">SpO2:</span>
            <span className="text-sm">{appointment.vitalSigns.spO2}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Temp:</span>
            <span className="text-sm">{appointment.vitalSigns.temperature}°F</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{new Date(appointment.requestedTime).toLocaleDateString()}</span>
            <Clock className="h-4 w-4" />
            <span>{new Date(appointment.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>

        {appointment.status === 'pending' && (
          <div className="flex space-x-2">
            <Button size="sm" className="flex-1" onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button size="sm" variant="destructive" className="flex-1" onClick={handleReject}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}

        {appointment.status === 'approved' && (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="flex-1">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
            <Button size="sm" className="flex-1">
              <Video className="mr-2 h-4 w-4" />
              Video
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}