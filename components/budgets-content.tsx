"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit } from 'lucide-react'
import {
  getAllBudgets,
  deleteBudget,
  Budget,
  getAllCategories,
  Category,
  getAllTransactions,
  Transaction,
  formatCurrency,
} from "@/lib/data-store"
import BudgetDialog from "@/components/budget-dialog"
import { Progress } from "@/components/ui/progress"
import MonthYearPicker from "@/components/month-year-picker" // New import

export default function BudgetsContent() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const loadData = async () => {
    const fetchedBudgets = await getAllBudgets()
    const fetchedCategories = await getAllCategories()
    const fetchedTransactions = await getAllTransactions()
    setBudgets(fetchedBudgets)
    setCategories(fetchedCategories)
    setTransactions(fetchedTransactions)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingBudget(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingBudget(null)
    loadData() // Reload data after dialog closes
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "N/A"
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.color : "#CCCCCC"
  }

  const getActualSpending = (categoryId: string, month: number, year: number) => {
    const spending = transactions
      .filter(t => t.type === 'expense' && t.categoryId === categoryId)
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() + 1 === month && transactionDate.getFullYear() === year;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    return spending;
  }

  const defaultCurrency = 'INR'; // Assuming a default currency for budget display

  const budgetsForCurrentMonth = budgets.filter(b => b.month === currentMonth && b.year === currentYear);
  const categoriesWithoutBudget = categories.filter(cat =>
    !budgetsForCurrentMonth.some(b => b.categoryId === cat.id) && !cat.isDefault // Only show non-default categories without a budget
  );

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Budgets</CardTitle>
          <div className="flex items-center gap-2">
            <MonthYearPicker
              month={currentMonth}
              year={currentYear}
              onMonthChange={setCurrentMonth}
              onYearChange={setCurrentYear}
            />
            <Button onClick={handleAdd}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Set Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {budgetsForCurrentMonth.length > 0 || categoriesWithoutBudget.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Budgeted</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetsForCurrentMonth.map((budget) => {
                    const actualSpent = getActualSpending(budget.categoryId, budget.month, budget.year);
                    const remaining = budget.amount - actualSpent;
                    const progress = (actualSpent / budget.amount) * 100;
                    const progressColor = progress > 100 ? 'bg-red-500' : 'bg-primary';

                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(budget.categoryId) }} />
                          {getCategoryName(budget.categoryId)}
                        </TableCell>
                        <TableCell>{formatCurrency(budget.amount, defaultCurrency)}</TableCell>
                        <TableCell>{formatCurrency(actualSpent, defaultCurrency)}</TableCell>
                        <TableCell className={remaining < 0 ? 'text-red-600 font-medium' : ''}>
                          {formatCurrency(remaining, defaultCurrency)}
                        </TableCell>
                        <TableCell>
                          <Progress value={progress} className="w-[100px]" indicatorClassName={progressColor} />
                          <span className="ml-2 text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(budget)}>
                            <Edit className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          {/* No delete button for budgets, as they are monthly. Can be set to 0. */}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {categoriesWithoutBudget.map(category => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        {category.name}
                      </TableCell>
                      <TableCell>{formatCurrency(0, defaultCurrency)}</TableCell>
                      <TableCell>{formatCurrency(getActualSpending(category.id, currentMonth, currentYear), defaultCurrency)}</TableCell>
                      <TableCell>{formatCurrency(0, defaultCurrency)}</TableCell>
                      <TableCell>
                        <Progress value={0} className="w-[100px]" />
                        <span className="ml-2 text-sm text-muted-foreground">0%</span>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleAdd()}>
                          <PlusCircle className="w-4 h-4" />
                          <span className="sr-only">Set Budget</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No budgets set for {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}. Click "Set Budget" to get started!
            </div>
          )}
        </CardContent>
      </Card>

      <BudgetDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        budget={editingBudget}
        categories={categories}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  )
}
