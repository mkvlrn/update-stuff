import { AwsCliCheck } from "~/apps/aws-cli";
import { BunCheck } from "~/apps/bun";
import { DenoCheck } from "~/apps/deno";
import { GoCheck } from "~/apps/go";
import { GoToolsCheck } from "~/apps/go-tools";
import { NerdFontsCheck } from "~/apps/nerd-fonts";
import { OhMyPoshCheck } from "~/apps/oh-my-posh";

await new AwsCliCheck().update();
await new BunCheck().update();
await new DenoCheck().update();
await new GoCheck().update();
await new GoToolsCheck().update();
await new NerdFontsCheck().update();
await new OhMyPoshCheck().update();

// await new TerraformCheck().update();
