"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash } from 'lucide-react'
import {
  getAllSavingsGoals,
  deleteSavingsGoal,
  SavingsGoal,
  formatCurrency,
} from "@/lib/data-store"
import AddSavingsGoalDialog from "@/components/add-savings-goal-dialog"
import { Progress } from "@/components/ui/progress"

export default function GoalsContent() {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)

  const loadGoals = async () => {
    const fetchedGoals = await getAllSavingsGoals()
    setSavingsGoals(fetchedGoals.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()))
  }

  useEffect(() => {
    loadGoals()
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      await deleteSavingsGoal(id)
      loadGoals()
    }
  }

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingGoal(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingGoal(null)
    loadGoals() // Reload data after dialog closes
  }

  const defaultCurrency = 'INR'; // Primary currency for goals

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Savings Goals</CardTitle>
          <Button onClick={handleAdd}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          {savingsGoals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal Name</TableHead>
                    <TableHead>Target Amount</TableHead>
                    <TableHead>Current Amount</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savingsGoals.map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    const progressColor = progress >= 100 ? 'bg-green-500' : 'bg-primary';
                    return (
                      <TableRow key={goal.id}>
                        <TableCell className="font-medium">{goal.name}</TableCell>
                        <TableCell>{formatCurrency(goal.targetAmount, defaultCurrency)}</TableCell>
                        <TableCell>{formatCurrency(goal.currentAmount, defaultCurrency)}</TableCell>
                        <TableCell>{new Date(goal.deadline).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Progress value={progress} className="w-[100px]" indicatorClassName={progressColor} />
                          <span className="ml-2 text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                            <Edit className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
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
              No savings goals set. Click "Add Goal" to get started!
            </div>
          )}
        </CardContent>
      </Card>

      <AddSavingsGoalDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        savingsGoal={editingGoal}
      />
    </div>
  )
}
