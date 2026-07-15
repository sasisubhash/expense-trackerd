"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash } from 'lucide-react'
import {
  getAllCategories,
  deleteCategory,
  Category,
} from "@/lib/data-store"
import CategoryDialog from "@/components/category-dialog"

export default function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const loadCategories = async () => {
    const fetchedCategories = await getAllCategories()
    setCategories(fetchedCategories.sort((a, b) => a.name.localeCompare(b.name)))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category? Transactions assigned to this category will become uncategorized.")) {
      await deleteCategory(id)
      loadCategories()
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    loadCategories() // Reload data after dialog closes
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
          <Button onClick={handleAdd}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full border"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>{category.isDefault ? "Yes" : "No"}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        {!category.isDefault && ( // Prevent deleting default categories
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                            <Trash className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No categories defined. Click "Add Category" to get started!
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        category={editingCategory}
      />
    </div>
  )
}
