import { Instructions } from "./types";

const ALLOWED_INSTRUCTION_SETS = ["oda", "finn", "local"];

export const getInstructions = async (name: string) => {
  if (!ALLOWED_INSTRUCTION_SETS.includes(name)) {
    throw `Instructions for ${name} not found`;
  }

  const module = require(`./${name}`);

  return module.default as Instructions;
};
