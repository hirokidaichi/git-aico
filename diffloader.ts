import { Document } from "npm:langchain/document";
import { CharacterTextSplitter } from "npm:langchain/text_splitter";
import { $ } from "https://deno.land/x/zx_deno@1.2.2/mod.mjs";

$.verbose = false;

const diffSplitter = new CharacterTextSplitter({
  separator: "\n",
  chunkSize: 4000,
});

const createDocuments = async (text: string): Promise<Document[]> => {
  const document = new Document({ pageContent: text });
  return await diffSplitter.splitDocuments([document]);
};

export async function loadDiffFromFile(path: string): Promise<Document[]> {
  const fileText = Deno.readTextFileSync(path);
  return await createDocuments(fileText);
}

export async function loadDiffFromGit(cid?: string): Promise<Document[]> {
  const output = (cid) ? await $`git diff ${cid}` : await $`git diff --staged`;
  const outputText = output.toString();
  if (outputText.length === 0) return [];
  return await createDocuments(outputText);
}
