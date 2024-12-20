import { createClerkClient } from "@clerk/remix/api.server";
import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunction } from "@remix-run/node";
import { Document as Doc } from "schema";
import Document from "~/components/Document";
import { redirect, useLoaderData } from "@remix-run/react";
import { get } from "~/query";
import { FiFile } from "react-icons/fi";
import Header from "~/components/Header";

export const docStyle =
  "bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors rounded-2xl outline-none";

export const loader: LoaderFunction = async (args) => {
  const { userId, getToken } = await getAuth(args);
  const token = await getToken();
  if (!(token && userId)) {
    return redirect("/login");
  }
  const user = await createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  }).users.getUser(userId);

  const documents = await get("/documents", token);

  return { user, documents };
};

export default function Dashboard() {
  const { user, documents } = useLoaderData<typeof loader>();
  // const docQuery = useQuery<Doc[]>("documents", "/documents");
  // const navigate = useNavigate();
  // const createDoc = useMutation("create_document", "/documents");
  const handleNew = async () => {
    //   let doc = await createDoc.mutateAsync({
    //     title: "Untitled",
    //     content: "",
    //   });
    //   navigate(`/document/${doc.id}`);
  };
  return (
    <div className="mx-auto max-w-[960px] py-8 px-4 flex flex-col min-h-screen">
      <Header user={user} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-8 border-t-sky-400/10 border-t-2 rounded-3xl hover:border-t-sky-400/20 transition-colors duration-700">
        {documents
          ?.sort(
            (a: Doc, b: Doc) =>
              new Date(a.updated_at).getTime() -
              new Date(b.updated_at).getTime()
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
