import { $ } from "bun";
import { AppCheck } from "~/interfaces/app-check";

export class GoToolsCheck extends AppCheck {
  constructor() {
    super("go-tools");
  }

  protected async checkInstalledVersion(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    return "*";
  }

  protected async checkLatestVersion(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    return "**";
  }

  protected async download(): Promise<void> {
    await $`go install golang.org/x/tools/gopls@latest`.quiet();
    await $`go install github.com/go-delve/delve/cmd/dlv@latest`.quiet();
    await $`go install github.com/haya14busa/goplay/cmd/goplay@latest`.quiet();
    await $`go install github.com/fatih/gomodifytags@latest`.quiet();
    await $`go install github.com/josharian/impl@latest`.quiet();
    await $`go install github.com/cweill/gotests/gotests@latest`.quiet();
    await $`go install honnef.co/go/tools/cmd/staticcheck@latest`.quiet();
    await $`go install mvdan.cc/gofumpt@latest`.quiet();
  }
}
