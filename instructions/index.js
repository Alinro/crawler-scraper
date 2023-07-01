import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const mapping = {
  oda: "./oda.json",
  finn: "./finn.json",
  test: "./test.json",
};

export const getInstructions = (name) => {
  if (!mapping[name]) {
    throw `Instructions for ${name} not found`;
  }

  const file = fileURLToPath(import.meta.url);
  const directory = dirname(file);

  return JSON.parse(fs.readFileSync(join(directory, mapping[name])));
};
