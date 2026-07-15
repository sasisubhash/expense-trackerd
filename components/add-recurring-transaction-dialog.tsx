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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { addRecurringTransaction, updateRecurringTransaction, Category, RecurringTransaction } from "@/lib/data-store"
import { toast } from "@/hooks/use-toast"

interface AddRecurringTransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  recurringTransaction: RecurringTransaction | null
  categories: Category[]
}

export default function AddRecurringTransactionDialog({
  isOpen,
  onClose,
  recurringTransaction,
  categories,
}: AddRecurringTransactionDialogProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [notes, setNotes] = useState("")
  const [receiptLink, setReceiptLink] = useState("")
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "bi-weekly" | "monthly" | "custom">("monthly")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [customValue, setCustomValue] = useState("1")
  const [customUnit, setCustomUnit] = useState<"days" | "weeks" | "months" | "years">("months")

  useEffect(() => {
    if (recurringTransaction) {
      setType(recurringTransaction.originalTransaction.type)
      setAmount(recurringTransaction.originalTransaction.amount.toString())
      setCategoryId(recurringTransaction.originalTransaction.categoryId)
      setNotes(recurringTransaction.originalTransaction.notes || "")
      setReceiptLink(recurringTransaction.originalTransaction.receiptLink || "")
      setFrequency(recurringTransaction.type)
      setStartDate(recurringTransaction.startDate)
      setEndDate(recurringTransaction.endDate || "")
      if (recurringTransaction.type === 'custom' && recurringTransaction.customInterval) {
        setCustomValue(recurringTransaction.customInterval.value.toString())
        setCustomUnit(recurringTransaction.customInterval.unit)
      } else {
        setCustomValue("1")
        setCustomUnit("months")
      }
    } else {
      // Reset form for new recurring transaction
      setType("expense")
      setAmount("")
      setCategoryId(categories.length > 0 ? categories[0].id : "")
      setNotes("")
      setReceiptLink("")
      setFrequency("monthly")
      setStartDate(new Date().toISOString().split("T")[0]) // Default to today
      setEndDate("")
      setCustomValue("1")
      setCustomUnit("months")
    }
  }, [recurringTransaction, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0 || !categoryId || !startDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Amount, Category, Start Date) and ensure amount is positive.",
        variant: "destructive",
      })
      return
    }

    const originalTransaction = {
      type,
      amount: parseFloat(amount),
      categoryId,
      notes: notes || undefined,
      receiptLink: receiptLink || undefined,
    }

    const recurringTransactionData: Omit<RecurringTransaction, "id"> = {
      type: frequency,
      startDate,
      endDate: endDate || undefined,
      originalTransaction,
      customInterval: frequency === 'custom' ? { value: parseInt(customValue), unit: customUnit } : undefined,
    }

    try {
      if (recurringTransaction) {
        await updateRecurringTransaction({ ...recurringTransactionData, id: recurringTransaction.id })
        toast({
          title: "Recurring Transaction Updated",
          description: "Your recurring transaction has been successfully updated.",
        })
      } else {
        await addRecurringTransaction(recurringTransactionData)
        toast({
          title: "Recurring Transaction Added",
          description: "Your new recurring transaction has been successfully added.",
        })
      }
      onClose()
    } catch (error) {
      console.error("Failed to save recurring transaction:", error)
      toast({
        title: "Error",
        description: "Failed to save recurring transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{recurringTransaction ? "Edit Recurring Transaction" : "Add New Recurring Transaction"}</DialogTitle>
          <DialogDescription>
            {recurringTransaction ? "Make changes to your recurring transaction template here." : "Add a new recurring income or expense template."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <RadioGroup
              id="type"
              defaultValue="expense"
              value={type}
              onValueChange={(value: "income" | "expense") => setType(value)}
              className="flex col-span-3 space-x-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense">Expense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income">Income</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
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
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
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
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Optional notes about the transaction"
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="receiptLink" className="text-right">
              Receipt Link
            </Label>
            <Input
              id="receiptLink"
              type="url"
              value={receiptLink}
              onChange={(e) => setReceiptLink(e.target.value)}
              className="col-span-3"
              placeholder="Optional link to receipt"
            />
          </div>

          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frequency
            </Label>
            <Select value={frequency} onValueChange={(value: typeof frequency) => setFrequency(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'custom' && (
            <div className="grid items-center grid-cols-4 gap-4">
              <Label htmlFor="customInterval" className="text-right">
                Every
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="customInterval"
                  type="number"
                  min="1"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="w-20"
                />
                <Select value={customUnit} onValueChange={(value: typeof customUnit) => setCustomUnit(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date (Optional)
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="col-span-3"
            />
          </div>

          <DialogFooter>
            <Button type="submit">{recurringTransaction ? "Save Changes" : "Add Recurring Transaction"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
