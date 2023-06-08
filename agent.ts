import { loadQARefineChain, RefineDocumentsChain } from "npm:langchain/chains";
import { ChatOpenAI } from "npm:langchain/chat_models/openai";
import { Document } from "npm:langchain/document";

import { loadDiffFromGit } from "./diffloader.ts";
import { DEFAULT_PROMPT } from "./prompt.ts";

export class CommitMessageAgent {
  private model: ChatOpenAI;
  private chain: RefineDocumentsChain;
  private prompt: string;

  constructor(
    modelName: string,
    temperature: number,
    maxTokens: number,
    prompt?: string,
  ) {
    this.model = new ChatOpenAI({
      modelName: modelName,
      temperature: temperature,
      maxTokens: maxTokens,
    });
    this.chain = loadQARefineChain(this.model);
    this.prompt = prompt
      ? Deno.readTextFileSync(prompt).toString()
      : DEFAULT_PROMPT;
  }

  public async generateCommitMessages(
    diffDocuments: Document[],
  ): Promise<string[]> {
    const response = await this.chain.call({
      question: this.prompt,
      input_documents: diffDocuments,
    });
    return response.output_text.split("\n").map(this.trimMessage);
  }

  public async thinkCommitMessages() {
    const diffDocuments = await loadDiffFromGit();
    if (diffDocuments.length === 0) {
      return [];
    }
    return await this.generateCommitMessages(diffDocuments);
  }
  private trimMessage(message: string): string {
    return message.trim().replace(/^-+\s*/, "");
  }
}
