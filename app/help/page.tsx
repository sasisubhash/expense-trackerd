import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HelpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Help & Support</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Welcome to the help section! Here you can find answers to common questions and get support for BudgetApp.
        </p>
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold">Common Questions:</h4>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>How do I add a new transaction?</li>
            <li>How can I categorize my expenses?</li>
            <li>What do the charts on the dashboard mean?</li>
            <li>How do I export my data?</li>
            <li>Is my data secure?</li>
          </ul>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          For further assistance, please contact support at support@budgetapp.com.
        </p>
      </CardContent>
    </Card>
  )
}
