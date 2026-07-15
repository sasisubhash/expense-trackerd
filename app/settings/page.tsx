"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { exportTransactionsToCsv, exportToXlsx, exportToJson, exportToPdf } from "@/lib/export-utils"
import { toast } from "@/hooks/use-toast"
import { clearAllData } from "@/lib/data-store" // Import clearAllData

export default function SettingsPage() {
  const handleExport = async (format: 'csv' | 'xlsx' | 'json' | 'pdf', dataType?: 'transactions' | 'budgets' | 'goals' | 'debts') => {
    try {
      if (format === 'csv') {
        await exportTransactionsToCsv();
        toast({ title: "Export Successful", description: "Transactions exported to transactions.csv" });
      } else if (format === 'xlsx' && dataType) {
        await exportToXlsx(dataType);
        toast({ title: "Export Successful", description: `${dataType} exported to .xlsx` });
      } else if (format === 'json') {
        await exportToJson();
        toast({ title: "Export Successful", description: "All data exported to budget_data.json" });
      } else if (format === 'pdf' && dataType) {
        await exportToPdf(dataType);
        toast({ title: "Export Successful", description: `${dataType} exported to .pdf` });
      }
    } catch (error: any) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: `Could not export data. Error: ${error.message || 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm("Are you sure you want to clear ALL local data? This action cannot be undone.")) {
      try {
        await clearAllData();
        toast({ title: "Data Cleared", description: "All local budget data has been removed. Please refresh the page." });
        // Optionally, force a page reload to reflect empty state
        // window.location.reload(); // Removed auto-reload, user can refresh manually
      } catch (error: any) {
        console.error("Failed to clear data:", error);
        toast({ title: "Error", description: `Failed to clear data. Error: ${error.message || 'Unknown error'}. Please try again.`, variant: "destructive" });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Data Management</h3>
          <p className="text-muted-foreground mb-4">Export your financial data in various formats or clear all local data.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Export Transactions</h4>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleExport('csv')}>Export CSV</Button>
                <Button onClick={() => handleExport('xlsx', 'transactions')}>Export XLSX</Button>
                <Button onClick={() => handleExport('pdf', 'transactions')}>Export PDF</Button>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Export Budgets</h4>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleExport('xlsx', 'budgets')}>Export XLSX</Button>
                <Button onClick={() => handleExport('pdf', 'budgets')}>Export PDF</Button>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Export Savings Goals</h4>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleExport('xlsx', 'goals')}>Export XLSX</Button>
                <Button onClick={() => handleExport('pdf', 'goals')}>Export PDF</Button>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Export Debts</h4>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleExport('xlsx', 'debts')}>Export XLSX</Button>
                <Button onClick={() => handleExport('pdf', 'debts')}>Export PDF</Button>
              </div>
            </div>
            <div className="col-span-full">
              <h4 className="font-medium mb-2">Export All Data</h4>
              <Button onClick={() => handleExport('json')}>Export JSON (All Data)</Button>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
            <p className="text-muted-foreground mb-4">Permanently delete all your local budget data. This cannot be undone.</p>
            <Button variant="destructive" onClick={handleClearAllData}>Clear All Data</Button>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Advanced Features (Coming Soon)</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Gamification: Earn badges and track streaks for consistent budgeting.</li>
            <li>Expense Prediction: AI-powered forecasts based on your spending habits.</li>
            <li>Debt Timeline Visualization: Interactive graphs showing your debt payoff journey.</li>
            <li>Security: Optional password/PIN lock and local AES encryption for your data.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
