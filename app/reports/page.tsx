import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ReportsContent from "@/components/reports-content"

export default function ReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <ReportsContent />
      </CardContent>
    </Card>
  )
}
