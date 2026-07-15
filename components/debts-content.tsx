"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash } from 'lucide-react'
import {
  getAllDebts,
  deleteDebt,
  Debt,
  formatCurrency,
} from "@/lib/data-store"
import AddDebtDialog from "@/components/add-debt-dialog"
import { Progress } from "@/components/ui/progress"

export default function DebtsContent() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)

  const loadDebts = async () => {
    const fetchedDebts = await getAllDebts()
    setDebts(fetchedDebts.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
  }

  useEffect(() => {
    loadDebts()
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this debt entry?")) {
      await deleteDebt(id)
      loadDebts()
    }
  }

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingDebt(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingDebt(null)
    loadDebts() // Reload data after dialog closes
  }

  const defaultCurrency = 'INR'; // Primary currency for debts

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Debt Tracking</CardTitle>
          <Button onClick={handleAdd}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Debt
          </Button>
        </CardHeader>
        <CardContent>
          {debts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Debt Name</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Interest Rate</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts.map((debt) => {
                    const progress = ((debt.principal - debt.currentBalance) / debt.principal) * 100;
                    const isOverdue = new Date(debt.dueDate) < new Date() && debt.currentBalance > 0;
                    const progressColor = isOverdue ? 'bg-red-500' : (progress >= 100 ? 'bg-green-500' : 'bg-orange-500'); // Red for overdue, green when paid off, orange otherwise

                    return (
                      <TableRow key={debt.id} className={isOverdue ? 'bg-red-50 dark:bg-red-950' : ''}>
                        <TableCell className="font-medium">
                          {debt.name} {isOverdue && <span className="text-red-600 text-xs font-semibold">(Overdue)</span>}
                        </TableCell>
                        <TableCell>{formatCurrency(debt.principal, defaultCurrency)}</TableCell>
                        <TableCell>{formatCurrency(debt.currentBalance, defaultCurrency)}</TableCell>
                        <TableCell>{(debt.interestRate * 100).toFixed(2)}%</TableCell>
                        <TableCell>{formatCurrency(debt.monthlyPayment, defaultCurrency)}</TableCell>
                        <TableCell>{new Date(debt.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Progress value={progress} className="w-[100px]" indicatorClassName={progressColor} />
                          <span className="ml-2 text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(debt)}>
                            <Edit className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(debt.id)}>
                            <Trash className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No debt entries. Click "Add Debt" to get started!
            </div>
          )}
        </CardContent>
      </Card>

      <AddDebtDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        debt={editingDebt}
      />
    </div>
  )
}
