// Minimal ambient typings: @types/node is not an allowed dependency.
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function statSync(path: string): { size: number; isFile(): boolean };
}
declare const process: {
  argv: string[];
  exit(code?: number): never;
  stdout: { write(text: string): boolean };
  stderr: { write(text: string): boolean };
  exitCode?: number;
};
