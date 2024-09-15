import { $ } from "bun";

export abstract class AppCheck {
  constructor(protected name: string) {}

  protected abstract checkInstalledVersion(): Promise<string>;

  protected abstract checkLatestVersion(): Promise<string>;

  protected abstract download(version: string): Promise<void>;

  protected async checkCommand(
    command: string,
    arguments_: string[],
  ): Promise<string | null> {
    try {
      const result = await $`${command} ${arguments_.join(" ")}`.text();

      return result.trim();
    } catch {
      return null;
    }
  }

  protected async getLatestTag(
    repo: string,
    mask: RegExp | null = null,
  ): Promise<string> {
    const { GENERIC_GITHUB_TOKEN } = process.env;

    const result = await fetch(`https://api.github.com/repos/${repo}/tags`, {
      headers: {
        Authorization: `Bearer ${GENERIC_GITHUB_TOKEN}`,
      },
    });

    if (result.ok) {
      let data = (await result.json()) as { name: string }[];

      if (mask) {
        data = data.filter((tag) => mask.test(tag.name));
      }

      return data[0].name;
    }

    throw new Error(`Failed to check github tags for ${this.name}`);
  }

  protected async getLatestRelease(repo: string): Promise<string> {
    const { GENERIC_GITHUB_TOKEN } = process.env;

    const result = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: {
        Authorization: `Bearer ${GENERIC_GITHUB_TOKEN}`,
      },
    });

    if (result.ok) {
      const data = (await result.json()) as { tag_name: string };

      return data.tag_name;
    }

    throw new Error(`Failed to check github releases for ${this.name}`);
  }

  public async update(): Promise<void> {
    const installedVersion = await this.checkInstalledVersion();
    const latestVersion = await this.checkLatestVersion();

    if (installedVersion === latestVersion) {
      // eslint-disable-next-line no-console
      console.info(`✅ ${this.name} is up to date (${latestVersion})`);
    } else {
      // eslint-disable-next-line no-console
      console.info(
        `⌛ ${this.name} will be updated from ${installedVersion} to ${latestVersion}...`,
      );

      await this.download(latestVersion);

      // eslint-disable-next-line no-console
      console.info(`🚀 ${this.name} has been updated to ${latestVersion}`);
    }
  }
}
