import "katex/dist/katex.min.css";
import Editor from "@monaco-editor/react";
import TeX from "@matejmazur/react-katex";
import { useState } from "react";

function App() {
  const [text, setText] = useState("\\TeX\nE=mc^2");

  const handleUpdate = (value?: string) => {
    if (value) {
      setText(value);
    }
  };
  return (
    <div className="grid grid-cols-2 min-h-screen">
      <Editor
        height="100vh"
        defaultLanguage="latex"
        defaultValue={text}
        onChange={handleUpdate}
      />
      <div className="flex flex-col">
        {text.split("\n").map((t) => (
          <TeX settings={{ output: "html" }}>{t}</TeX>
        ))}
      </div>
    </div>
  );
}

export default App;
