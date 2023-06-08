import { loadQARefineChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Document } from "langchain/document";
import { Select } from "https://deno.land/x/cliffy@v0.25.7/prompt/select.ts";

import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import Spinner from "https://deno.land/x/cli_spinners@v0.0.2/mod.ts";
import { $ } from "https://deno.land/x/zx_deno@1.2.2/mod.mjs";

import { loadDiffFromGit } from "./diffloader.ts";

$.verbose = false;

const { options, args } = await new Command()
  .name("git-aico")
  .option("-m,--model <modelName:string>", "The model name to use", {
    default: "gpt-3.5-turbo",
  })
  .option("-t,--temperature <temp:number>", "The temperature to use", {
    default: 0.1,
  })
  .option("--max-tokens <maxToken:number>", "The max tokens to use", {
    default: 2500,
  })
  .option("-p,--prompt <prompt:string>", "The prompt file path to use", {
    default: "./prompt.txt",
  })
  .description(
    "The command that reads the difference and automatically generates a commit message.",
  )
  .parse(Deno.args);

const model = new ChatOpenAI({
  modelName: options.model,
  temperature: options.temperature,
  maxTokens: options.maxTokens,
});

const chain = loadQARefineChain(model);
const prompt = Deno.readTextFileSync(options.prompt).toString();

const trimMessage = (message: string): string => {
  return message.trim().replace(/^-+\s*/, "");
};

const generateCommitMessages = async (
  diffDocuments: Document[],
): Promise<string[]> => {
  const response = await chain.call({
    question: prompt,
    input_documents: diffDocuments,
  });
  return response.output_text.split("\n").map(trimMessage);
};

function repeatDot(n: number): string {
  let result = "";
  for (let i = 0; i < n; i++) {
    result += ".";
  }
  return result;
}

const main = async (options: any, args: any) => {
  const spinner = Spinner.getInstance();
  const spinnerMessage = "Reading git diff staged ";
  await spinner.start(spinnerMessage);
  let c = 0;
  setInterval(() => {
    c++;
    spinner.setText(spinnerMessage + repeatDot(c));
  }, 1000);
  const diffDocuments = await loadDiffFromGit();
  const commitMessages = await generateCommitMessages(diffDocuments);
  await spinner.stop();

  const candidates = commitMessages.map((message) => ({
    name: message,
    value: message,
  }));

  const message: string = await Select.prompt({
    message: "Choose a commit message",
    options: candidates,
  });
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
    return;
  }
  if (action === "commit-with-editor") {
    const tmpfile = await Deno.makeTempFile();
    await Deno.writeTextFile(tmpfile, message);
    await $`git commit -t ${tmpfile}`;
    await Deno.remove(tmpfile);
  }
};

await main(options, args);
