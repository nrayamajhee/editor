import Editor, { Monaco } from "@monaco-editor/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { markdown } from "./content";
import { FiColumns, FiEdit, FiEye, FiUser } from "react-icons/fi";
import { IconContext } from "react-icons";

type Mode = "edit" | "view" | "split";

function App() {
  const [text, setText] = useState(markdown);
  const [mode, setMode] = useState<Mode>("split");
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
    <IconContext.Provider value={{ className: "text-zinc-100 text-xl" }}>
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex items-center justify-between bg-zinc-800 p-4">
          <div className="flex gap-4 items-center">
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
          <div>
            <FiUser />
          </div>
        </div>
        <div className="flex min-h-0">
          {mode !== "view" && (
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
    </IconContext.Provider>
  );
}

export default App;
