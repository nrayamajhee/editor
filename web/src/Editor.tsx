import MonacoEditor, { Monaco as M } from "@monaco-editor/react";
import { Document } from "schema";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiArrowLeft, FiColumns, FiEdit, FiEye } from "react-icons/fi";
import { useEffect, useLayoutEffect, useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "./main";
import { useDebounce } from "@uidotdev/usehooks";
import { useQueryClient } from "@tanstack/react-query";
import Profile from "./components/Profile";

type Mode = "edit" | "view" | "split";

type MonacoProps = {
  defaultText: string;
  setText: (newText: string) => void;
};

function Monaco({ defaultText, setText }: MonacoProps) {
  let { id } = useParams();
  const qc = useQueryClient();
  const updateDoc = useMutation("update_document", `/document/${id}`);
  const [text, setTextInternal] = useState(defaultText);
  const handleUpdate = (value?: string) => {
    if (value) {
      setTextInternal(value);
    }
  };
  const debouncedText = useDebounce(text, 300);
  useLayoutEffect(() => {
    if (debouncedText) {
      setText(debouncedText);
      updateDoc.mutate(
        {
          content: debouncedText,
        },
        {
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["document", id] });
          },
        },
      );
    }
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
  const updateTitle = useMutation("update_title", `/document/${id}`);
  const debouncedTitle = useDebounce(title, 300);
  const onTitleInput = (e: any) => {
    setTitle(e.target.value);
  };
  useEffect(() => {
    updateTitle.mutate({
      title: title,
    });
  }, [debouncedTitle]);
  return (
    <input
      value={title}
      onChange={onTitleInput}
      className="bg-transparent px-4 py-2 rounded-md border-2 border-transparent hover:border-zinc-700 focus:border-zinc-950 focus:outline-none focus:bg-zinc-900"
    />
  );
}

function Editor() {
  let { id } = useParams();
  const clerk = useClerk();
  const docQuery = useQuery<Document>(
    ["document", id ?? ""],
    `/document/${id}`,
  );
  const [text, setText] = useState<string | null>(null);
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
  if (docQuery.isLoading) {
    return <>Loading</>;
  }
  if (docQuery.isError || !docQuery.data) {
    return <>Error</>;
  }
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="grid grid-cols-3 bg-zinc-800 p-4">
        <div className="flex gap-4 items-center">
          <Link to="/">
            <FiArrowLeft />
          </Link>
          <DocTitle defaulTitle={docQuery.data.title} />
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
          <Profile />
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        {mode !== "view" && clerk.loaded && (
          <div className="flex-1 min-w-0 min-h-full">
            <Monaco defaultText={docQuery.data.content} setText={setText} />
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

export default Editor;
