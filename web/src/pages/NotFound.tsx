import { FiXOctagon } from "react-icons/fi";

export function Component() {
  return (
    <div className="grid place-items-center min-h-screen">
      <div className="flex flex-col items-center gap-8">
        <FiXOctagon size={128} />
        <p className="text-4xl font-bold">Not found</p>
      </div>
    </div>
  );
}
