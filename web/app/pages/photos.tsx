import { useState, useEffect } from "react";
import { getAuth } from "@clerk/react-router/server";
import { BiSolidCloudUpload } from "react-icons/bi";
import { get, postForm } from "~/utils/query";
import {
  parseFormData,
} from "@remix-run/form-data-parser";
import type { Photo } from "~/schema";
import Spinner from "~/ui/Spinner";
import { FiCamera } from "react-icons/fi";
import { useFetcher, useLoaderData, useActionData } from "react-router";
import type { Route } from "./+types/photos";
import toast from "react-hot-toast";

export async function loader(args: Route.LoaderArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  const photos = await get("/photos", token ?? "");
  return { photos };
}

export async function action(args: Route.ActionArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  if (token && args.request.method === "POST") {
    const formData = await args.request.formData();
    console.log(formData);
    // const formData = await parseFormData(args.request, (fileUpload) => {
    //   console.log(fileUpload);return fileUpload ;
    // });
    const file = formData.get("photo") as File;
    if (file.size > 1024 * 1024 * 5) {
      return { message: "File size must be less than 5MB", type: "error" };
    }
    try {
      let result = await postForm("/photos", token, formData);
      return { type: "success", message: result };
    } catch (e) {
      return {
        type: "error",
        message: (e as Error)?.message ?? undefined,
      };
    }
  }
}

export default function Photos() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher?.data?.type === "error") {
      toast.error(fetcher?.data?.message);
    }
    setDragging(false);
    setUploading(false);
  }, [fetcher?.data]);
  const { photos } = useLoaderData<typeof loader>();
  const handleDrop = (files: FileList) => {
    if (files.length > 0) {
      setUploading(true);
      const formData = new FormData();
      formData.append("photo", files[0]);
      fetcher.submit(formData, {
        method: "post",
        encType: "multipart/form-data",
      });
      setDragging(false);
    }
  };
  return (
    <div
      className="flex flex-col gap-8 relative min-h-[512px] p-6 md:p-8 [& *]:pointer-events-none"
      onDragEnter={() => setDragging(true)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleDrop(e.dataTransfer.files);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setDragging(false);
      }}
    >
      <div
        className={`${dragging ? "grid" : "hidden"} absolute bg-white/10 backdrop-blur-md w-full h-full top-0 left-0 rounded-3xl place-items-center`}
      >
        {dragging && uploading ? (
          <Spinner />
        ) : (
          <BiSolidCloudUpload size={128} />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 items-stretch">
        {photos.map((photo: Photo) => (
          <img
            key={photo.name}
            className="aspect-square object-cover min-h-full"
            src={`${import.meta.env.VITE_R2_URL}/${photo.name}`}
          />
        ))}
        <fetcher.Form method="post" encType="multipart/form-data">
          <input
            onChange={(e) => {
              if (e.target.files?.length) {
                setUploading(true);
                const formData = new FormData();
                formData.append("photo", e.target.files[0]);
                fetcher.submit(formData, {
                  method: "post",
                  encType: "multipart/form-data",
                });
              }
            }}
            type="file"
            id="picUpload"
            hidden
          />
          <label
            htmlFor="picUpload"
            className="aspect-square min-h-full bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors outline-none flex items-center justify-center gap-2 p-4 cursor-pointer"
          >
            {!dragging && uploading ? (
              <Spinner />
            ) : (
              <>
                <FiCamera />
                <span>Upload</span>
              </>
            )}
          </label>
        </fetcher.Form>
      </div>
    </div>
  );
}
