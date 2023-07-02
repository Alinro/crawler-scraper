import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Instructions } from "./types.js";

const mapping: Record<string, string> = {
  oda: "./oda.json",
  finn: "./finn.json",
  test: "./test.json",
};

export const getInstructions = (name: string) => {
  if (!mapping[name]) {
    throw `Instructions for ${name} not found`;
  }

  const file = fileURLToPath(import.meta.url);
  const directory = dirname(file);

  const path = join(directory, mapping[name]);

  const fileContent: string = require(path);

  return JSON.parse(fileContent) as Instructions;
};
