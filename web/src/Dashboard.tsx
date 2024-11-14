import { Document as Doc } from "schema";
import { QueryErr, useDelete, useMutation, useQuery } from "./main";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FiFile, FiMoreVertical, FiTrash } from "react-icons/fi";
import { formatDate } from "./utils";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import Spinner from "./components/Spinner";

const docStyle =
  " bg-zinc-700/50 hover:bg-zinc-700/80 transition-colors rounded-2xl ";

const Dashboard = () => {
  const docQuery = useQuery<Doc[]>("documents", "/documents");
  const navigate = useNavigate();
  const createDoc = useMutation("create_document", "/documents");
  if (docQuery.isLoading) {
    return <>Loading</>;
  }
  if (docQuery.isError) {
    if ((docQuery.error as QueryErr).status === 401) {
      return <Navigate to="/login" />;
    } else {
      return <>Error</>;
    }
  }
  const handleNew = async () => {
    let doc = await createDoc.mutateAsync({
      title: "Untitled",
      content: "",
    });
    navigate(`/document/${doc.id}`);
  };
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-8 border-t-sky-400/10 border-t-2 rounded-3xl hover:border-t-sky-400/20 transition-colors duration-700">
        {docQuery.data
          ?.sort(
            (a: Doc, b: Doc) =>
              new Date(a.updated_at).getTime() -
              new Date(b.updated_at).getTime(),
          )
          .map((document: Doc) => (
            <Document document={document} key={document.id} />
          ))}
        <button
          onClick={handleNew}
          className={
            "w-full flex items-center justify-center gap-2 min-h-[5rem]" +
            docStyle
          }
        >
          <FiFile />
          <p>New File</p>
        </button>
      </div>
    </div>
  );
};

type DocumentProp = {
  document: Doc;
};

const Document = ({ document }: DocumentProp) => {
  const delDoc = useDelete("delete_document", `/document/${document.id}`);
  const qc = useQueryClient();
  const deleteDoc = async () => {
    await delDoc.mutateAsync();
    qc.invalidateQueries({ queryKey: ["documents"] });
  };
  return (
    <Link to={`document/${document.id}`}>
      <div className={docStyle + "p-6 flex flex-cols items-end"}>
        <div className="flex flex-col gap-2 flex-1">
          <p className="font-semibold text-xl">{document.title}</p>
          <p className="font-medium text-sm">
            {formatDate(document.updated_at)}
          </p>
        </div>
        <Popover className="relative">
          <PopoverButton className="outline-none">
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
};

export default Dashboard;
