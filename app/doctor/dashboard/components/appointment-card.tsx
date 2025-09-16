import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, XCircle, MessageSquare, Phone, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type AppointmentCardProps = {
  appointment: {
    _id: string
    patientName: string
    patientEmail: string
    reason: string
    symptoms: string
    appointmentDate: string
    appointmentTime: string
    status: string
    consultationFee: number
    meetingLink?: string
  }
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void
}

export function AppointmentCard({ appointment, onStatusChange }: AppointmentCardProps) {
  const { toast } = useToast()

  const getSeverityColor = (symptoms: string) => {
    const urgentKeywords = ["chest pain", "breathing", "severe", "blood", "emergency"]
    const moderateKeywords = ["fever", "pain", "headache", "nausea"]
    
    const symptomsLower = symptoms.toLowerCase()
    if (urgentKeywords.some(keyword => symptomsLower.includes(keyword))) {
      return "bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20"
    } else if (moderateKeywords.some(keyword => symptomsLower.includes(keyword))) {
      return "bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20"
    }
    return "bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20"
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
    onStatusChange(appointment._id, 'approved')
    toast({
      title: "Appointment Approved",
      description: "Patient notified via email with video call link!",
    })
  }

  const handleReject = () => {
    onStatusChange(appointment._id, 'rejected')
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
          <Badge className={getSeverityColor(appointment.symptoms || "")}>
            {appointment.symptoms?.toLowerCase().includes("chest pain") || appointment.symptoms?.toLowerCase().includes("breathing") ? "high" : 
             appointment.symptoms?.toLowerCase().includes("fever") || appointment.symptoms?.toLowerCase().includes("pain") ? "medium" : "low"} priority
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Reason for Visit</h4>
          <p className="text-sm">{appointment.reason}</p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Symptoms</h4>
          <p className="text-sm">{appointment.symptoms || "No specific symptoms mentioned"}</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Consultation Fee:</span>
            <span className="text-lg font-bold text-blue-600">${appointment.consultationFee}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
            <Clock className="h-4 w-4" />
            <span>{appointment.appointmentTime}</span>
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
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open(`/patient/chat`, '_blank')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open(`tel:${appointment.patientEmail}`, '_self')}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => window.open(appointment.meetingLink || `/video-call/${appointment._id}`, '_blank')}
            >
              <Video className="mr-2 h-4 w-4" />
              Video
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}