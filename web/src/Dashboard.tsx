import { Document as Doc } from "schema";
import { QueryErr, useMutation, useQuery } from "./main";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import Profile from "./components/Profile";
import { formatDate } from "./utils";
import { useUser } from "@clerk/clerk-react";

const Dashboard = () => {
  const docQuery = useQuery("documents", "/documents");
  const navigate = useNavigate();
  const { user } = useUser();
  const createDoc = useMutation("create_document", "/documents");
  if (docQuery.isLoading) {
    return <>Loading</>;
  }
  if (docQuery.isError) {
    if ((docQuery.error as QueryErr).status === 401) {
      return <Profile />;
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
    <div className="mx-auto max-w-[960px] p-8 flex flex-col gap-8">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <p className="text-md font-medium">Welcome</p>
          <p className="text-xl font-semibold">{user?.fullName}</p>
        </div>
        <Profile variant="big" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {docQuery.data
          ?.sort(
            (a: Doc, b: Doc) =>
              new Date(a.updated_at).getTime() -
              new Date(b.updated_at).getTime(),
          )
          .map((document: Doc) => (
            <Document document={document} key={document.id} />
          ))}
        <div>
          <button
            onClick={handleNew}
            className="bg-zinc-700 rounded-md p-2  w-full h-full flex items-center justify-center gap-2"
          >
            <FiPlus /> <p>New File</p>
          </button>
        </div>
      </div>
    </div>
  );
};

type DocumentProp = {
  document: Doc;
};

const Document = ({ document }: DocumentProp) => {
  return (
    <Link to={`document/${document.id}`}>
      <div className="bg-zinc-700 rounded-md p-4 flex flex-cols">
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-xl">{document.title}</p>
          <p className="font-medium text-sm">
            {formatDate(document.updated_at)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default Dashboard;
