import type { Transaction } from "~/schema";

type TransactionTableProps = {
  transactions: Transaction[];
};

const categoryColors: Record<string, string> = {
  Groceries: "bg-green-500/20 text-white",
  Dining: "bg-orange-500/20 text-white",
  Transportation: "bg-blue-500/20 text-white",
  Entertainment: "bg-purple-500/20 text-white",
  Utilities: "bg-yellow-500/20 text-white",
  Shopping: "bg-pink-500/20 text-white",
  Healthcare: "bg-red-500/20 text-white",
  Salary: "bg-emerald-500/20 text-white",
  Freelance: "bg-cyan-500/20 text-white",
  Investment: "bg-indigo-500/20 text-white",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-4 px-4 text-zinc-400 font-medium rounded-tl-lg rounded-bl-lg bg-zinc-800/50">
              Date
            </th>
            <th className="py-4 px-4 text-zinc-400 font-medium bg-zinc-800/50">
              Description
            </th>
            <th className="py-4 px-4 text-zinc-400 font-medium bg-zinc-800/50">
              Category
            </th>
            <th className="py-4 px-4 text-zinc-400 font-medium text-right rounded-tr-lg rounded-br-lg bg-zinc-800/50">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction: Transaction) => (
            <tr key={transaction.id} className="group">
              <td className="py-4 px-4 text-zinc-300 rounded-l-lg group-hover:bg-zinc-800/30 transition-colors">
                {formatDate(transaction.date)}
              </td>
              <td className="py-4 px-4 text-white group-hover:bg-zinc-800/30 transition-colors">
                {transaction.description}
              </td>
              <td className="py-4 px-4 group-hover:bg-zinc-800/30 transition-colors">
                {transaction.category ? (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      categoryColors[transaction.category] ||
                      "bg-zinc-700/50 text-zinc-400"
                    }`}
                  >
                    {transaction.category}
                  </span>
                ) : (
                  <span className="text-zinc-500">-</span>
                )}
              </td>
              <td
                className={`py-4 px-4 text-right font-medium rounded-r-lg group-hover:bg-zinc-800/30 transition-colors ${
                  transaction.amount >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                ${Math.abs(transaction.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
