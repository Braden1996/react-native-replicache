declare global {
  type RequestInput = string;
  type RequestInit = Record<string, any>;

  interface Body {
    readonly bodyUsed: boolean;
    json(): Promise<any>;
  }

  interface Response extends Object, Body {
    readonly headers: Record<string, string>;
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly url: string;
    readonly redirected: boolean;
    clone(): Response;
  }

  // The implementation of fetch is determined by the consuming client, e.g. DOM browser or React Native.
  export function fetch(
    input: RequestInput,
    init?: RequestInit
  ): Promise<Response>;
}
export {};
