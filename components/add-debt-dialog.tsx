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
import { addDebt, updateDebt, Debt } from "@/lib/data-store"
import { toast } from "@/hooks/use-toast"

interface AddDebtDialogProps {
  isOpen: boolean
  onClose: () => void
  debt: Debt | null
}

export default function AddDebtDialog({
  isOpen,
  onClose,
  debt,
}: AddDebtDialogProps) {
  const [name, setName] = useState("")
  const [principal, setPrincipal] = useState("")
  const [currentBalance, setCurrentBalance] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [monthlyPayment, setMonthlyPayment] = useState("")

  useEffect(() => {
    if (debt) {
      setName(debt.name)
      setPrincipal(debt.principal.toString())
      setCurrentBalance(debt.currentBalance.toString())
      setInterestRate((debt.interestRate * 100).toString()) // Convert to percentage for display
      setDueDate(debt.dueDate)
      setMonthlyPayment(debt.monthlyPayment.toString())
    } else {
      setName("")
      setPrincipal("")
      setCurrentBalance("")
      setInterestRate("")
      setDueDate("")
      setMonthlyPayment("")
    }
  }, [debt])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !principal || parseFloat(principal) <= 0 || !currentBalance || parseFloat(currentBalance) < 0 || !interestRate || parseFloat(interestRate) < 0 || !dueDate || !monthlyPayment || parseFloat(monthlyPayment) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and ensure amounts are positive.",
        variant: "destructive",
      })
      return
    }

    const debtData: Omit<Debt, "id"> = {
      name: name.trim(),
      principal: parseFloat(principal),
      currentBalance: parseFloat(currentBalance),
      interestRate: parseFloat(interestRate) / 100, // Convert back to decimal
      dueDate,
      monthlyPayment: parseFloat(monthlyPayment),
    }

    try {
      if (debt) {
        await updateDebt({ ...debtData, id: debt.id })
        toast({
          title: "Debt Updated",
          description: "Your debt entry has been successfully updated.",
        })
      } else {
        await addDebt(debtData)
        toast({
          title: "Debt Added",
          description: "Your new debt entry has been successfully added.",
        })
      }
      onClose()
    } catch (error) {
      console.error("Failed to save debt:", error)
      toast({
        title: "Error",
        description: "Failed to save debt. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{debt ? "Edit Debt" : "Add New Debt"}</DialogTitle>
          <DialogDescription>
            {debt ? "Adjust details for your debt entry." : "Add a new loan or credit card debt."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="principal" className="text-right">
              Principal Amount
            </Label>
            <Input
              id="principal"
              type="number"
              step="0.01"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="currentBalance" className="text-right">
              Current Balance
            </Label>
            <Input
              id="currentBalance"
              type="number"
              step="0.01"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="interestRate" className="text-right">
              Interest Rate (%)
            </Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="monthlyPayment" className="text-right">
              Monthly Payment
            </Label>
            <Input
              id="monthlyPayment"
              type="number"
              step="0.01"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Next Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">{debt ? "Save Changes" : "Add Debt"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
