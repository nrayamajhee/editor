import Editor, { Monaco } from "@monaco-editor/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { markdown } from "./content";

function App() {
  const [text, setText] = useState(markdown);
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
  return (
    <div className="grid grid-cols-2 min-h-screen">
      <Editor
        height="100vh"
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
      <div className="flex flex-col">
        <Markdown remarkPlugins={[remarkGfm]} className="markdown">
          {text}
        </Markdown>
      </div>
    </div>
  );
}

export default App;
