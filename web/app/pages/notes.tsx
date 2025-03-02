import { getAuth } from "@clerk/react-router/ssr.server";
import type { Route } from "./+types/notes";
import { type Note as N, type NewNote } from "~/schema";
import { get, post } from "~/utils/query";
import Spinner from "~/components/Spinner";
import { FiFile } from "react-icons/fi";
import { Form, redirect, useParams } from "react-router";
import Note from "~/components/Note";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  const notes = await get("/notes", token ?? "");
  return { notes };
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function Notes({ loaderData }: Route.ComponentProps) {
  const { notes } = loaderData as { notes: N[] };
  const { username } = useParams();
  // const { state, formMethod } = useNavigate();
  // const isCreating = state !== "idle" && formMethod === "POST";
  const isCreating = false;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 ">
      {notes
        .sort(
          (a: N, b: N) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        )
        .map((note: N) => (
          <Note
            document={note}
            key={note.id}
            link={`/${username}/note/${note.id}`}
          />
        ))}
      <Form method="post">
        <input type="hidden" name="title" value="Untitled" />
        <button className="bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors rounded-2xl outline-none w-full flex items-center justify-center gap-2 min-h-[5rem]">
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
  );
}

export async function action(args: Route.ActionArgs) {
  const { username } = args.params;
  const { getToken } = await getAuth(args);
  const token = await getToken();
  if (token) {
    if (args.request.method === "POST") {
      const doc = (await post<NewNote>("/notes", token, {
        title: "Untitled",
        content: "",
      })) as N;
      return redirect(`/${username}/note/${doc.id}`);
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
