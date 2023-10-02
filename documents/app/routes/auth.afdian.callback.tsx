import { getAuthenticator } from "~/auth.server";

export async function loader(args) {
  const authenticator = getAuthenticator(args);

  return authenticator.authenticate("afdian", args.request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
}
