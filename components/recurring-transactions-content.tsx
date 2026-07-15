"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash } from 'lucide-react'
import {
  getAllRecurringTransactions,
  deleteRecurringTransaction,
  RecurringTransaction,
  getAllCategories,
  Category,
} from "@/lib/data-store"
import AddRecurringTransactionDialog from "@/components/add-recurring-transaction-dialog"

export default function RecurringTransactionsContent() {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecurringTransaction, setEditingRecurringTransaction] = useState<RecurringTransaction | null>(null)

  const loadData = async () => {
    const fetchedRecurringTransactions = await getAllRecurringTransactions()
    const fetchedCategories = await getAllCategories()
    setRecurringTransactions(fetchedRecurringTransactions.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()))
    setCategories(fetchedCategories)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this recurring transaction template?")) {
      await deleteRecurringTransaction(id)
      loadData()
    }
  }

  const handleEdit = (recurringTransaction: RecurringTransaction) => {
    setEditingRecurringTransaction(recurringTransaction)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingRecurringTransaction(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingRecurringTransaction(null)
    loadData() // Reload data after dialog closes
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "N/A"
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recurring Transactions</CardTitle>
          <Button onClick={handleAdd}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Recurring
          </Button>
        </CardHeader>
        <CardContent>
          {recurringTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringTransactions.map((rt) => (
                    <TableRow key={rt.id}>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rt.originalTransaction.type === "income"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {rt.originalTransaction.type.charAt(0).toUpperCase() + rt.originalTransaction.type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`${
                            rt.originalTransaction.type === "income" ? "text-green-600" : "text-red-600"
                          } font-medium`}
                        >
                          {rt.originalTransaction.type === "income" ? "+" : "-"}${rt.originalTransaction.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{getCategoryName(rt.originalTransaction.categoryId)}</TableCell>
                      <TableCell>
                        {rt.type === 'custom'
                          ? `${rt.customInterval?.value} ${rt.customInterval?.unit}`
                          : rt.type.charAt(0).toUpperCase() + rt.type.slice(1)}
                      </TableCell>
                      <TableCell>{new Date(rt.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{rt.endDate ? new Date(rt.endDate).toLocaleDateString() : "Never"}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(rt)}>
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(rt.id)}>
                          <Trash className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No recurring transactions defined. Click "Add Recurring" to get started!
            </div>
          )}
        </CardContent>
      </Card>

      <AddRecurringTransactionDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        recurringTransaction={editingRecurringTransaction}
        categories={categories}
      />
    </div>
  )
}
