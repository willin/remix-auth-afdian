import { createCookieSessionStorage, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { Authenticator } from 'remix-auth';
import { AfdianStrategy } from "remix-auth-afdian/build/index";


export function getAuthenticator({ context, request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  url.pathname = '/auth/afdian/callback';
  const sessionStorage = createCookieSessionStorage({
    cookie: {
      name: 'sid',
      httpOnly: true,
      secure: context.CF_PAGES === 'production',
      sameSite: 'lax',
      path: '/',
      secrets: ['s3cr3t']
    }
  });


  const authenticator = new Authenticator(
    sessionStorage,
    {
      throwOnError: true
    }
  );

  const afdianStrategy = new AfdianStrategy(
    {
      clientID: context.AFDIAN_CLIENT_ID,
      clientSecret: context.AFDIAN_CLIENT_SECRET,
      callbackURL: url.toString(),
    },
    async ({ accessToken, extraParams, profile }) => {
      console.log(profile);
      return profile;
    }
  );
  authenticator.use(afdianStrategy);
  return authenticator;
}
