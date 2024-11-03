import MonacoEditor, { Monaco as M } from "@monaco-editor/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiArrowLeft, FiColumns, FiEdit, FiEye, FiUser } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useClerk,
  useUser,
} from "@clerk/clerk-react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "./main";
import { useDebounce } from "@uidotdev/usehooks";
import { PartialDocument } from "schema";

type Mode = "edit" | "view" | "split";

type MonacoProps = {
  defaultText: string;
  setText: (newText: string) => void;
};

function Monaco({ defaultText, setText }: MonacoProps) {
  let { slug } = useParams();
  const updateDoc = useMutation<PartialDocument>(
    "update_document",
    `/document/${slug}`,
  );
  const [text, setTextInternal] = useState(defaultText);
  const handleUpdate = (value?: string) => {
    if (value) {
      setTextInternal(value);
    }
  };
  const debouncedText = useDebounce(text, 300);
  useEffect(() => {
    if (debouncedText) {
      setText(debouncedText);
      updateDoc.mutate({
        content: debouncedText,
      });
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

function Editor() {
  let { slug } = useParams();
  const clerk = useClerk();
  const { user } = useUser();
  const docQuery = useQuery("update_documents", `/document/${slug}`);
  const [text, setText] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("split");
  const getColor = (buttonMode: Mode) =>
    buttonMode === mode ? "bg-zinc-700" : "";
  if (docQuery.isLoading) {
    return <>Loading</>;
  }
  if (docQuery.isError || !docQuery.data) {
    return <>Error</>;
  }
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between bg-zinc-800 p-4">
        <div className="flex gap-4 items-center">
          <Link to="/">
            <FiArrowLeft />
          </Link>
          <h1 className="text-xl">Markdown Editor</h1>
          <div className="flex gap-2 bg-zinc-900 p-1 rounded-md">
            <button
              className={"p-2 rounded-md " + getColor("edit")}
              onClick={() => setMode("edit")}
            >
              <FiEdit />
            </button>
            <button
              className={"p-2 rounded-md " + getColor("split")}
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
        <div className="flex">
          <SignedOut>
            <SignInButton mode="modal">
              <FiUser className="cursor-pointer" />
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Popover className="relative">
              <PopoverButton className="outline-none border-2 border-transparent active:border-zinc-800 rounded-full overflow-hidden flex items-center">
                {user?.hasImage ? (
                  <img
                    alt="profile-picture"
                    src={user?.imageUrl}
                    className="w-8 h-8 block"
                  />
                ) : (
                  <FiUser />
                )}
              </PopoverButton>
              <PopoverPanel
                anchor={{
                  to: "bottom",
                  gap: "10px",
                  padding: "12px",
                }}
                className="flex flex-col items-stretch bg-zinc-700 rounded-md p-2 gap-2 min-w-32"
              >
                <p className="px-2 py-1">{user?.firstName}</p>
                <SignOutButton>
                  <p className="px-2 py-1 rounded-md hover:bg-zinc-800 cursor-pointer">
                    Sign out
                  </p>
                </SignOutButton>
              </PopoverPanel>
            </Popover>
          </SignedIn>
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
