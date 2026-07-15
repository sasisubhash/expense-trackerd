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
import { addCategory, updateCategory, Category } from "@/lib/data-store"
import { toast } from "@/hooks/use-toast"

interface CategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
}

const defaultColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED',
  '#A1C181', '#F7CAC9', '#C7B446', '#6B5B95', '#88B04B', '#F7786B', '#C94C4C'
];

export default function CategoryDialog({
  isOpen,
  onClose,
  category,
}: CategoryDialogProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState(defaultColors[0])

  useEffect(() => {
    if (category) {
      setName(category.name)
      setColor(category.color)
    } else {
      setName("")
      setColor(defaultColors[0]) // Default to first color
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name cannot be empty.",
        variant: "destructive",
      })
      return
    }

    const categoryData: Omit<Category, "id"> = {
      name: name.trim(),
      color,
      isDefault: false, // User-added categories are not default
    }

    try {
      if (category) {
        await updateCategory({ ...categoryData, id: category.id, isDefault: category.isDefault })
        toast({
          title: "Category Updated",
          description: "Your category has been successfully updated.",
        })
      } else {
        await addCategory(categoryData)
        toast({
          title: "Category Added",
          description: "Your new category has been successfully added.",
        })
      }
      onClose()
    } catch (error) {
      console.error("Failed to save category:", error)
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Make changes to your category here." : "Add a new category for your transactions."}
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
              disabled={category?.isDefault} // Prevent renaming default categories
            />
          </div>
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="color" className="text-right">
              Color
            </Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {defaultColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-primary' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                />
              ))}
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 p-0 border-none cursor-pointer"
                title="Choose custom color"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{category ? "Save Changes" : "Add Category"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
