import { Select } from "https://deno.land/x/cliffy@v0.25.7/prompt/select.ts";

import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import Spinner from "https://deno.land/x/cli_spinners@v0.0.2/mod.ts";
import { $ } from "https://deno.land/x/zx_deno@1.2.2/mod.mjs";

import { CommitMessageAgent } from "./agent.ts";

$.verbose = false;

const { options } = await new Command()
  .name("git-aico")
  .option("-m,--model <modelName:string>", "The model name to use", {
    default: "gpt-4",
  })
  .option("-t,--temperature <temp:number>", "The temperature to use", {
    default: 0.1,
  })
  .option("--max-tokens <maxToken:number>", "The max tokens to use", {
    default: 500,
  })
  .option("-p,--prompt <prompt:string>", "The prompt file path to use")
  .description(
    "The command that reads the difference and automatically generates a commit message.",
  )
  .parse(Deno.args);

const agent = new CommitMessageAgent(
  options.model,
  options.temperature,
  options.maxTokens,
);

function repeatDot(n: number): string {
  let result = "";
  for (let i = 0; i < n; i++) {
    result += ".";
  }
  return result;
}

const main = async () => {
  const spinner = Spinner.getInstance();
  const spinnerMessage = "Reading git diff staged ";
  await spinner.start(spinnerMessage);
  {
    let c = 0;
    setInterval(() => {
      c++;
      spinner.setText(spinnerMessage + repeatDot(c));
    }, 1000);
  }

  const commitMessages = await agent.thinkCommitMessages();
  await spinner.stop();
  if (commitMessages.length !== 3) {
    console.log("No commit message candidates were generated");
    return Deno.exit(0);
  }

  const candidates = commitMessages.map((message) => ({
    name: message,
    value: message,
  }));

  const message = await Select.prompt({
    message: "Choose a commit message",
    options: [...candidates, Select.separator("----"), {
      name: "exit",
      value: "exit",
    }],
  });

  if (message === "exit") {
    Deno.exit(0);
  }

  const action: string = await Select.prompt({
    message: "Choose an action",
    options: [
      { name: "git commit ", value: "commit" },
      { name: "git commit with editor", value: "commit-with-editor" },
      { name: "exit", value: "exit" },
    ],
  });
  $.verbose = true;
  if (action === "exit") {
    return Deno.exit(0);
  }
  if (action === "commit") {
    await $`git commit -m "${message}"`;
    return Deno.exit(0);
  }
  if (action === "commit-with-editor") {
    const tmpfile = await Deno.makeTempFile();
    await Deno.writeTextFile(tmpfile, message);
    await $`git commit -t ${tmpfile}`;
    await Deno.remove(tmpfile);
  }
};

await main();
