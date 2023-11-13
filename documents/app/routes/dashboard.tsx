import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData } from '@remix-run/react';
import { getAuthenticator } from '~/auth.server';

export async function loader(args) {
  const authenticator = getAuthenticator(args);

  const user = await authenticator.isAuthenticated(args.request);
  if (!user) {
    throw redirect('/');
  }

  return json(user);
}

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>已登录 Logged in</h1>
      <p>
        <Form action='/api/logout' method='POST'>
          <button>Logout</button>
        </Form>
      </p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
