import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForecastingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Forecasting</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This page will provide insights into future spending and income based on your past patterns.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          (Feature coming soon!)
        </p>
      </CardContent>
    </Card>
  )
}
