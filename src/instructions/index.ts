import { Instructions } from "./types";

const mapping: Record<string, string> = {
  oda: "./oda.js",
  finn: "./finn.js",
  test: "./test.js",
};

export const getInstructions = async (name: string) => {
  if (!mapping[name]) {
    throw `Instructions for ${name} not found`;
  }

  const module = require(mapping[name]);

  return module.default as Instructions;
};
