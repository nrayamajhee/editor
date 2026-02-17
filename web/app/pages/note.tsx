import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { getAuth } from "@clerk/react-router/server";
import type { Route } from "./+types/note";
import { Link, redirect, useLoaderData, useSubmit } from "react-router";
import { del, get, post } from "~/utils/query";
import { useAuth, useClerk } from "@clerk/react-router";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { FiArrowLeft, FiColumns, FiEdit, FiEye } from "react-icons/fi";
import Profile from "~/components/Profile";
import SecureImage from "~/components/SecureImage";
import Monaco from "~/components/Monaco";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus as syntaxTheme } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useDebounce } from "@uidotdev/usehooks";

export const docStyle =
  "bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors rounded-2xl outline-none";

type Mode = "edit" | "view" | "split";

export async function loader(args: Route.LoaderArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  if (!token) {
    return redirect("/");
  }
  const note = await get(`/note/${args.params.id}`, token);
  return { note };
}

export async function action(args: Route.ActionArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  if (args.request.method === "DELETE" && token) {
    await del(`/note/${args.params.id}`, token);
    return redirect(`/${args.params.username}/notes`);
  }
  if (args.request.method === "POST" && token) {
    const body = await args.request.json();
    return await post(`/note/${args.params.id}`, token, body);
  }
}

export default function Note() {
  const clerk = useClerk();
  const { getToken } = useAuth();
  const submit = useSubmit();
  const { note } = useLoaderData<typeof loader>();
  const [text, setText] = useState<string | undefined>(note.content || "");
  const [mode, setMode] = useState<Mode>("split");
  const getColor = (buttonMode: Mode) =>
    buttonMode === mode ? "bg-zinc-700" : "";
  const lastWidth = useRef(0);

  useEffect(() => {
    // Set initial width and mode
    lastWidth.current = window.innerWidth;
    if (window.innerWidth <= 768) {
      setMode("view");
    } else {
      setMode("split");
    }

    const h = () => {
      const newWidth = window.innerWidth;
      const oldWidth = lastWidth.current;

      if (newWidth <= 768 && oldWidth > 768) {
        setMode("view");
      } else if (newWidth > 768 && oldWidth <= 768) {
        setMode("split");
      }
      lastWidth.current = newWidth;
    };
    window.addEventListener("resize", h);
    return () => {
      window.removeEventListener("resize", h);
    };
  }, []);
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="sm:grid sm:grid-cols-3 flex flex-cols gap-4 bg-zinc-900 p-4">
        <div className="flex gap-4 items-center flex-1 md:flex-none">
          <Link to="/">
            <FiArrowLeft />
          </Link>
          <NoteTitle defaultTitle={note?.title ?? ""} />
        </div>
        <div className="justify-self-center">
          <div className="flex gap-2 bg-zinc-950 p-1 rounded-md">
            <button
              className={"p-2 rounded-md " + getColor("edit")}
              onClick={() => setMode("edit")}
            >
              <FiEdit />
            </button>
            <button
              className={"hidden md:block p-2 rounded-md " + getColor("split")}
              onClick={() => setMode("split")}
            >
              <FiColumns />
            </button>
            <button
              className={"p-2 rounded-md " + getColor("view")}
              onClick={() => setMode("view")}
            >
              <FiEye />
            </button>
          </div>
        </div>
        <div className="justify-self-end">
          {clerk.user && <Profile user={clerk.user} />}
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        {mode !== "view" && text !== undefined && clerk.loaded && (
          <div className="flex-1 min-w-0 min-h-full">
            <Monaco
              defaultText={text}
              setText={setText}
              getToken={getToken}
              submit={submit}
            />
          </div>
        )}
        {mode !== "edit" && (
          <div className="flex-1 markdown overflow-y-auto bg-zinc-900">
            <div className="p-4">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img(props) {
                    const { src, alt } = props;
                    if (
                      src &&
                      !src.startsWith("http") &&
                      !src.startsWith("data:")
                    ) {
                      return <SecureImage name={src} alt={alt} />;
                    }

                    return <img {...props} />;
                  },
                  code(props) {
                    //eslint-disable-next-line
                    const { children, className, ref, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter
                        {...rest}
                        PreTag="div"
                        showLineNumbers={true}
                        language={match[1]}
                        children={String(children).replace(/\n$/, "")}
                        style={syntaxTheme}
                      />
                    ) : (
                      <code {...rest} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {text}
              </Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type NoteTitleProps = {
  defaultTitle: string;
};

function NoteTitle({ defaultTitle }: NoteTitleProps) {
  const submit = useSubmit();
  const [title, setTitle] = useState(defaultTitle);
  const { getToken } = useAuth();
  const debouncedTitle = useDebounce(title, 300);
  const onTitleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target?.value);
  };
  useEffect(() => {
    (async () => {
      if (defaultTitle !== debouncedTitle) {
        const token = await getToken();
        if (token) {
          submit(
            { title: debouncedTitle },
            { method: "POST", encType: "application/json" },
          );
        }
      }
    })();
  }, [debouncedTitle, getToken, defaultTitle, submit]);
  return (
    <input
      value={title}
      onChange={onTitleInput}
      className="bg-transparent px-4 py-2 rounded-md border-2 border-transparent hover:border-zinc-700 focus:border-zinc-950 focus:outline-none focus:bg-zinc-900 w-full"
    />
  );
}
