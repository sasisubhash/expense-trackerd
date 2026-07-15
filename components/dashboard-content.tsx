"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, PiggyBank, Wallet } from 'lucide-react'
import {
  getAllTransactions,
  Transaction,
  getAllCategories,
  Category,
  formatCurrency,
  getAllBudgets,
  Budget,
  getAllSavingsGoals,
  SavingsGoal,
} from "@/lib/data-store"
import MonthYearPicker from "@/components/month-year-picker"
import PieChartCard from "@/components/charts/pie-chart-card" // New import
import BarChartCard from "@/components/charts/bar-chart-card" // New import

export default function DashboardContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [balance, setBalance] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [spendingByCategoryData, setSpendingByCategoryData] = useState<any[]>([])
  const [incomeExpenseTrendData, setIncomeExpenseTrendData] = useState<any>({ labels: [], datasets: [] });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const loadData = async () => {
    const fetchedTransactions = await getAllTransactions()
    const fetchedCategories = await getAllCategories()
    const fetchedBudgets = await getAllBudgets()
    const fetchedSavingsGoals = await getAllSavingsGoals()

    setTransactions(fetchedTransactions)
    setCategories(fetchedCategories)
    setBudgets(fetchedBudgets)
    setSavingsGoals(fetchedSavingsGoals)
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
    });

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
    setBalance(income - expenses)

    const spendingData = Object.entries(categorySpending).map(([categoryId, amount]) => {
      const category = categories.find(cat => cat.id === categoryId)
      return {
        name: category ? category.name : 'Uncategorized',
        value: amount,
        color: category ? category.color : '#CCCCCC',
      }
    }).filter(data => data.value > 0);

    setSpendingByCategoryData(spendingData)

    // Prepare data for Income/Expense Trend Chart (last 6 months)
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

  const defaultCurrency = 'INR'; // Primary currency for overall balance display

  const totalSavingsProgress = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalSavingsTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallSavingsPercentage = totalSavingsTarget > 0 ? (totalSavingsProgress / totalSavingsTarget) * 100 : 0;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Overview</h2>
        <MonthYearPicker
          month={currentMonth}
          year={currentYear}
          onMonthChange={setCurrentMonth}
          onYearChange={setCurrentYear}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance, defaultCurrency)}</div>
            <p className="text-xs text-muted-foreground">Balance for selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Income (This Month)</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome, defaultCurrency)}</div>
            <p className="text-xs text-muted-foreground">Income for {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Expenses (This Month)</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses, defaultCurrency)}</div>
            <p className="text-xs text-muted-foreground">Expenses for {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Savings Progress</CardTitle>
            <PiggyBank className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallSavingsPercentage.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalSavingsProgress, defaultCurrency)} / {formatCurrency(totalSavingsTarget, defaultCurrency)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PieChartCard
          title="Spending by Category (This Month)"
          data={spendingByCategoryData.map(item => item.value)}
          labels={spendingByCategoryData.map(item => item.name)}
          colors={spendingByCategoryData.map(item => item.color)}
          emptyMessage="No expenses recorded for this month."
        />

        <BarChartCard
          title="Income vs. Expenses (Last 6 Months)"
          data={incomeExpenseTrendData}
          emptyMessage="No transaction data for the last 6 months."
        />

        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <ul className="space-y-2">
                {transactions.slice(0, 5).map(t => {
                  const category = categories.find(cat => cat.id === t.categoryId)
                  return (
                    <li key={t.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <div>
                        <div className="font-medium">{t.notes || (t.type === 'income' ? 'Income' : 'Expense')}</div>
                        <div className="text-sm text-muted-foreground">
                          {category?.name} - {new Date(t.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-[100px] text-muted-foreground">
                No transactions yet. Add some!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
