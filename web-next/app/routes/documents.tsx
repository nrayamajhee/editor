import { getAuth } from "@clerk/remix/ssr.server";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
import { type Document as Doc } from "schema";
import { post } from "~/utils/query";

export async function action(args: ActionFunctionArgs) {
  const { getToken } = await getAuth(args);
  let token = await getToken();
  if (token) {
    if (args.request.method === "POST") {
      let doc = (await post<Partial<Doc>>("/documents", token, {
        title: "Untitled",
        content: "",
      })) as Doc;
      return redirect(`/document/${doc.id}`);
    } else {
      // const id = args.params.id;
      // const token = await getToken();
      // if (token) {
      //   del(`/document/${id}`, token);
      //   redirect("/");
      // }
    }
  }
}
