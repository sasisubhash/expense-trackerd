"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface MonthYearPickerProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

export default function MonthYearPicker({
  month,
  year,
  onMonthChange,
  onYearChange,
}: MonthYearPickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // 5 years back, 4 years forward

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12);
      onYearChange(year - 1);
    } else {
      onMonthChange(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1);
      onYearChange(year + 1);
    } else {
      onMonthChange(month + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous Month</span>
      </Button>
      <Select value={String(month)} onValueChange={(value) => onMonthChange(Number(value))}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={String(m.value)}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(year)} onValueChange={(value) => onYearChange(Number(value))}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" onClick={handleNextMonth}>
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next Month</span>
      </Button>
    </div>
  )
}
