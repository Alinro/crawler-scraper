import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Instructions } from "./types.js";

const mapping: Record<string, string> = {
  oda: "./oda.json",
  finn: "./finn.json",
  test: "./test.json",
};

export const getInstructions = async (name: string) => {
  if (!mapping[name]) {
    throw `Instructions for ${name} not found`;
  }

  const file = fileURLToPath(import.meta.url);
  const directory = dirname(file);

  const path = join(directory, mapping[name]);

  const module = await import(path, {
    assert: {
      type: "json",
    },
  });

  return module.default;

  // return JSON.parse(fileContent) as Instructions;
};
