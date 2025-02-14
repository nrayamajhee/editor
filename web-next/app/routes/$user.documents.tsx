import { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { type Document as Doc } from "schema";
import { post, get } from "~/utils/query";
import { getAuth, User } from "@clerk/remix/ssr.server";
import Document from "~/components/Document";
import { Form, redirect, useLoaderData, useNavigation } from "@remix-run/react";
import { FiFile } from "react-icons/fi";
import Spinner from "~/components/Spinner";
import Loader from "~/components/Loader";
import MainLayout from "~/components/MainLayout";
import { createClerkClient } from "@clerk/remix/api.server";

export const docStyle =
  "bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors rounded-2xl outline-none";

export const loader: LoaderFunction = async (args) => {
  const { userId, getToken } = await getAuth(args);
  const token = await getToken();
  if (!(token && userId)) {
    return redirect("/login");
  }

  const user = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  }).users.getUser(userId);
  const documents = get("/documents", token);

  return { user, documents, token };
};

export default function Dashboard() {
  const { state, formMethod } = useNavigation();
  const { documents, user } = useLoaderData<typeof loader>();
  const isCreating = state !== "idle" && formMethod === "POST";
  return (
    <div>
      {state === "loading" ? (
        <div>loading...</div>
      ) : (
        <MainLayout user={user}>
          <Loader scaffold={<Spinner />} promise={documents}>
            {(documents: Doc[]) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-6 md:p-8 border-t-sky-400/10 border-t-2 rounded-3xl hover:border-t-sky-400/20 transition-colors duration-700">
                {documents
                  .sort(
                    (a: Doc, b: Doc) =>
                      new Date(a.updated_at).getTime() -
                      new Date(b.updated_at).getTime()
                  )
                  .map((document: Doc) => (
                    <Document document={document} key={document.id} />
                  ))}
                <Form action="/documents" method="POST">
                  <input type="hidden" name="title" value="Untitled" />
                  <button
                    className={
                      docStyle +
                      " w-full flex items-center justify-center gap-2 min-h-[5rem]"
                    }
                  >
                    {isCreating ? (
                      <Spinner />
                    ) : (
                      <>
                        <FiFile />
                        <p>New File</p>
                      </>
                    )}
                  </button>
                </Form>
              </div>
            )}
          </Loader>
        </MainLayout>
      )}
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  if (token) {
    if (args.request.method === "POST") {
      const doc = (await post<Partial<Doc>>("/documents", token, {
        title: "Untitled",
        content: "",
      })) as Doc;
      return redirect(`/document/${doc.id}`);
    } else {
      // const id = args.params.id;
      // const token = await getToken();
      // if (token) {
      //   del(`/document/${id}`, token);
      //   redirect("/");
      // }
    }
  }
}
