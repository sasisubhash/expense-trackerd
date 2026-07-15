import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Required for autoTable plugin
import { getAllTransactions, getAllCategories, getAllBudgets, getAllSavingsGoals, getAllDebts, Transaction, Category, Budget, SavingsGoal, Debt, formatCurrency } from './data-store';

// Helper to get category name for reports
const getCategoryName = (categoryId: string, categories: Category[]) => {
  const category = categories.find((cat) => cat.id === categoryId);
  return category ? category.name : "Uncategorized";
};

// --- CSV Export ---
export async function exportTransactionsToCsv() {
  const transactions = await getAllTransactions();
  const categories = await getAllCategories();

  const dataForCsv = transactions.map(t => ({
    ID: t.id,
    Type: t.type,
    Amount: t.amount.toFixed(2),
    Currency: t.currency,
    Category: getCategoryName(t.categoryId, categories),
    Date: t.date,
    Notes: t.notes || '',
    'Receipt Link': t.receiptLink || '',
    'Recurring ID': t.recurringId || '',
  }));

  const csv = Papa.unparse(dataForCsv);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// --- XLSX Export ---
export async function exportToXlsx(dataType: 'transactions' | 'budgets' | 'goals' | 'debts') {
  let data: any[] = [];
  let fileName = '';
  let sheetName = '';
  const categories = await getAllCategories(); // Fetch categories once

  switch (dataType) {
    case 'transactions':
      const transactions = await getAllTransactions();
      data = transactions.map(t => ({
        ID: t.id,
        Type: t.type,
        Amount: t.amount,
        Currency: t.currency,
        Category: getCategoryName(t.categoryId, categories),
        Date: t.date,
        Notes: t.notes || '',
        'Receipt Link': t.receiptLink || '',
        'Recurring ID': t.recurringId || '',
      }));
      fileName = 'transactions.xlsx';
      sheetName = 'Transactions';
      break;
    case 'budgets':
      const budgets = await getAllBudgets();
      data = budgets.map(b => ({
        ID: b.id,
        Category: getCategoryName(b.categoryId, categories),
        Amount: b.amount,
        Month: b.month,
        Year: b.year,
        'Rollover Amount': b.rolloverAmount || 0,
      }));
      fileName = 'budgets.xlsx';
      sheetName = 'Budgets';
      break;
    case 'goals':
      const goals = await getAllSavingsGoals();
      data = goals.map(g => ({
        ID: g.id,
        Name: g.name,
        'Target Amount': g.targetAmount,
        'Current Amount': g.currentAmount,
        Deadline: g.deadline,
      }));
      fileName = 'savings_goals.xlsx';
      sheetName = 'Savings Goals';
      break;
    case 'debts':
      const debts = await getAllDebts();
      data = debts.map(d => ({
        ID: d.id,
        Name: d.name,
        Principal: d.principal,
        'Current Balance': d.currentBalance,
        'Interest Rate (%)': (d.interestRate * 100).toFixed(2),
        'Due Date': d.dueDate,
        'Monthly Payment': d.monthlyPayment,
      }));
      fileName = 'debts.xlsx';
      sheetName = 'Debts';
      break;
    default:
      console.error('Unknown data type for XLSX export:', dataType);
      return;
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

// --- JSON Export ---
export async function exportToJson() {
  const allData = {
    transactions: await getAllTransactions(),
    categories: await getAllCategories(),
    budgets: await getAllBudgets(),
    recurringTransactions: await getAllRecurringTransactions(),
    savingsGoals: await getAllSavingsGoals(),
    debts: await getAllDebts(),
  };

  const jsonString = JSON.stringify(allData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'budget_data.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// --- PDF Export ---
export async function exportToPdf(dataType: 'transactions' | 'budgets' | 'goals' | 'debts') {
  const doc = new jsPDF();
  let title = '';
  let head: string[][] = [];
  let body: (string | number)[][] = [];
  const categories = await getAllCategories();

  switch (dataType) {
    case 'transactions':
      title = 'Transactions Report';
      head = [['Date', 'Type', 'Category', 'Amount', 'Notes']];
      const transactions = await getAllTransactions();
      body = transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        getCategoryName(t.categoryId, categories),
        formatCurrency(t.amount, t.currency),
        t.notes || '-',
      ]);
      break;
    case 'budgets':
      title = 'Budgets Report';
      head = [['Category', 'Budgeted Amount', 'Month', 'Year']];
      const budgets = await getAllBudgets();
      body = budgets.map(b => [
        getCategoryName(b.categoryId, categories),
        formatCurrency(b.amount, 'INR'),
        new Date(b.year, b.month - 1).toLocaleString('default', { month: 'long' }),
        b.year,
      ]);
      break;
    case 'goals':
      title = 'Savings Goals Report';
      head = [['Goal Name', 'Target Amount', 'Current Amount', 'Deadline']];
      const goals = await getAllSavingsGoals();
      body = goals.map(g => [
        g.name,
        formatCurrency(g.targetAmount, 'INR'),
        formatCurrency(g.currentAmount, 'INR'),
        new Date(g.deadline).toLocaleDateString(),
      ]);
      break;
    case 'debts':
      title = 'Debt Tracking Report';
      head = [['Debt Name', 'Principal', 'Current Balance', 'Interest Rate (%)', 'Monthly Payment', 'Due Date']];
      const debts = await getAllDebts();
      body = debts.map(d => [
        d.name,
        formatCurrency(d.principal, 'INR'),
        formatCurrency(d.currentBalance, 'INR'),
        (d.interestRate * 100).toFixed(2) + '%',
        formatCurrency(d.monthlyPayment, 'INR'),
        new Date(d.dueDate).toLocaleDateString(),
      ]);
      break;
    default:
      console.error('Unknown data type for PDF export:', dataType);
      return;
  }

  (doc as any).autoTable({
    head: head,
    body: body,
    startY: 20,
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74] }, // Tailwind green-600
    didDrawPage: function (data: any) {
      doc.text(title, data.settings.margin.left, 15);
    }
  });

  doc.save(`${dataType}_report.pdf`);
}
