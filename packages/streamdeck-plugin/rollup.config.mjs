import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "dist/plugin.js",
  output: {
    file: "nl.plicon.streamdeck-vscode.sdPlugin/bin/plugin.js",
    format: "cjs",
    sourcemap: false,
  },
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    json(),
  ],
};
