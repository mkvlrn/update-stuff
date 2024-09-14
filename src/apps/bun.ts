import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import { AppCheck } from "~/interfaces/app-check.ts";
import { directories } from "~/util/constants.ts";

export class BunCheck extends AppCheck {
  constructor() {
    super("bun");
  }

  protected async checkInstalledVersion(): Promise<string> {
    const version = await this.checkCommand("bun", ["--version"]);

    return version ? `bun-v${version.trim()}` : "not installed";
  }

  protected async checkLatestVersion(): Promise<string> {
    const version = await this.checkGithubTags("oven-sh/bun", /^bun-v\d+\.\d+\.\d+$/);

    return version;
  }

  protected async download(version: string): Promise<void> {
    const url = `https://github.com/oven-sh/bun/releases/download/${version}/bun-linux-x64.zip`;
    const response = await fetch(url);
    const zipPath = path.join(directories.TEMP_DIR, "bun.zip");

    if (response.ok) {
      await fs.writeFile(zipPath, new Uint8Array(await response.arrayBuffer()));

      const zip = new AdmZip(zipPath);
      const temporaryExtractedPath = path.join(directories.TEMP_DIR, "bun-linux-x64");
      zip.extractAllTo(directories.TEMP_DIR, true);

      await fs.copyFile(
        path.join(temporaryExtractedPath, "bun"),
        path.join(directories.BIN_DIR, "bun"),
      );

      await fs.chmod(path.join(directories.BIN_DIR, "bun"), 0o755);
      await fs.rm(path.join(directories.TEMP_DIR, "bun.zip"));
      await fs.rmdir(temporaryExtractedPath, { recursive: true });
    } else {
      throw new Error(`Failed to download bun ${version}`);
    }
  }
}
