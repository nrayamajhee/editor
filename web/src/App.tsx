import Editor, { Monaco } from "@monaco-editor/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiArrowLeft, FiColumns, FiEdit, FiEye, FiUser } from "react-icons/fi";
import { useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { markdown } from "./content";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useClerk,
  useUser,
} from "@clerk/clerk-react";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { OurFileRouter } from "~/app/api/uploadthing/core";

type Mode = "edit" | "view" | "split";

function App() {
  const clerk = useClerk();
  const { user } = useUser();
  const [text, setText] = useState(markdown);
  const [mode, setMode] = useState<Mode>("split");
  // const UploadDropzone = generateUploadDropzone<OurFileRouter>();
  const handleUpdate = (value?: string) => {
    if (value) {
      setText(value);
    }
  };
  function handleOnMount(_editor: any, monaco: Monaco) {
    monaco.editor.addKeybindingRule({
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF,
      command: null,
    });
    monaco.editor.addKeybindingRule({
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH,
      command: null,
    });
  }
  const getColor = (buttonMode: Mode) =>
    buttonMode === mode ? "bg-zinc-700" : "";
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between bg-zinc-800 p-4">
        <div className="flex gap-4 items-center">
          <button>
            <FiArrowLeft />
          </button>
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
      <div className="flex min-h-0">
        {mode !== "view" && clerk.loaded && (
          <div className="flex-1 min-w-0">
            <Editor
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

export default App;
