declare module 'subquest' {
    export function getSubDomains(
      options: { host: string; rateLimit: string; dnsServer: string; dictionary: string},
      callback: (err: any, results: string[]) => void
    ): void;
}