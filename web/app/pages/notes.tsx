import { getAuth } from "@clerk/react-router/server";
import type { Route } from "./+types/notes";
import { type Note as N, type NewNote } from "~/schema";
import { get, post } from "~/utils/query";
import Spinner from "~/ui/Spinner";
import { FiFile } from "react-icons/fi";
import {
  Form,
  redirect,
  useLoaderData,
  useNavigation,
  useParams,
} from "react-router";
import NoteLink from "~/components/Note";

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

export default function Notes() {
  const { notes } = useLoaderData<typeof loader>();
  const { username } = useParams();
  const { state, formMethod } = useNavigation();
  const isCreating = state !== "idle" && formMethod === "POST";
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8  p-6 md:p-8 ">
      {notes
        .sort(
          (a: N, b: N) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        )
        .map((note: N) => (
          <NoteLink
            document={note}
            key={note.id}
            link={`/${username}/note/${note.id}`}
          />
        ))}
      <Form method="post">
        <input type="hidden" name="title" value="Untitled" />
        <button className="cursor-pointer bg-zinc-900 active:bg-zinc-900 hover:bg-zinc-800 focus:bg-zinc-800 transition-colors rounded-2xl outline-none w-full flex items-center justify-center gap-2 min-h-[5rem]">
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
