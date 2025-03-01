import { Document as Doc } from "schema";
import { QueryErr, useMutation, useQuery } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import { FiFile } from "react-icons/fi";
import Document, { docStyle } from "../components/Document";

export function Component() {
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
            docStyle +
            " w-full flex items-center justify-center gap-2 min-h-[5rem]"
          }
        >
          <FiFile />
          <p>New File</p>
        </button>
      </div>
    </div>
  );
}
