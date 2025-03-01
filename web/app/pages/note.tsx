import MonacoEditor, { type Monaco as M } from "@monaco-editor/react";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { getAuth } from "@clerk/react-router/ssr.server";
import type { Route } from "./+types/note";
import { Link, redirect, useSubmit } from "react-router";
import { del, get, post } from "~/utils/query";
import { useAuth, useClerk } from "@clerk/react-router";
import { useEffect, useState, type ChangeEvent } from "react";
import { FiArrowLeft, FiColumns, FiEdit, FiEye } from "react-icons/fi";
import Profile from "~/components/Profile";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus as darkTheme } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useDebounce } from "@uidotdev/usehooks";

export const docStyle =
  "bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors rounded-2xl outline-none";

type Mode = "edit" | "view" | "split";

type MonacoProps = {
  defaultText: string;
  setText: (newText: string) => void;
};

function Monaco({ defaultText, setText }: MonacoProps) {
  const submit = useSubmit();
  const { getToken } = useAuth();
  const [text, setTextInternal] = useState(defaultText);
  const handleUpdate = (value?: string) => {
    if (value) {
      setTextInternal(value);
    }
  };
  const debouncedText = useDebounce(text, 200);
  useEffect(() => {
    (async () => {
      if (debouncedText != defaultText) {
        setText(debouncedText);
        const token = await getToken();
        if (token) {
          submit(
            {
              content: debouncedText,
            },
            { method: "POST", encType: "application/json" },
          );
        }
      }
    })();
  }, [debouncedText, setText, getToken, defaultText, submit]);
  function handleOnMount(_editor: object, monaco: M) {
    monaco.editor.addKeybindingRule({
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF,
      command: null,
    });
    monaco.editor.addKeybindingRule({
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH,
      command: null,
    });
  }
  return (
    <MonacoEditor
      defaultLanguage="markdown"
      defaultValue={text}
      theme="vs-dark"
      options={{
        minimap: {
          enabled: false,
        },
      }}
      onChange={handleUpdate}
      onMount={handleOnMount}
    />
  );
}

export async function loader(args: Route.LoaderArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  if (!token) {
    return redirect("/login");
  }
  const note = await get(`/note/${args.params.id}`, token);
  return { note };
}

export async function action(args: Route.ActionArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  if (args.request.method === "DELETE" && token) {
    await del(`/note/${args.params.id}`, token);
    return redirect("/notes");
  }
  if (args.request.method === "POST" && token) {
    const body = await args.request.json();
    return await post(`/note/${args.params.id}`, token, body);
  }
}

export default function Note({ loaderData }: Route.ComponentProps) {
  const clerk = useClerk();
  const { note } = loaderData;
  const [text, setText] = useState<string | undefined>(note.content || "");
  const [mode, setMode] = useState<Mode>("split");
  const getColor = (buttonMode: Mode) =>
    buttonMode === mode ? "bg-zinc-700" : "";
  useEffect(() => {
    const h = () => {
      if (window.innerWidth <= 768) {
        setMode("view");
      } else {
        setMode("split");
      }
    };
    h();
    window.addEventListener("resize", h);
    return () => {
      window.removeEventListener("resize", h);
    };
  }, []);
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="sm:grid sm:grid-cols-3 flex flex-cols gap-4 bg-zinc-800 p-4">
        <div className="flex gap-4 items-center flex-1 md:flex-none">
          <Link to="/">
            <FiArrowLeft />
          </Link>
          <NoteTitle defaultTitle={note?.title ?? ""} />
        </div>
        <div className="justify-self-center">
          <div className="flex gap-2 bg-zinc-900 p-1 rounded-md">
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
            <Monaco defaultText={text} setText={setText} />
          </div>
        )}
        {mode !== "edit" && (
          <div className="flex-1 markdown overflow-y-auto">
            <div className="p-4">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
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
                        style={darkTheme}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
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
