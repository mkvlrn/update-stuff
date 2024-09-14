import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import { AppCheck } from "~/interfaces/app-check";
import { directories } from "~/util/constants";

export class DenoCheck extends AppCheck {
  constructor() {
    super("deno");
  }

  protected async checkInstalledVersion(): Promise<string> {
    const version = await this.checkCommand("deno", ["--version"]);

    return version ? `v${version.split(" ")[1]}` : "not installed";
  }

  protected async checkLatestVersion(): Promise<string> {
    const version = await this.checkGithubTags("denoland/deno");

    return version;
  }

  protected async download(version: string): Promise<void> {
    const url = `https://github.com/denoland/deno/releases/download/${version}/deno-x86_64-unknown-linux-gnu.zip`;
    const response = await fetch(url);
    const zipPath = path.join(directories.TEMP_DIR, "deno.zip");

    if (response.ok) {
      await fs.writeFile(zipPath, new Uint8Array(await response.arrayBuffer()));

      const zip = new AdmZip(zipPath);
      zip.extractAllTo(directories.BIN_DIR, true);

      await fs.rm(zipPath);
    } else {
      throw new Error(`Failed to download deno ${version}`);
    }
  }
}
