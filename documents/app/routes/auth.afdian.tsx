import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth.server";

export async function loader() {
  return redirect("/");
}

export async function action(args: ActionFunctionArgs) {
  const authenticator = getAuthenticator(args);
  return await authenticator.authenticate("afdian", args.request, {
    successRedirect: "/dashboard",
  });

}
