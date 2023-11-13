import { type LoaderFunction, type ActionFunction, redirect } from '@remix-run/cloudflare';
import { getAuthenticator } from '~/auth.server';

export const loader: LoaderFunction = () => {
  return redirect('/');
};

export const action: ActionFunction = async (args) => {
  const { request } = args;
  const authenticator = getAuthenticator(args);
  const referer = request.headers.get('referer');
  const returnPath = referer ? new URL(referer).pathname : '/';
  return await authenticator.logout(request, {
    redirectTo: returnPath
  });
};
