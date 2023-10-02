import type { StrategyVerifyCallback } from "remix-auth";
import { AuthorizationError } from "remix-auth";
import {
  OAuth2Profile,
  OAuth2Strategy,
  OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";

export interface AfdianStrategyOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope?: AfdianScope[] | string;
  allowSignup?: boolean;
  userAgent?: string;
  authorizationURL?: string;
  tokenURL?: string;
  userInfoURL?: string;
  userEmailsURL?: string;
}

export type AfdianScope = "basic";

export type AfdianEmails = NonNullable<OAuth2Profile["emails"]>;
export type AfdianEmailsResponse = {
  email: string;
  verified: boolean;
  primary: boolean;
  visibility: string | null;
}[];

export interface AfdianProfile extends OAuth2Profile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
    middleName: string;
  };
  emails: AfdianEmails;
  photos: [{ value: string }];
  _json: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string;
    company: string;
    blog: string;
    location: string;
    email: string;
    hireable: boolean;
    bio: string;
    twitter_username: string;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
    private_gists: number;
    total_private_repos: number;
    owned_private_repos: number;
    disk_usage: number;
    collaborators: number;
    two_factor_authentication: boolean;
    plan: {
      name: string;
      space: number;
      private_repos: number;
      collaborators: number;
    };
  };
}

export interface AfdianExtraParams
  extends Record<string, string | number | null> {
  tokenType: string;
  accessTokenExpiresIn: number | null;
  refreshTokenExpiresIn: number | null;
}

export const AfdianStrategyDefaultName = "afdian";
export const AfdianStrategyDefaultScope: AfdianScope = "basic";
export const AfdianStrategyScopeSeperator = " ";

export class AfdianStrategy<User> extends OAuth2Strategy<
  User,
  AfdianProfile,
  AfdianExtraParams
> {
  name = AfdianStrategyDefaultName;

  private scope: AfdianScope[];
  private allowSignup: boolean;
  private userAgent: string;
  private userInfoURL: string;
  private userEmailsURL: string;

  constructor(
    {
      clientID,
      clientSecret,
      callbackURL,
      scope,
      allowSignup,
      userAgent,
      userInfoURL = "https://api.afdian.net/user",
      userEmailsURL = "https://api.afdian.net/user/emails",
      authorizationURL = "https://afdian.net/oauth2/authorize",
      tokenURL = "https://afdian.net/api/oauth2/access_token",
    }: AfdianStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<AfdianProfile, AfdianExtraParams>
    >
  ) {
    super(
      {
        clientID,
        clientSecret,
        callbackURL,
        authorizationURL,
        tokenURL,
      },
      verify
    );
    this.scope = this.getScope(scope);
    this.allowSignup = allowSignup ?? true;
    this.userAgent = userAgent ?? "Remix Auth";
    this.userInfoURL = userInfoURL;
    this.userEmailsURL = userEmailsURL;
  }

  //Allow users the option to pass a scope string, or typed array
  private getScope(scope: AfdianStrategyOptions["scope"]) {
    if (!scope) {
      return [AfdianStrategyDefaultScope];
    } else if (typeof scope === "string") {
      return scope.split(AfdianStrategyScopeSeperator) as AfdianScope[];
    }

    return scope;
  }

  protected authorizationParams() {
    return new URLSearchParams({
      scope: this.scope.join(AfdianStrategyScopeSeperator),
      allow_signup: String(this.allowSignup),
    });
  }

  protected async userEmails(accessToken: string): Promise<AfdianEmails> {
    let response = await fetch(this.userEmailsURL, {
      headers: {
        Accept: "application/json",
        Authorization: `token ${accessToken}`,
        "User-Agent": this.userAgent,
      },
    });

    let data: AfdianEmailsResponse = await response.json();

    let emails: AfdianEmails = data
      .filter(({ verified }) => verified) // Filter out unverified emails
      // Sort to keep the primary email first
      .sort((a, b) => {
        if (a.primary && !b.primary) return -1;
        if (!a.primary && b.primary) return 1;
        return 0;
      })
      .map(({ email }) => ({ value: email }));

    return emails;
  }

  protected async userProfile(accessToken: string): Promise<AfdianProfile> {
    let response = await fetch(this.userInfoURL, {
      headers: {
        Accept: "application/json",
        Authorization: `token ${accessToken}`,
        "User-Agent": this.userAgent,
      },
    });

    let data: AfdianProfile["_json"] = await response.json();

    let emails: AfdianProfile["emails"] = [{ value: data.email }];

    if (this.scope.includes(AfdianStrategyDefaultScope)) {
      emails = await this.userEmails(accessToken);
    }

    let profile: AfdianProfile = {
      provider: "afdian",
      displayName: data.login,
      id: data.id.toString(),
      name: {
        familyName: data.name,
        givenName: data.name,
        middleName: data.name,
      },
      emails: emails,
      photos: [{ value: data.avatar_url }],
      _json: data,
    };

    return profile;
  }

  protected async getAccessToken(response: Response): Promise<{
    accessToken: string;
    refreshToken: string;
    extraParams: AfdianExtraParams;
  }> {
    let data = new URLSearchParams(await response.text());

    let accessToken = data.get("access_token");
    if (!accessToken) throw new AuthorizationError("Missing access token.");

    let tokenType = data.get("token_type");
    if (!tokenType) throw new AuthorizationError("Missing token type.");

    let refreshToken = data.get("refresh_token") ?? "";
    let accessTokenExpiresIn = parseExpiresIn(data.get("expires_in"));
    let refreshTokenExpiresIn = parseExpiresIn(
      data.get("refresh_token_expires_in")
    );

    return {
      accessToken,
      refreshToken,
      extraParams: {
        tokenType,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
      },
    } as const;
  }
}

function parseExpiresIn(value: string | null): number | null {
  if (!value) return null;

  try {
    return Number.parseInt(value, 10);
  } catch {
    return null;
  }
}
