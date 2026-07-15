"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash } from 'lucide-react'
import {
  getAllTransactions,
  deleteTransaction,
  Transaction,
  Category,
  getAllCategories,
  formatCurrency,
} from "@/lib/data-store"
import AddTransactionDialog from "@/components/add-transaction-dialog"
import MonthYearPicker from "@/components/month-year-picker" // New import

export default function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const loadTransactionsAndCategories = async () => {
    const fetchedTransactions = await getAllTransactions()
    const fetchedCategories = await getAllCategories()
    setTransactions(fetchedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setCategories(fetchedCategories)
  }

  useEffect(() => {
    loadTransactionsAndCategories()
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id)
      loadTransactionsAndCategories()
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingTransaction(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingTransaction(null)
    loadTransactionsAndCategories() // Reload data after dialog closes
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "N/A"
  }

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() + 1 === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <MonthYearPicker
              month={currentMonth}
              year={currentYear}
              onMonthChange={setCurrentMonth}
              onYearChange={setCurrentYear}
            />
            <Button onClick={handleAdd}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
                      <TableCell>
                        <span
                          className={`${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          } font-medium`}
                        >
                          {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{transaction.notes || "-"}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(transaction)}>
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
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
              No transactions recorded for {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}. Click "Add Transaction" to get started!
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        transaction={editingTransaction}
        categories={categories}
      />
    </div>
  )
}
