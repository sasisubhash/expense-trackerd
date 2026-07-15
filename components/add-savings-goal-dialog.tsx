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
import { Textarea } from "@/components/ui/textarea"
import { addSavingsGoal, updateSavingsGoal, SavingsGoal } from "@/lib/data-store"
import { toast } from "@/hooks/use-toast"

interface AddSavingsGoalDialogProps {
  isOpen: boolean
  onClose: () => void
  savingsGoal: SavingsGoal | null
}

export default function AddSavingsGoalDialog({
  isOpen,
  onClose,
  savingsGoal,
}: AddSavingsGoalDialogProps) {
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [deadline, setDeadline] = useState("")

  useEffect(() => {
    if (savingsGoal) {
      setName(savingsGoal.name)
      setTargetAmount(savingsGoal.targetAmount.toString())
      setCurrentAmount(savingsGoal.currentAmount.toString())
      setDeadline(savingsGoal.deadline)
    } else {
      setName("")
      setTargetAmount("")
      setCurrentAmount("0") // Default current amount to 0 for new goals
      setDeadline("")
    }
  }, [savingsGoal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0 || !deadline) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Target Amount, Deadline) and ensure target amount is positive.",
        variant: "destructive",
      })
      return
    }

    const goalData: Omit<SavingsGoal, "id" | "linkedTransactions"> = {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline,
    }

    try {
      if (savingsGoal) {
        await updateSavingsGoal({ ...goalData, id: savingsGoal.id, linkedTransactions: savingsGoal.linkedTransactions })
        toast({
          title: "Savings Goal Updated",
          description: "Your savings goal has been successfully updated.",
        })
      } else {
        await addSavingsGoal({ ...goalData, linkedTransactions: [] }) // New goals start with no linked transactions
        toast({
          title: "Savings Goal Added",
          description: "Your new savings goal has been successfully added.",
        })
      }
      onClose()
    } catch (error) {
      console.error("Failed to save savings goal:", error)
      toast({
        title: "Error",
        description: "Failed to save savings goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{savingsGoal ? "Edit Savings Goal" : "Add New Savings Goal"}</DialogTitle>
          <DialogDescription>
            {savingsGoal ? "Adjust details for your savings goal." : "Create a new goal to save money for."}
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
            <Label htmlFor="targetAmount" className="text-right">
              Target Amount
            </Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="currentAmount" className="text-right">
              Current Amount
            </Label>
            <Input
              id="currentAmount"
              type="number"
              step="0.01"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="deadline" className="text-right">
              Deadline
            </Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">{savingsGoal ? "Save Changes" : "Add Goal"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
