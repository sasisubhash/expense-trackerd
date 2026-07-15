import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About BudgetApp</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          BudgetApp is a personal budget tracking system designed to help you manage your finances effectively.
          It's built with a focus on privacy, offline capability, and a user-friendly interface.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Version: 1.0.0
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Developed by v0 for a 22-year-old user.
        </p>
      </CardContent>
    </Card>
  )
}
