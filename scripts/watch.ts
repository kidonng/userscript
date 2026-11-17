import { watch } from "node:fs";
import { configs } from "./config.ts";

const root = "source";

watch(root, { recursive: true }, (_event, filename) => {
  const path = `${root}/${filename}`;
  const config = configs.find((config) => config.entrypoints[0] === path);
  if (!config) return;

  Bun.build(config);
});
