import { runCli } from "./run";

const out = runCli(process.argv.slice(2));
process.stdout.write(out.stdout);
process.stderr.write(out.stderr);
process.exitCode = out.code;
