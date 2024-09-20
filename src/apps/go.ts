import fs from "node:fs/promises";
import path from "node:path";
import { x } from "tar";
import { AppCheck } from "~/interfaces/app-check";
import { directories } from "~/util/constants";

export class GoCheck extends AppCheck {
  constructor() {
    super("go");
  }

  protected async checkInstalledVersion(): Promise<string> {
    const version = await this.checkCommand("go", ["version"]);

    return version ? version.trim().split(" ")[2] : "not installed";
  }

  protected async checkLatestVersion(): Promise<string> {
    const result = await fetch("https://go.dev/dl/?mode=json");

    if (result.ok) {
      const data = (await result.json()) as { version: string; stable: boolean }[];

      const stable = data.find(({ stable }) => stable);

      if (stable) {
        return stable.version;
      }
    }

    throw new Error(`Failed to check go version`);
  }

  protected async download(version: string): Promise<void> {
    const url = `https://golang.org/dl/${version}.linux-amd64.tar.gz`;
    const response = await fetch(url);
    const zipPath = path.join(directories.TEMP_DIR, "go.tar.gz");

    if (response.ok) {
      await fs.rm(path.join(directories.INSTALL_DIR, "go"), { force: true });

      await Bun.write(zipPath, new Uint8Array(await response.arrayBuffer()));
      await x({
        file: zipPath,
        cwd: directories.INSTALL_DIR,
      });

      await fs.symlink(
        path.join(directories.INSTALL_DIR, "go", "bin", "go"),
        path.join(directories.BIN_DIR, "go"),
        "file",
      );
      await fs.symlink(
        path.join(directories.INSTALL_DIR, "go", "bin", "gofmt"),
        path.join(directories.BIN_DIR, "gofmt"),
        "file",
      );

      await fs.rm(zipPath);
    } else {
      throw new Error(`Failed to download go ${version}`);
    }
  }
}
