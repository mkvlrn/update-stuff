import { AwsCliCheck } from "~/apps/aws-cli.ts";
import { BunCheck } from "~/apps/bun.ts";
import { DenoCheck } from "~/apps/deno.ts";
import { NerdFontsCheck } from "~/apps/nerd-fonts.ts";
import { OhMyPoshCheck } from "~/apps/oh-my-posh.ts";
import { TerraformCheck } from "~/apps/terraform.ts";

await new AwsCliCheck().update();
await new BunCheck().update();
await new DenoCheck().update();
await new NerdFontsCheck().update();
await new OhMyPoshCheck().update();
await new TerraformCheck().update();
