import { spawn } from "node:child_process";

const commands = [
  ["npm", ["run", "dev:api"]],
  ["npm", ["run", "dev"]],
];

const children = commands.map(([command, args]) =>
  spawn(command, args, {
    stdio: "inherit",
    shell: true,
  }),
);

let shuttingDown = false;

for (const child of children) {
  child.on("exit", (code) => {
    if (shuttingDown) return;
    shuttingDown = true;

    for (const other of children) {
      if (other.pid !== child.pid) other.kill();
    }

    process.exit(code ?? 0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  shuttingDown = true;
  for (const child of children) child.kill();
  process.exit(0);
}
