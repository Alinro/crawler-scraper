import * as esbuild from "esbuild";
// import serve from "@es-exec/esbuild-plugin-serve";
// import stream from "stream";
import { commonjs } from "@hyrious/esbuild-plugin-commonjs";
import start from "@es-exec/esbuild-plugin-start";

// console.log(stream);

await esbuild.build({
  entryPoints: ["src/index.ts"],
  outfile: "out.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "esnext",

  sourcesContent: false,
  // mainFields: ["module", "main"],
  // packages: "external",
  plugins: [
    // serve({
    //   main: "out.js",
    // }),
    // commonjs(),
    start({
      script: "node out.js",
    }),
  ],
  external: ["stream"],
  packages: "external",

  // supported: { "dynamic-import": false },
  // banner: {
  //   // js: `import { Duplex } from 'stream';`,
  //   js: `
  //   import { createRequire } from 'module';
  //   // import path from 'path';
  //   // import { fileURLToPath } from 'url';
  //   const require = createRequire(import.meta.url);
  //   const __filename = fileURLToPath(import.meta.url);
  //   const __dirname = path.dirname(__filename);
  //       // import { createRequire as topLevelCreateRequire } from "module";
  //       // const require = topLevelCreateRequire(import.meta.url);
  //       // const __dirname = new URL('.', import.meta.url).pathname;
  //   `,
  // },
});
