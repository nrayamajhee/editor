import { createClerkClient } from "@clerk/remix/api.server";
import { getAuth, type User } from "@clerk/remix/ssr.server";
import { LoaderFunction } from "@remix-run/node";
import { Link, redirect, useLoaderData } from "@remix-run/react";
import Profile from "~/components/Profile";
// import Weather from "~/components/Weather";

function Header({ user }: { user: User }) {
  const linkStyle =
    "py-4 px-8 border-b-4 border-b-sky-400/20 outline-none active:border-b-sky-400/50 focus:border-b-sky-400/50 hover:border-b-sky-400/50 transition-colors";
  return (
    <div>
      <div className="flex justify-between px-16">
        <Profile variant="big" user={user} />
      </div>
      <nav className="flex gap-1 px-8">
        <Link className={linkStyle} to="/">
          Documents
        </Link>
        <Link className={linkStyle} to="/pictures">
          Pictures
        </Link>
      </nav>
    </div>
  );
}

export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/login");
  }
  const user = await createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  }).users.getUser(userId);
  return { user };
};

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();
  // const docQuery = useQuery<Doc[]>("documents", "/documents");
  // const navigate = useNavigate();
  // const createDoc = useMutation("create_document", "/documents");
  // const handleNew = async () => {
  //   let doc = await createDoc.mutateAsync({
  //     title: "Untitled",
  //     content: "",
  //   });
  //   navigate(`/document/${doc.id}`);
  // };
  return (
    <div>
      <Header user={user} />
      {/*
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-8 border-t-sky-400/10 border-t-2 rounded-3xl hover:border-t-sky-400/20 transition-colors duration-700">
        {docQuery.data
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
      */}
    </div>
  );
}
