import { getAuthenticator } from "~/auth.server";

export async function loader(args) {
  const authenticator = getAuthenticator(args);

  return authenticator.authenticate("afdian", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
}
