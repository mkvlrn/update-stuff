import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import { AppCheck } from "~/interfaces/app-check.ts";
import { directories } from "~/util/constants.ts";

export class AwsCliCheck extends AppCheck {
  constructor() {
    super("aws-cli");
  }

  protected async checkInstalledVersion(): Promise<string> {
    let version = await this.checkCommand("aws", ["--version"]);

    if (!version || version === "not installed") {
      return "not installed";
    }

    version = version.split(" ")[0];
    version = version.replace("aws-cli/", "");

    return version;
  }

  protected async checkLatestVersion(): Promise<string> {
    const version = await this.checkGithubTags("aws/aws-cli");

    return version;
  }

  protected async download(version: string): Promise<void> {
    const url = "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip";
    const response = await fetch(url);
    const zipPath = path.join(directories.TEMP_DIR, "aws-cli.zip");
    const installDirectory = path.join(directories.INSTALL_DIR, "aws-cli");

    if (response.ok) {
      await fs.writeFile(zipPath, new Uint8Array(await response.arrayBuffer()));
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(directories.TEMP_DIR, true);

      // clean up old install
      await fs.rmdir(installDirectory, { recursive: true });
      await fs.rm(path.join(directories.BIN_DIR, "aws"));
      await fs.rm(path.join(directories.BIN_DIR, "aws_completer"));

      // install new version
      await fs.cp(
        path.join(directories.TEMP_DIR, "aws", "dist"),
        path.join(directories.INSTALL_DIR, "aws-cli"),
        { recursive: true },
      );
      await fs.chmod(path.join(directories.INSTALL_DIR, "aws-cli", "aws"), 0o755);
      await fs.chmod(
        path.join(directories.INSTALL_DIR, "aws-cli", "aws_completer"),
        0o755,
      );
      await fs.symlink(
        path.join(directories.INSTALL_DIR, "aws-cli", "aws"),
        path.join(directories.BIN_DIR, "aws"),
        "file",
      );
      await fs.symlink(
        path.join(directories.INSTALL_DIR, "aws-cli", "aws_completer"),
        path.join(directories.BIN_DIR, "aws_completer"),
        "file",
      );

      // remove installer files
      await fs.rm(zipPath);
      await fs.rmdir(path.join(directories.TEMP_DIR, "aws"), { recursive: true });
    } else {
      throw new Error(`Failed to download aws-cli ${version}`);
    }
  }
}
