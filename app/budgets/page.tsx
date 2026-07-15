import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BudgetsContent from "@/components/budgets-content"

export default function BudgetsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budgets</CardTitle>
      </CardHeader>
      <CardContent>
        <BudgetsContent />
      </CardContent>
    </Card>
  )
}
