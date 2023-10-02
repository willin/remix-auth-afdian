import { createCookieSessionStorage } from "@remix-run/node";
import { AuthenticateOptions } from "remix-auth";
import { AfdianStrategy } from "../src";

const BASE_OPTIONS: AuthenticateOptions = {
  name: "form",
  sessionKey: "user",
  sessionErrorKey: "error",
  sessionStrategyKey: "strategy",
};

describe(AfdianStrategy, () => {
  let verify = jest.fn();
  let sessionStorage = createCookieSessionStorage({
    cookie: { secrets: ["s3cr3t"] },
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should allow changing the scope", async () => {
    let strategy = new AfdianStrategy(
      {
        clientID: "CLIENT_ID",
        clientSecret: "CLIENT_SECRET",
        callbackURL: "https://example.app/callback",
        scope: "custom",
      },
      verify
    );

    let request = new Request("https://example.app/auth/afdian");

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS);
    } catch (error) {
      if (!(error instanceof Response)) throw error;
      let location = error.headers.get("Location");

      if (!location) throw new Error("No redirect header");

      let redirectUrl = new URL(location);

      expect(redirectUrl.searchParams.get("scope")).toBe("custom");
    }
  });

  test("should allow typed scope array", async () => {
    let strategy = new AfdianStrategy(
      {
        clientID: "CLIENT_ID",
        clientSecret: "CLIENT_SECRET",
        callbackURL: "https://example.app/callback",
        scope: ["read:user"],
      },
      verify
    );

    let request = new Request("https://example.app/auth/afdian");

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS);
    } catch (error) {
      if (!(error instanceof Response)) throw error;
      let location = error.headers.get("Location");

      if (!location) throw new Error("No redirect header");

      let redirectUrl = new URL(location);

      expect(redirectUrl.searchParams.get("scope")).toBe("read:user");
    }
  });

  test("should have the scope `basic` as default", async () => {
    let strategy = new AfdianStrategy(
      {
        clientID: "CLIENT_ID",
        clientSecret: "CLIENT_SECRET",
        callbackURL: "https://example.app/callback",
      },
      verify
    );

    let request = new Request("https://example.app/auth/afdian");

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS);
    } catch (error) {
      if (!(error instanceof Response)) throw error;
      let location = error.headers.get("Location");

      if (!location) throw new Error("No redirect header");

      let redirectUrl = new URL(location);

      expect(redirectUrl.searchParams.get("scope")).toBe("basic");
    }
  });

  test("should correctly format the authorization URL", async () => {
    let strategy = new AfdianStrategy(
      {
        clientID: "CLIENT_ID",
        clientSecret: "CLIENT_SECRET",
        callbackURL: "https://example.app/callback",
      },
      verify
    );

    let request = new Request("https://example.app/auth/afdian");

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS);
    } catch (error) {
      if (!(error instanceof Response)) throw error;

      let location = error.headers.get("Location");

      if (!location) throw new Error("No redirect header");

      let redirectUrl = new URL(location);

      expect(redirectUrl.hostname).toBe("afdian.net");
      expect(redirectUrl.pathname).toBe("/oauth2/authorize");
    }
  });
});
