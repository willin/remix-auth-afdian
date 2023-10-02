import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth.server";

export async function loader() {
  return redirect("/");
}

export async function action(args: ActionFunctionArgs) {
  try {
    const authenticator = getAuthenticator(args);
    return await authenticator.authenticate("afdian", request, {
      successRedirect: "/dashboard",
      throwOnError: true,
    });
  } catch (error) {
    console.trace(error);
  }
  return redirect("/");
}
