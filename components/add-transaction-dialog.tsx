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
import { addTransaction, updateTransaction, Category, Transaction } from "@/lib/data-store"
import { toast } from "@/hooks/use-toast"

interface AddTransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  categories: Category[]
}

const commonCurrencies = [
  { value: 'INR', label: 'INR (₹)' }, // Primary currency
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
  { value: 'CHF', label: 'CHF (Fr.)' },
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'BRL', label: 'BRL (R$)' },
];

export default function AddTransactionDialog({
  isOpen,
  onClose,
  transaction,
  categories,
}: AddTransactionDialogProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("INR") // Default currency set to INR
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")
  const [receiptLink, setReceiptLink] = useState("")

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(transaction.amount.toString())
      setCurrency(transaction.currency || "INR") // Set existing currency or default to INR
      setCategoryId(transaction.categoryId)
      setDate(transaction.date)
      setNotes(transaction.notes || "")
      setReceiptLink(transaction.receiptLink || "")
    } else {
      // Reset form for new transaction
      setType("expense")
      setAmount("")
      setCurrency("INR") // Default currency for new transactions
      setCategoryId(categories.length > 0 ? categories[0].id : "")
      setDate(new Date().toISOString().split("T")[0]) // Default to today
      setNotes("")
      setReceiptLink("")
    }
  }, [transaction, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0 || !categoryId || !date || !currency) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Amount, Currency, Category, Date) and ensure amount is positive.",
        variant: "destructive",
      })
      return
    }

    const transactionData: Omit<Transaction, "id"> = {
      type,
      amount: parseFloat(amount),
      currency, // Include currency
      categoryId,
      date,
      notes: notes || undefined,
      receiptLink: receiptLink || undefined,
    }

    try {
      if (transaction) {
        await updateTransaction({ ...transactionData, id: transaction.id })
        toast({
          title: "Transaction Updated",
          description: "Your transaction has been successfully updated.",
        })
      } else {
        await addTransaction(transactionData)
        toast({
          title: "Transaction Added",
          description: "Your new transaction has been successfully added.",
        })
      }
      onClose()
    } catch (error) {
      console.error("Failed to save transaction:", error)
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
          <DialogDescription>
            {transaction ? "Make changes to your transaction here." : "Add a new income or expense transaction."}
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
              className="col-span-2"
              required
            />
            <Select value={currency} onValueChange={setCurrency} required>
              <SelectTrigger className="col-span-1">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {commonCurrencies.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
              required
            />
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
          <DialogFooter>
            <Button type="submit">{transaction ? "Save Changes" : "Add Transaction"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
