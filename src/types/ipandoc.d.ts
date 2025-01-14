// src/types/ipandoc.d.ts
declare module "../public/docgen/ipandoc.js" {
    export function pandoc(args_str: string, in_str: string): Promise<string>;
  }
  