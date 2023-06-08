import { loadQARefineChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { ConsoleCallbackHandler } from "langchain/callbacks";
import { loadDiffFromFile, loadDiffFromGit } from "./diffloader.ts";
import { Document } from "langchain/document";

const { options, args } = await new Command()
  .name("git-aico")
  .description(
    "The command that reads the difference and automatically generates a commit message.",
  )
  .arguments("[commit]")
  .parse(Deno.args);

const modelGPT4 = new OpenAI({
  modelName: "gpt-4",
  temperature: 0.7,
  maxTokens: 1000,
  maxRetries: 5,
});

const chain = loadQARefineChain(modelGPT4);

const generateCommitMessage = async (
  diffDocuments: Document[],
): Promise<string> => {
  const response = await chain.call({
    question:
      "Please generate an appropriate commit message based on the context.",
    input_documents: diffDocuments,
  });
  return response.output_text;
};

const diffDocuments = await loadDiffFromGit();
const commitMessage = await generateCommitMessage(diffDocuments);
console.log(commitMessage);
