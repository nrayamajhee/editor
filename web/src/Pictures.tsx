import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useFile } from "./main";

export default function Pictures() {
  const upload = useFile("upload_file", "/upload");
  // const endpoint = "http://localhost:7000/api/uploadthing";
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    upload.mutate(file);
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <div>
      <h1>Pictures</h1>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
    </div>
  );
}
