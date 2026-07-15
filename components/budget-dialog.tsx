"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addBudget, updateBudget, Budget, Category, getAllBudgets } from "@/lib/data-store"
import { toast } from "@/hooks/use-toast"

interface BudgetDialogProps {
  isOpen: boolean
  onClose: () => void
  budget: Budget | null
  categories: Category[]
  currentMonth: number
  currentYear: number
}

export default function BudgetDialog({
  isOpen,
  onClose,
  budget,
  categories,
  currentMonth,
  currentYear,
}: BudgetDialogProps) {
  const [categoryId, setCategoryId] = useState("")
  const [amount, setAmount] = useState("")
  const [isNewBudget, setIsNewBudget] = useState(true);

  useEffect(() => {
    if (budget) {
      setCategoryId(budget.categoryId)
      setAmount(budget.amount.toString())
      setIsNewBudget(false);
    } else {
      setCategoryId(categories.length > 0 ? categories[0].id : "")
      setAmount("")
      setIsNewBudget(true);
    }
  }, [budget, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) < 0 || !categoryId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Amount, Category) and ensure amount is non-negative.",
        variant: "destructive",
      })
      return
    }

    const budgetData: Omit<Budget, "id"> = {
      categoryId,
      amount: parseFloat(amount),
      month: currentMonth,
      year: currentYear,
    }

    try {
      if (budget) {
        // Update existing budget
        await updateBudget({ ...budgetData, id: budget.id })
        toast({
          title: "Budget Updated",
          description: "Your budget has been successfully updated.",
        })
      } else {
        // Check if a budget already exists for this category and month/year
        const existingBudgets = await getAllBudgets();
        const existingForCategory = existingBudgets.find(
          b => b.categoryId === categoryId && b.month === currentMonth && b.year === currentYear
        );

        if (existingForCategory) {
          // If exists, update it instead of adding a new one
          await updateBudget({ ...budgetData, id: existingForCategory.id });
          toast({
            title: "Budget Updated",
            description: "Budget for this category already exists and has been updated.",
          });
        } else {
          // Add new budget
          await addBudget(budgetData)
          toast({
            title: "Budget Added",
            description: "Your new budget has been successfully added.",
          })
        }
      }
      onClose()
    } catch (error) {
      console.error("Failed to save budget:", error)
      toast({
        title: "Error",
        description: "Failed to save budget. Please try again.",
        variant: "destructive",
      })
    }
  }

  const availableCategories = categories.filter(cat => {
    // If editing, the current category is always available
    if (budget && budget.categoryId === cat.id) return true;
    // For new budgets, only show categories that don't already have a budget for the current month/year
    return !getAllBudgets().then(b => b.some(
      existing => existing.categoryId === cat.id && existing.month === currentMonth && existing.year === currentYear
    ));
  });


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? "Edit Budget" : "Set New Budget"}</DialogTitle>
          <DialogDescription>
            {budget ? "Adjust the budget for this category." : `Set a new budget for a category for ${new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId} required disabled={!isNewBudget}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="amount" className="text-right">
              Budget Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">{budget ? "Save Changes" : "Set Budget"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
