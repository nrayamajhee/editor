import type { Meta, StoryObj } from "@storybook/react-vite";
import TransactionTable from "./TransactionTable";
import type { Transaction } from "~/schema";

const meta = {
  title: "Components/TransactionTable",
  component: TransactionTable,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof TransactionTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTransactions: Transaction[] = [
  {
    id: "1",
    date: "2025-11-10T00:00:00.000Z",
    description: "Salary Payment",
    amount: 5000,
    category: "Salary",
    created_at: "2025-11-10T00:00:00.000Z",
    updated_at: "2025-11-10T00:00:00.000Z",
  },
  {
    id: "2",
    date: "2025-11-09T00:00:00.000Z",
    description: "Grocery Shopping",
    amount: -150.5,
    category: "Groceries",
    created_at: "2025-11-09T00:00:00.000Z",
    updated_at: "2025-11-09T00:00:00.000Z",
  },
  {
    id: "3",
    date: "2025-11-08T00:00:00.000Z",
    description: "Restaurant Dinner",
    amount: -85.0,
    category: "Dining",
    created_at: "2025-11-08T00:00:00.000Z",
    updated_at: "2025-11-08T00:00:00.000Z",
  },
  {
    id: "4",
    date: "2025-11-07T00:00:00.000Z",
    description: "Freelance Project",
    amount: 1200,
    category: "Freelance",
    created_at: "2025-11-07T00:00:00.000Z",
    updated_at: "2025-11-07T00:00:00.000Z",
  },
  {
    id: "5",
    date: "2025-11-06T00:00:00.000Z",
    description: "Electric Bill",
    amount: -120.0,
    category: "Utilities",
    created_at: "2025-11-06T00:00:00.000Z",
    updated_at: "2025-11-06T00:00:00.000Z",
  },
];

export const Default: Story = {
  args: {
    transactions: sampleTransactions,
  },
};

export const Empty: Story = {
  args: {
    transactions: [],
  },
};

export const SingleTransaction: Story = {
  args: {
    transactions: [sampleTransactions[0]],
  },
};
