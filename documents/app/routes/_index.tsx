import type { MetaFunction } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Form action="/auth/afdian" method="POST">
        <button>Login with Afdian(爱发电 )</button>
      </Form>
    </div>
  );
}
