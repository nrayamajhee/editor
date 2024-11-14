import { formatDate } from "../utils";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import Spinner from "./Spinner";
import { useDelete } from "../main";
import { FiMoreVertical, FiTrash } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Document as Doc } from "schema";

export const docStyle =
  "bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors rounded-2xl outline-none";

type DocumentProp = {
  document: Doc;
};

export default function Document({ document }: DocumentProp) {
  const delDoc = useDelete("delete_document", `/document/${document.id}`);
  const qc = useQueryClient();
  const deleteDoc = async () => {
    await delDoc.mutateAsync();
    qc.invalidateQueries({ queryKey: ["documents"] });
  };
  return (
    <Link to={`document/${document.id}`} className={docStyle}>
      <div className="p-6 flex flex-cols items-end">
        <div className="flex flex-col gap-2 flex-1">
          <p className="font-semibold text-xl">{document.title}</p>
          <p className="font-medium text-sm">
            {formatDate(document.updated_at)}
          </p>
        </div>
        <Popover className="relative">
          <PopoverButton className="outline-none focus:bg-zinc-600 hover:bg-zinc-600 p-2 rounded-md">
            <FiMoreVertical />
          </PopoverButton>
          <PopoverPanel
            anchor={{
              to: "bottom",
            }}
            className="flex flex-col items-stretch bg-zinc-700 rounded-md p-2 gap-2 min-w-32 shadow-md"
          >
            <button
              className="flex gap-2 items-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteDoc();
              }}
            >
              {delDoc.isPending ? <Spinner /> : <FiTrash />}
              Delete document
            </button>
          </PopoverPanel>
        </Popover>
      </div>
    </Link>
  );
}
