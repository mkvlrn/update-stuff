import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import { AppCheck } from "~/interfaces/app-check.ts";
import { directories } from "~/util/constants.ts";

export class TerraformCheck extends AppCheck {
  constructor() {
    super("terraform");
  }

  protected async checkInstalledVersion(): Promise<string> {
    const version = await this.checkCommand("terraform", ["--version"]);

    return version ? version.split("\n")[0].split(" ")[1].trim() : "not installed";
  }

  protected async checkLatestVersion(): Promise<string> {
    const version = await this.getLastestGithubTag(
      "hashicorp/terraform",
      /^v\d+\.\d+\.\d+$/,
    );

    return version;
  }

  protected async download(version: string): Promise<void> {
    const v = version.replace(`v`, "");
    const url = `https://releases.hashicorp.com/terraform/${v}/terraform_${v}_linux_amd64.zip`;
    const response = await fetch(url);
    const zipPath = path.join(directories.TEMP_DIR, "terraform.zip");

    if (response.ok) {
      await Bun.write(zipPath, new Uint8Array(await response.arrayBuffer()));

      const zip = new AdmZip(zipPath);
      zip.extractEntryTo("terraform", directories.BIN_DIR, true);

      await fs.chmod(path.join(directories.BIN_DIR, "terraform"), 0o755);
      await fs.rm(path.join(directories.TEMP_DIR, "terraform.zip"));
    } else {
      throw new Error(`Failed to download terraform ${version}`);
    }
  }
}
