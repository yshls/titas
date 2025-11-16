declare module 'jsdiff' {
  export interface Change {
    value: string;
    added?: boolean;
    removed?: boolean;
    count?: number;
  }

  export interface WordsOptions {
    ignoreCase?: boolean;
  }

  export function diffWords(
    oldStr: string,
    newStr: string,
    options?: WordsOptions
  ): Change[];
}
