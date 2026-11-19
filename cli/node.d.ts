// Minimal ambient typings: @types/node is not an allowed dependency.
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function statSync(path: string): { size: number; isFile(): boolean; isDirectory(): boolean };
  export function realpathSync(path: string): string;
  export function readdirSync(path: string): string[];
  export function mkdtempSync(prefix: string): string;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): string | undefined;
  export function symlinkSync(target: string, path: string, type?: string): void;
  export function writeFileSync(path: string, data: string): void;
  export function rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void;
}
declare module "node:os" {
  export function tmpdir(): string;
}
declare module "node:path" {
  export function join(...parts: string[]): string;
  export function relative(from: string, to: string): string;
}
declare const process: {
  argv: string[];
  cwd(): string;
  exit(code?: number): never;
  stdout: { write(text: string): boolean };
  stderr: { write(text: string): boolean };
  exitCode?: number;
};
