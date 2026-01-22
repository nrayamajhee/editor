import { getAuth } from "@clerk/react-router/server";
import { Form, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/finance";
import { postForm } from "~/utils/query";
import type { Transaction } from "~/schema";
import { useEffect, useRef, useState } from "react";
import FileDrop from "~/components/FileDrop";
import FileInput from "~/components/FileInput";
import TransactionTable from "~/components/TransactionTable";
import { FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";
import { faker } from "@faker-js/faker";

const categories = [
  "Groceries",
  "Dining",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Healthcare",
  "Salary",
  "Freelance",
  "Investment",
];

function generateFakeTransactions(count: number): Transaction[] {
  return Array.from({ length: count }, () => {
    const isIncome = Math.random() > 0.7;
    const amount = isIncome
      ? parseFloat(faker.finance.amount({ min: 500, max: 5000 }))
      : -parseFloat(faker.finance.amount({ min: 10, max: 500 }));

    return {
      id: faker.string.uuid(),
      date: faker.date.past({ years: 1 }).toISOString(),
      description: isIncome
        ? faker.company.name() + " Payment"
        : faker.commerce.productName(),
      amount: amount,
      category: faker.helpers.arrayElement(categories),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function loader(args: Route.LoaderArgs) {
  await getAuth(args);

  // Generate 20 fake transactions
  const transactions = generateFakeTransactions(20);

  return { transactions };
}

export async function action(args: Route.ActionArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  if (token && args.request.method === "POST") {
    const formData = await args.request.formData();
    const file = formData.get("csv") as File;
    if (!file.name.endsWith(".csv")) {
      return { message: "File must be a CSV", type: "error" };
    }
    if (file.size > 1024 * 1024 * 10) {
      return { message: "File size must be less than 10MB", type: "error" };
    }
    try {
      const result = await postForm("/transactions/upload", token, formData);
      return { type: "success", message: result };
    } catch (e) {
      return {
        type: "error",
        message: (e as Error)?.message ?? undefined,
      };
    }
  }
}

export function meta() {
  return [
    { title: "Finance" },
    { name: "description", content: "Manage your finances" },
  ];
}

export default function Finance() {
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const actionData = useActionData();
  const { transactions } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (actionData?.type === "error") {
      toast.error(actionData?.message);
    } else if (actionData?.type === "success") {
      toast.success("Transactions uploaded successfully");
    }
    setUploading(false);
  }, [actionData]);

  const handleDrop = (files: FileList) => {
    if (inputRef.current && formRef.current) {
      setUploading(true);
      inputRef.current.files = files;
      formRef.current.submit();
    }
  };

  const handleFileChange = (files: FileList) => {
    if (inputRef.current && formRef.current) {
      setUploading(true);
      inputRef.current.files = files;
      formRef.current.submit();
    }
  };

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        <Form method="post" encType="multipart/form-data" ref={formRef}>
          <input type="file" name="csv" accept=".csv" hidden ref={inputRef} />
          <FileInput
            uploading={uploading}
            onFileChange={handleFileChange}
            accept=".csv"
            label={
              <>
                <FiUpload />
                <span>Upload CSV</span>
              </>
            }
          />
        </Form>
      </div>
      <div className="relative">
        <FileDrop onDrop={handleDrop} uploading={uploading} style="ghost" />
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            No transactions yet. Upload a CSV file to get started.
          </div>
        ) : (
          <TransactionTable transactions={transactions} />
        )}
      </div>
    </div>
  );
}
