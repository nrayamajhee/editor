import MonacoEditor, { Monaco as M } from "@monaco-editor/react";
import { type Document } from "schema";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiArrowLeft, FiColumns, FiEdit, FiEye } from "react-icons/fi";
import { useEffect, useLayoutEffect, useState } from "react";
import { Link, redirect, useLoaderData, useParams } from "@remix-run/react";
import { useDebounce } from "@uidotdev/usehooks";
import Profile from "../components/Profile";
import { del, get, post } from "~/utils/query";
import { createClerkClient } from "@clerk/remix/api.server";
import { getAuth } from "@clerk/remix/ssr.server";
import { useAuth } from "@clerk/remix";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

type Mode = "edit" | "view" | "split";

type MonacoProps = {
  defaultText: string;
  setText: (newText: string) => void;
};

function Monaco({ defaultText, setText }: MonacoProps) {
  let { id } = useParams();
  const { getToken } = useAuth();
  const [text, setTextInternal] = useState(defaultText);
  const handleUpdate = (value?: string) => {
    if (value) {
      setTextInternal(value);
    }
  };
  const debouncedText = useDebounce(text, 200);
  useLayoutEffect(() => {
    (async () => {
      if (debouncedText) {
        setText(debouncedText);
        const token = await getToken();
        if (token) {
          post(`/document/${id}`, token, {
            content: debouncedText,
          });
        }
      }
    })();
  }, [debouncedText]);
  function handleOnMount(_editor: any, monaco: M) {
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

type DocTitleProps = {
  defaulTitle: string;
};

function DocTitle({ defaulTitle }: DocTitleProps) {
  const [title, setTitle] = useState(defaulTitle);
  let { id } = useParams();
  const { getToken } = useAuth();
  const debouncedTitle = useDebounce(title, 300);
  const onTitleInput = (e: any) => {
    setTitle(e.target.value);
  };
  useEffect(() => {
    (async () => {
      if (defaulTitle !== debouncedTitle) {
        const token = await getToken();
        if (token) {
          await post(`/document/${id}`, token, {
            title: debouncedTitle,
          });
        }
      }
    })();
  }, [debouncedTitle]);
  return (
    <input
      value={title}
      onChange={onTitleInput}
      className="bg-transparent px-4 py-2 rounded-md border-2 border-transparent hover:border-zinc-700 focus:border-zinc-950 focus:outline-none focus:bg-zinc-900"
    />
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const { userId, getToken } = await getAuth(args);
  const token = await getToken();
  if (!(token && userId)) {
    return redirect("/login");
  }
  const user = await createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  }).users.getUser(userId);

  const document = await get(`/document/${args.params.id}`, token);

  return { user, document };
}

export async function action(args: ActionFunctionArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  if (args.request.method === "DELETE" && token) {
    await del(`/document/${args.params.id}`, token);
    return redirect("/dashboard");
  }
}

export default function Document() {
  const { document, user } = useLoaderData<typeof loader>();
  const [text, setText] = useState<string | undefined>(document.content);
  const [mode, setMode] = useState<Mode>("split");
  const getColor = (buttonMode: Mode) =>
    buttonMode === mode ? "bg-zinc-700" : "";
  useEffect(() => {
    let h = () => {
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
      <header className="grid grid-cols-3 bg-zinc-800 p-4">
        <div className="flex gap-4 items-center">
          <Link to="/dashboard">
            <FiArrowLeft />
          </Link>
          <DocTitle defaulTitle={document.title} />
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
          <Profile user={user} />
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        {mode !== "view" && text !== undefined && (
          <div className="flex-1 min-w-0 min-h-full">
            <Monaco defaultText={document.content} setText={setText} />
          </div>
        )}
        {mode !== "edit" && (
          <div className="flex-1 markdown overflow-y-auto">
            <div className="p-4">
              <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
