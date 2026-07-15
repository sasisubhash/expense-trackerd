"use client"

import { useEffect, useState } from "react"
import { seedDummyData, getAllCategories } from "@/lib/data-store"
import { PlusCircle } from 'lucide-react'
import AddTransactionDialog from "@/components/add-transaction-dialog"

export function ClientInitializer() {
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const initApp = async () => {
      await seedDummyData() // Seed dummy data on app load
      const fetchedCategories = await getAllCategories()
      setCategories(fetchedCategories as any) // Cast to any for now
    }
    initApp()
      .then(() => {
        console.log("App initialized and dummy data seeded/checked.")
      })
      .catch(error => {
        console.error("Error during app initialization:", error)
      })
  }, [])

  const handleAddTransactionDialogClose = async () => {
    setIsAddTransactionDialogOpen(false)
    // Optionally reload data in children components if needed,
    // but most components already have their own useEffects for data loading.
  }

  return (
    <>
      {/* Quick Add Button */}
      <button
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        onClick={() => setIsAddTransactionDialogOpen(true)}
        aria-label="Quick Add Transaction"
      >
        <PlusCircle className="h-6 w-6" />
      </button>

      <AddTransactionDialog
        isOpen={isAddTransactionDialogOpen}
        onClose={handleAddTransactionDialogClose}
        transaction={null} // For adding new transaction
        categories={categories}
      />
    </>
  )
}
