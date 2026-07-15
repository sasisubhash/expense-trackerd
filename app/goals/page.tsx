import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import GoalsContent from "@/components/goals-content"

export default function GoalsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <GoalsContent />
      </CardContent>
    </Card>
  )
}
