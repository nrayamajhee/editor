import { getAuth } from "@clerk/react-router/server";
import { BiSolidCloudUpload } from "react-icons/bi";
import { get, postForm } from "~/utils/query";
import { useRef } from "react";
import type { Photo } from "~/schema";
import Spinner from "~/ui/Spinner";
import { FiCamera } from "react-icons/fi";
import { Form, useLoaderData } from "react-router";
import type { Route } from "./+types/photos";

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
    const file = formData.get("photo") as File;
    if (file.size > 1024 * 1024 * 5) {
      throw new Error("File size must be less than 5MB");
    }
    await postForm("/photos", token, formData);
  }
}

export default function Photos() {
  const { photos } = useLoaderData<typeof loader>();
  const formRef = useRef<HTMLFormElement>(null);
  const isCreating = false;
  return (
    <div className="flex flex-col gap-8 relative min-h-[512px]">
      <div className="hidden absolute bg-white/10 backdrop-blur-md w-full h-full top-0 left-0 rounded-3xl grid place-items-center ">
        <BiSolidCloudUpload size={128} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 items-stretch">
        {photos.map((photo: Photo) => (
          <img
            key={photo.name}
            className="aspect-square object-cover min-h-full"
            src={`${import.meta.env.VITE_R2_URL}/${photo.name}`}
          />
        ))}
        <Form method="post" encType="multipart/form-data" ref={formRef}>
          <input
            onChange={() => formRef.current?.submit()}
            type="file"
            id="picUpload"
            name="photo"
            hidden
          />
          <label
            htmlFor="picUpload"
            className="aspect-square min-h-full bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors outline-none flex items-center justify-center gap-2 p-4 cursor-pointer"
          >
            {isCreating ? (
              <Spinner />
            ) : (
              <>
                <FiCamera />
                <span>Upload</span>
              </>
            )}
          </label>
        </Form>
      </div>
    </div>
  );
}
