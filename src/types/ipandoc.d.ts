// src/types/ipandoc.d.ts
declare module "../public/ipandoc.js" {
    export function pandoc(args_str: string, in_str: string): Promise<string>;
  }
  