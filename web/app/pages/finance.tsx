import { getAuth } from "@clerk/react-router/server";
import { Form, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/finance";
import { get, postForm } from "~/utils/query";
import type { Transaction } from "~/schema";
import { useEffect, useRef, useState } from "react";
import FileDrop from "~/components/FileDrop";
import Spinner from "~/ui/Spinner";
import { FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";

export async function loader(args: Route.LoaderArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  const transactions = await get("/transactions", token ?? "");
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

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold text-white mb-6">Finance</h1>
      <div className="relative">
        <FileDrop onDrop={handleDrop} uploading={uploading} style="ghost" />
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            No transactions yet. Upload a CSV file to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="py-3 px-4 text-zinc-400 font-medium">Date</th>
                  <th className="py-3 px-4 text-zinc-400 font-medium">
                    Description
                  </th>
                  <th className="py-3 px-4 text-zinc-400 font-medium">
                    Category
                  </th>
                  <th className="py-3 px-4 text-zinc-400 font-medium text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction: Transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-zinc-300">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {transaction.description}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {transaction.category || "-"}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-medium ${
                        transaction.amount >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Form method="post" encType="multipart/form-data" ref={formRef}>
          <input
            onChange={() => formRef.current?.submit()}
            type="file"
            id="csvUpload"
            name="csv"
            accept=".csv"
            hidden
            ref={inputRef}
          />
          <label
            htmlFor="csvUpload"
            className="mt-4 bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors outline-none flex items-center justify-center gap-2 px-6 py-4 rounded-lg cursor-pointer"
          >
            {uploading ? (
              <Spinner />
            ) : (
              <>
                <FiUpload />
                <span>Upload CSV</span>
              </>
            )}
          </label>
        </Form>
      </div>
    </div>
  );
}
