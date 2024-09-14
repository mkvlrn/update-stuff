import path from "node:path";

const { HOME } = process.env;

if (!HOME) {
  throw new Error("HOME environment variable is not set");
}

export const directories = {
  BIN_DIR: path.join(HOME, ".local", "bin"),
  INSTALL_DIR: path.join(HOME, ".local", "share"),
  TEMP_DIR: "/tmp",
};
