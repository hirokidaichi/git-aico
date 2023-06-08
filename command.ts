import { loadQARefineChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Document } from "langchain/document";
import { Select } from "https://deno.land/x/cliffy@v0.25.7/prompt/select.ts";

import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import Spinner from "https://deno.land/x/cli_spinners@v0.0.2/mod.ts";
import { loadDiffFromFile, loadDiffFromGit } from "./diffloader.ts";
import { $ } from "https://deno.land/x/zx_deno@1.2.2/mod.mjs";

$.verbose = false;

const { options, args } = await new Command()
  .name("git-aico")
  .description(
    "The command that reads the difference and automatically generates a commit message.",
  )
  .arguments("[commit]")
  .parse(Deno.args);

console.log(options, args);

const modelGPT4 = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.1,
  maxTokens: 2500,
});

const chain = loadQARefineChain(modelGPT4);
const prompt = Deno.readTextFileSync("./prompt.txt").toString();

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

const main = async (options: any, args: any) => {
  ///const spinner = Spinner.getInstance();

  //spinner.start("Thinking ...");
  const diffDocuments = await loadDiffFromGit();
  const commitMessages = await generateCommitMessages(diffDocuments);
  //spinner.stop();

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
  if (action === "exit") {
    return Deno.exit(0);
  }
  if (action === "commit") {
    await $`git commit -m "${message}"`;
  }
  if (action === "commit-with-editor") {
    const tmpfile = await Deno.makeTempFile();
    await Deno.writeTextFile(tmpfile, message);
    await $`git commit -t ${tmpfile}`;
    await Deno.remove(tmpfile);
  }
  console.log(message);
};

await main(options, args);
