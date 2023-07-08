import { Instructions } from "./types";

const ALLOWED_INSTRUCTION_SETS = ["oda", "finn", "local"];

export const getInstructions = (name: string) => {
  if (!ALLOWED_INSTRUCTION_SETS.includes(name)) {
    throw Error(`Instructions for ${name} not found`);
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
  return require(`./${name}`).default as Instructions;
};
