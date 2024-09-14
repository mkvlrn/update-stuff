import fs from "node:fs/promises";
import path from "node:path";
import { AppCheck } from "~/interfaces/app-check.ts";
import { directories } from "~/util/constants.ts";

export class OhMyPoshCheck extends AppCheck {
  constructor() {
    super("oh-my-posh");
  }

  protected async checkInstalledVersion(): Promise<string> {
    const version = await this.checkCommand("oh-my-posh", ["--version"]);

    return version ? `v${version.trim()}` : "not installed";
  }

  protected async checkLatestVersion(): Promise<string> {
    const version = await this.checkGithubTags("JanDeDobbeleer/oh-my-posh");

    return version;
  }

  protected async download(version: string): Promise<void> {
    const url = `https://github.com/JanDeDobbeleer/oh-my-posh/releases/download/${version}/posh-linux-amd64`;
    const response = await fetch(url);
    const filePath = path.join(directories.BIN_DIR, "oh-my-posh");

    if (response.ok) {
      await fs.writeFile(filePath, new Uint8Array(await response.arrayBuffer()));
      await fs.chmod(filePath, 0o755);
    } else {
      throw new Error(`Failed to download oh-my-posh ${version}`);
    }
  }
}
