import Editor from "@monaco-editor/react";
// @ts-ignore Import module
import { LaTeXJSComponent } from "https://cdn.jsdelivr.net/npm/latex.js/dist/latex.mjs";
import { DOMAttributes, useEffect, useState } from "react";

customElements.define("latex-js", LaTeXJSComponent);
type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any }>;
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["latex-js"]: CustomElement<LaTeXJSComponent>;
    }
  }
}

function App() {
  const [text, setText] = useState("");
  useEffect(() => {
    fetch("sample.tex")
      .then((r) => r.text())
      .then((j) => setText(j));
  }, []);

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
      <latex-js baseURL="https://cdn.jsdelivr.net/npm/latex.js/dist/">
        {text}
      </latex-js>
    </div>
  );
}

export default App;
