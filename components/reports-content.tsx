"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MonthYearPicker from "@/components/month-year-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllTransactions, getAllCategories, Transaction, Category, formatCurrency } from "@/lib/data-store"
import PieChartCard from "@/components/charts/pie-chart-card"
import BarChartCard from "@/components/charts/bar-chart-card"
import { DollarSign, TrendingUp, Wallet } from 'lucide-react' // Import icons for summary cards

export default function ReportsContent() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [netBalance, setNetBalance] = useState(0) // New state for net balance
  const [spendingByCategoryData, setSpendingByCategoryData] = useState<any[]>([])
  const [incomeExpenseTrendData, setIncomeExpenseTrendData] = useState<any>({ labels: [], datasets: [] });


  const loadData = async () => {
    const fetchedTransactions = await getAllTransactions()
    const fetchedCategories = await getAllCategories()
    setTransactions(fetchedTransactions)
    setCategories(fetchedCategories)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let income = 0
    let expenses = 0
    const categorySpending: { [key: string]: number } = {}

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() + 1 === currentMonth && transactionDate.getFullYear() === currentYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

    filteredTransactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount
      } else {
        expenses += t.amount
        categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + t.amount
      }
    })

    setTotalIncome(income)
    setTotalExpenses(expenses)
    setNetBalance(income - expenses) // Calculate net balance

    const spendingData = Object.entries(categorySpending).map(([categoryId, amount]) => {
      const category = categories.find(cat => cat.id === categoryId)
      return {
        name: category ? category.name : 'Uncategorized',
        value: amount,
        color: category ? category.color : '#CCCCCC',
      }
    }).filter(data => data.value > 0);

    setSpendingByCategoryData(spendingData)

    // Prepare data for Income/Expense Trend Chart (last 6 months relative to selected month)
    const trendLabels: string[] = [];
    const incomeData: number[] = [];
    const expenseData: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const yearShort = date.getFullYear().toString().slice(-2);
      trendLabels.push(`${monthName} ${yearShort}`);

      let monthIncome = 0;
      let monthExpenses = 0;

      transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() && transactionDate.getFullYear() === date.getFullYear();
      }).forEach(t => {
        if (t.type === 'income') {
          monthIncome += t.amount;
        } else {
          monthExpenses += t.amount;
        }
      });
      incomeData.push(monthIncome);
      expenseData.push(monthExpenses);
    }

    setIncomeExpenseTrendData({
      labels: trendLabels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    });

  }, [transactions, categories, currentMonth, currentYear])

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "N/A"
  }

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() + 1 === currentMonth && transactionDate.getFullYear() === currentYear;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

  const defaultCurrency = 'INR'; // Primary currency for reports

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Financial Reports</CardTitle>
          <MonthYearPicker
            month={currentMonth}
            year={currentYear}
            onMonthChange={setCurrentMonth}
            onYearChange={setCurrentYear}
          />
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">
            Summary for {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome, defaultCurrency)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses, defaultCurrency)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                <Wallet className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netBalance, defaultCurrency)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <PieChartCard
              title="Spending by Category"
              data={spendingByCategoryData.map(item => item.value)}
              labels={spendingByCategoryData.map(item => item.name)}
              colors={spendingByCategoryData.map(item => item.color)}
              emptyMessage="No expenses for this period."
            />
            <BarChartCard
              title="Income vs. Expenses Trend"
              data={incomeExpenseTrendData}
              emptyMessage="No transaction data for trend analysis."
            />
          </div>

          <h3 className="text-lg font-semibold mb-4">All Transactions for Selected Period</h3>
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
                      <TableCell>
                        <span
                          className={`${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          } font-medium`}
                        >
                          {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{transaction.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No transactions recorded for {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
