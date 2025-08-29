import { AppointmentCard } from "./appointment-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type AppointmentListProps = {
  appointments: {
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
  }[]
  onStatusChange: (id: number, status: 'approved' | 'rejected') => void
}

export function AppointmentList({ appointments, onStatusChange }: AppointmentListProps) {
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending')
  const approvedAppointments = appointments.filter(apt => apt.status === 'approved')
  const rejectedAppointments = appointments.filter(apt => apt.status === 'rejected')

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">Pending ({pendingAppointments.length})</TabsTrigger>
        <TabsTrigger value="approved">Approved ({approvedAppointments.length})</TabsTrigger>
        <TabsTrigger value="rejected">Rejected ({rejectedAppointments.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingAppointments.map(appointment => (
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment} 
              onStatusChange={onStatusChange} 
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="approved">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedAppointments.map(appointment => (
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment} 
              onStatusChange={onStatusChange} 
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="rejected">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rejectedAppointments.map(appointment => (
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment} 
              onStatusChange={onStatusChange} 
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}