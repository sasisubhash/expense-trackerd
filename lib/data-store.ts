import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

// Define data types
export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string; // Added currency field
  categoryId: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  receiptLink?: string;
  recurringId?: string;
};

export type Category = {
  id: string;
  name: string;
  color: string; // Hex color code
  isDefault: boolean;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  month: number; // 1-12
  year: number;
  rolloverAmount?: number; // Amount rolled over from previous month
};

export type RecurringTransaction = {
  id: string;
  type: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'custom';
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  originalTransaction: Omit<Transaction, 'id' | 'date' | 'recurringId'>;
  customInterval?: { unit: 'days' | 'weeks' | 'months' | 'years', value: number };
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  linkedTransactions: string[]; // Array of transaction IDs
};

export type Debt = {
  id: string;
  name: string;
  principal: number;
  currentBalance: number;
  interestRate: number; // as a decimal, e.g., 0.05 for 5%
  dueDate: string; // YYYY-MM-DD
  monthlyPayment: number;
};

// Initialize localforage stores
const transactionsStore = localforage.createInstance({
  name: 'budgetApp',
  storeName: 'transactions',
  description: 'Stores all financial transactions'
});

const categoriesStore = localforage.createInstance({
  name: 'budgetApp',
  storeName: 'categories',
  description: 'Stores user-defined categories'
});

const budgetsStore = localforage.createInstance({
  name: 'budgetApp',
  storeName: 'budgets',
  description: 'Stores monthly budget allocations'
});

const recurringTransactionsStore = localforage.createInstance({
  name: 'budgetApp',
  storeName: 'recurringTransactions',
  description: 'Stores recurring transaction templates'
});

const savingsGoalsStore = localforage.createInstance({
  name: 'budgetApp',
  storeName: 'savingsGoals',
  description: 'Stores savings goals'
});

const debtsStore = localforage.createInstance({
  name: 'budgetApp',
  storeName: 'debts',
  description: 'Stores debt information'
});

// --- Utility Functions ---

// Initialize default categories if none exist
export async function initializeDefaultCategories() {
  const existingCategories = await getAllCategories();
  if (existingCategories.length === 0) {
    const defaultCategories: Category[] = [
      { id: uuidv4(), name: 'Food', color: '#FF6384', isDefault: true },
      { id: uuidv4(), name: 'Rent', color: '#36A2EB', isDefault: true },
      { id: uuidv4(), name: 'Transport', color: '#FFCE56', isDefault: true },
      { id: uuidv4(), name: 'Utilities', color: '#4BC0C0', isDefault: true },
      { id: uuidv4(), name: 'Entertainment', color: '#9966FF', isDefault: true },
      { id: uuidv4(), name: 'Salary', color: '#4CAF50', isDefault: true },
      { id: uuidv4(), name: 'Other Income', color: '#8BC34A', isDefault: true },
    ];
    for (const category of defaultCategories) {
      await addCategory(category);
    }
    console.log("Default categories initialized.");
  } else {
    console.log("Default categories already exist.");
  }
}

// Helper to format currency
export function formatCurrency(amount: number, currency: string = 'INR', locale: string = 'en-IN'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.warn(`Invalid currency code or locale: ${currency}, ${locale}. Falling back to simple format.`, error);
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// --- Generic CRUD Operations ---

async function getAll<T>(store: LocalForage): Promise<T[]> {
  const items: T[] = [];
  await store.iterate((value: T) => {
    items.push(value);
  });
  return items;
}

async function getById<T>(store: LocalForage, id: string): Promise<T | null> {
  return (await store.getItem(id)) as T | null;
}

async function add<T extends { id: string }>(store: LocalForage, item: T): Promise<T> {
  if (!item.id) {
    item.id = uuidv4();
  }
  await store.setItem(item.id, item);
  return item;
}

async function update<T extends { id: string }>(store: LocalForage, item: T): Promise<T> {
  await store.setItem(item.id, item);
  return item;
}

async function remove(store: LocalForage, id: string): Promise<void> {
  await store.removeItem(id);
}

// --- Specific Data Store Functions ---

// Transactions
export const getAllTransactions = () => getAll<Transaction>(transactionsStore);
export const getTransactionById = (id: string) => getById<Transaction>(transactionsStore, id);
export const addTransaction = (transaction: Omit<Transaction, 'id'>) => add<Transaction>(transactionsStore, { id: uuidv4(), ...transaction });
export const updateTransaction = (transaction: Transaction) => update<Transaction>(transactionsStore, transaction);
export const deleteTransaction = (id: string) => remove(transactionsStore, id);

// Categories
export const getAllCategories = () => getAll<Category>(categoriesStore);
export const getCategoryById = (id: string) => getById<Category>(categoriesStore, id);
export const addCategory = (category: Omit<Category, 'id'>) => add<Category>(categoriesStore, { id: uuidv4(), ...category });
export const updateCategory = (category: Category) => update<Category>(categoriesStore, category);
export const deleteCategory = (id: string) => remove(categoriesStore, id);

// Budgets
export const getAllBudgets = () => getAll<Budget>(budgetsStore);
export const getBudgetById = (id: string) => getById<Budget>(budgetsStore, id);
export const addBudget = (budget: Omit<Budget, 'id'>) => add<Budget>(budgetsStore, { id: uuidv4(), ...budget });
export const updateBudget = (budget: Budget) => update<Budget>(budgetsStore, budget);
export const deleteBudget = (id: string) => remove(budgetsStore, id);

// Recurring Transactions
export const getAllRecurringTransactions = () => getAll<RecurringTransaction>(recurringTransactionsStore);
export const getRecurringTransactionById = (id: string) => getById<RecurringTransaction>(recurringTransactionsStore, id);
export const addRecurringTransaction = (recurringTransaction: Omit<RecurringTransaction, 'id'>) => add<RecurringTransaction>(recurringTransactionsStore, { id: uuidv4(), ...recurringTransaction });
export const updateRecurringTransaction = (recurringTransaction: RecurringTransaction) => update<RecurringTransaction>(recurringTransactionsStore, recurringTransaction);
export const deleteRecurringTransaction = (id: string) => remove(recurringTransactionsStore, id);

// Savings Goals
export const getAllSavingsGoals = () => getAll<SavingsGoal>(savingsGoalsStore);
export const getSavingsGoalById = (id: string) => getById<SavingsGoal>(savingsGoalsStore, id);
export const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => add<SavingsGoal>(savingsGoalsStore, { id: uuidv4(), ...goal });
export const updateSavingsGoal = (goal: SavingsGoal) => update<SavingsGoal>(savingsGoalsStore, goal);
export const deleteSavingsGoal = (id: string) => remove(savingsGoalsStore, id);

// Debts
export const getAllDebts = () => getAll<Debt>(debtsStore);
export const getDebtById = (id: string) => getById<Debt>(debtsStore, id);
export const addDebt = (debt: Omit<Debt, 'id'>) => add<Debt>(debtsStore, { id: uuidv4(), ...debt });
export const updateDebt = (debt: Debt) => update<Debt>(debtsStore, debt);
export const deleteDebt = (id: string) => remove(debtsStore, id);

// Clear all data (for development/reset)
export async function clearAllData() {
  await transactionsStore.clear();
  await categoriesStore.clear();
  await budgetsStore.clear();
  await recurringTransactionsStore.clear();
  await savingsGoalsStore.clear();
  await debtsStore.clear();
  console.log("All data cleared.");
  await initializeDefaultCategories(); // Re-initialize default categories after clearing
}

// --- Dummy Data Seeding ---
export async function seedDummyData() {
  await initializeDefaultCategories(); // Ensure default categories exist first

  const existingTransactions = await getAllTransactions();
  if (existingTransactions.length > 0) {
    console.log("Dummy data already exists. Skipping seeding.");
    return;
  }

  console.log("Seeding dummy data...");

  const categories = await getAllCategories();
  const foodCat = categories.find(c => c.name === 'Food')?.id || uuidv4();
  const rentCat = categories.find(c => c.name === 'Rent')?.id || uuidv4();
  const salaryCat = categories.find(c => c.name === 'Salary')?.id || uuidv4();
  const transportCat = categories.find(c => c.name === 'Transport')?.id || uuidv4();
  const entertainmentCat = categories.find(c => c.name === 'Entertainment')?.id || uuidv4();

  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);

  const dummyTransactions: Omit<Transaction, 'id'>[] = [
    // Current month
    { type: 'income', amount: 50000, currency: 'INR', categoryId: salaryCat, date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split('T')[0], notes: 'Monthly Salary' },
    { type: 'expense', amount: 12000, currency: 'INR', categoryId: rentCat, date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0], notes: 'Monthly Rent' },
    { type: 'expense', amount: 500, currency: 'INR', categoryId: foodCat, date: new Date(today.getFullYear(), today.getMonth(), 3).toISOString().split('T')[0], notes: 'Groceries' },
    { type: 'expense', amount: 200, currency: 'INR', categoryId: transportCat, date: new Date(today.getFullYear(), today.getMonth(), 4).toISOString().split('T')[0], notes: 'Bus fare' },
    { type: 'expense', amount: 1500, currency: 'INR', categoryId: entertainmentCat, date: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0], notes: 'Movie night' },
    { type: 'expense', amount: 750, currency: 'INR', categoryId: foodCat, date: new Date(today.getFullYear(), today.getMonth(), 12).toISOString().split('T')[0], notes: 'Restaurant dinner' },
    { type: 'income', amount: 2000, currency: 'INR', categoryId: salaryCat, date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0], notes: 'Freelance work' },

    // Last month
    { type: 'income', amount: 50000, currency: 'INR', categoryId: salaryCat, date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 5).toISOString().split('T')[0], notes: 'Monthly Salary' },
    { type: 'expense', amount: 12000, currency: 'INR', categoryId: rentCat, date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString().split('T')[0], notes: 'Monthly Rent' },
    { type: 'expense', amount: 600, currency: 'INR', categoryId: foodCat, date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 7).toISOString().split('T')[0], notes: 'Groceries' },
    { type: 'expense', amount: 1000, currency: 'INR', categoryId: entertainmentCat, date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 14).toISOString().split('T')[0], notes: 'Concert tickets' },

    // Two months ago
    { type: 'income', amount: 48000, currency: 'INR', categoryId: salaryCat, date: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 5).toISOString().split('T')[0], notes: 'Monthly Salary' },
    { type: 'expense', amount: 11500, currency: 'INR', categoryId: rentCat, date: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 1).toISOString().split('T')[0], notes: 'Monthly Rent' },
    { type: 'expense', amount: 450, currency: 'INR', categoryId: foodCat, date: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 10).toISOString().split('T')[0], notes: 'Groceries' },
  ];

  for (const t of dummyTransactions) {
    await addTransaction(t);
  }

  const dummyBudgets: Omit<Budget, 'id'>[] = [
    { categoryId: foodCat, amount: 5000, month: today.getMonth() + 1, year: today.getFullYear() },
    { categoryId: rentCat, amount: 12000, month: today.getMonth() + 1, year: today.getFullYear() },
    { categoryId: transportCat, amount: 1000, month: today.getMonth() + 1, year: today.getFullYear() },
    { categoryId: entertainmentCat, amount: 2000, month: today.getMonth() + 1, year: today.getFullYear() },
  ];

  for (const b of dummyBudgets) {
    await addBudget(b);
  }

  const dummyGoals: Omit<SavingsGoal, 'id'>[] = [
    { name: 'New Laptop', targetAmount: 75000, currentAmount: 25000, deadline: '2025-12-31', linkedTransactions: [] },
    { name: 'Vacation Fund', targetAmount: 50000, currentAmount: 10000, deadline: '2026-06-30', linkedTransactions: [] },
  ];

  for (const g of dummyGoals) {
    await addSavingsGoal(g);
  }

  const dummyDebts: Omit<Debt, 'id'>[] = [
    { name: 'Student Loan', principal: 200000, currentBalance: 150000, interestRate: 0.07, dueDate: '2025-09-15', monthlyPayment: 5000 },
    { name: 'Credit Card', principal: 30000, currentBalance: 28000, interestRate: 0.24, dueDate: '2025-08-01', monthlyPayment: 2000 }, // Overdue if today > 2025-08-01
    { name: 'Car Loan', principal: 500000, currentBalance: 400000, interestRate: 0.09, dueDate: '2025-10-20', monthlyPayment: 10000 },
  ];

  for (const d of dummyDebts) {
    await addDebt(d);
  }

  console.log("Dummy data seeding complete.");
}
