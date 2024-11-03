import { Document as Doc } from "schema";
import { useMutation, useQuery } from "./main";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

const Dashboard = () => {
  const docQuery = useQuery("documents", "/documents");
  const navigate = useNavigate();
  const createDoc = useMutation("create_document", "/documents");
  if (docQuery.isLoading) {
    return <>Loading</>;
  }
  if (docQuery.isError) {
    return <>Error</>;
  }
  const handleNew = () => {
    const slug = "untitled";
    createDoc.mutate(
      {
        title: "Untitled",
        slug: "untitled",
        content: "",
      },
      {
        onSuccess: () => {
          navigate(`/documents/${slug}`);
        },
      },
    );
  };
  return (
    <div className="mx-auto max-w-[960px]">
      <button onClick={handleNew}>
        <FiPlus />
      </button>
      <div className="grid grid-cols-2 gap-4">
        {docQuery.data?.map((document: Doc) => (
          <Document document={document} key={document.slug} />
        ))}
      </div>
    </div>
  );
};

type DocumentProp = {
  document: Doc;
};

const Document = ({ document }: DocumentProp) => {
  return (
    <Link to={`document/${document.slug}`}>
      <div className="bg-zinc-700 rounded-md p-2 flex flex-cols">
        <div>{document.title}</div>
      </div>
    </Link>
  );
};

export default Dashboard;
