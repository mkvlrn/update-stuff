import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import opentype from "opentype.js";
import { AppCheck } from "~/interfaces/app-check";
import { directories } from "~/util/constants";

export class NerdFontsCheck extends AppCheck {
  constructor() {
    super("nerd-fonts");
  }

  protected async checkInstalledVersion(): Promise<string> {
    const fontsDirectory = path.join(directories.INSTALL_DIR, "nerd-fonts");

    try {
      await fs.stat(fontsDirectory);

      const files = await fs.readdir(fontsDirectory);

      for (const file of files) {
        if (!file.includes(".ttf")) {
          continue;
        }

        const regex = /Nerd Fonts \d+.\d+.\d+/;
        const font = await opentype.load(path.join(fontsDirectory, file));
        const match = regex.exec(JSON.stringify(font.names.version));

        return match ? `v${match[0].split(" ")[2]}` : "not installed";
      }
    } catch {
      return "not installed";
    }

    return "not installed";
  }

  protected async checkLatestVersion(): Promise<string> {
    const version = await this.getLatestTag("ryanoasis/nerd-fonts");

    return version;
  }

  protected async download(version: string): Promise<void> {
    const FONTS_DIR = path.join(directories.INSTALL_DIR, "nerd-fonts");
    const fontNames = [
      "FiraCode",
      "Hack",
      "Iosevka",
      "IosevkaTerm",
      "JetBrainsMono",
      "Meslo",
    ];
    const fontUrls = fontNames.map(
      (fontName) =>
        `https://github.com/ryanoasis/nerd-fonts/releases/download/${version}/${fontName}.zip`,
    );

    try {
      await fs.rmdir(FONTS_DIR, { recursive: true });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      await fs.mkdir(FONTS_DIR);
    }

    await this.downloadFonts(
      fontUrls,
      fontNames.map((fontName) => path.join(directories.TEMP_DIR, `${fontName}.zip`)),
    );

    for (const fontName of fontNames) {
      const zip = new AdmZip(path.join(directories.TEMP_DIR, `${fontName}.zip`));
      zip.extractAllTo(FONTS_DIR, true);

      await fs.rm(path.join(directories.TEMP_DIR, `${fontName}.zip`));
    }
  }

  private async downloadFonts(fonts: string[], destinations: string[]) {
    const promises = fonts.map(async (url, index) => {
      const response = await fetch(url);
      await Bun.write(
        destinations[index],
        new Uint8Array(await response.arrayBuffer()),
      );
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
}
