# AfdianStrategy 

The Afdian strategy is used to authenticate users against a Afdian account. It extends the OAuth2Strategy.

## Supported runtimes

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | ✅          |

## Usage

### Create an OAuth application

Follow the steps on [the Afdian（爱发电） documentation](https://afdian.net/p/010ff078177211eca44f52540025c377) to create a new application and get a client ID and secret.

### Create the strategy instance

```ts
import { AfdianStrategy } from "remix-auth-afdian";

let afdianStrategy = new AfdianStrategy(
  {
    clientID: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    callbackURL: "https://example.com/auth/afdian/callback",
  },
  async ({ accessToken, extraParams, profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    return User.findOrCreate({ email: profile.emails[0].value });
  }
);

authenticator.use(afdianStrategy);
```

### Setup your routes

```tsx
// app/routes/login.tsx
export default function Login() {
  return (
    <Form action="/auth/afdian" method="post">
      <button>Login with Afdian(爱发电 )</button>
    </Form>
  );
}
```

```tsx
// app/routes/auth.afdian.tsx
import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export async function loader() {
  return redirect("/login");
}

export async function action({ request }: ActionArgs) {
  return authenticator.authenticate("afdian", request);
};
```

```tsx
// app/routes/auth.afdian.callback.tsx
import type { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export async function loader({ request }: LoaderArgs) {
  return authenticator.authenticate("afdian", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
```
