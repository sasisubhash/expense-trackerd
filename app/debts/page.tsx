import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DebtsContent from "@/components/debts-content"

export default function DebtsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <DebtsContent />
      </CardContent>
    </Card>
  )
}
