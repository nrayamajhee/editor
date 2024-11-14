import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { QueryErr, useFile, useQuery } from "../main";
import { Picture } from "schema";
import { BiSolidCloudUpload } from "react-icons/bi";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function Component() {
  const picQuery = useQuery<Picture[]>("pictures", "/pictures");
  const upload = useFile("upload_picture", "/pictures");
  const qc = useQueryClient();
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size bigger than 2M");
    } else {
      upload.mutate(file, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["pictures"] });
        },
        onError: (err) => {
          let error = (err as QueryErr).error;
          toast.error(error);
        },
      });
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  if (picQuery.isLoading) {
    return <>Loading</>;
  }
  if (picQuery.isError || !picQuery.data) {
    return <>Error</>;
  }
  return (
    <div
      {...getRootProps()}
      className="p-8 flex flex-col border-t-sky-400/10 border-t-2 rounded-3xl hover:border-t-sky-400/20 transition-colors duration-700 gap-8 relative flex-1"
    >
      <input {...getInputProps()} />
      <div
        className={
          "absolute bg-white/10 backdrop-blur-md w-full h-full top-0 left-0 rounded-3xl grid place-items-center " +
          (isDragActive ? "block" : "hidden")
        }
      >
        <BiSolidCloudUpload size={128} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 items-stretch">
        {picQuery.data.map((pic) => (
          <img
            key={pic.name}
            className="aspect-square object-cover min-h-full"
            src={`${import.meta.env.VITE_API_URL}/assets/${pic.name}`}
          />
        ))}
      </div>
    </div>
  );
}
