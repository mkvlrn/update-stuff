import { $ } from "bun";

const { HOME } = process.env;
if (!HOME) {
  throw new Error("HOME environment variable is not set");
}

const installDirectory = `${HOME}/.local/share/homemade/update-stuff`;
const binDirectory = `${HOME}/.local/bin`;

// clean
await $`rm -rf ${installDirectory}`.quiet();
await $`rm -f ${binDirectory}/update-stuff`.quiet();

// copy
await $`mkdir -p ${installDirectory}`.quiet();
await $`cp ./bin/update-stuff.bun ${installDirectory}/update-stuff.bun`.quiet();

// script
await $`echo 'bun run ${installDirectory}/update-stuff.bun' > ${installDirectory}/update-stuff.sh`.quiet();

// make executable
await $`chmod +x ${installDirectory}/update-stuff.sh`.quiet();

// link
await $`ln -s ${installDirectory}/update-stuff.sh ${binDirectory}/update-stuff`.quiet();
