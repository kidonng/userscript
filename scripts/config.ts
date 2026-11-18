import { globSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { $ } from "bun";

// CI clones are mostly shallow and local commit count incorrect
const isCI = Boolean(process.env.CI);

const commit = (await $`git rev-parse HEAD`.text()).trim();
const commitCount = (
  isCI
    ? // https://gist.github.com/0penBrain/7be59a48aba778c955d992aa69e524c5
      await $`curl -I -k "https://api.github.com/repos/kidonng/userscript/commits?per_page=1&sha=${commit}" | sed -n '/^[Ll]ink:/ s/.*"next".*page=\([0-9]*\).*"last".*/\1/p'`.text()
    : await $`git rev-list --count HEAD`.text()
).trim();

const delimiter = "// ==/UserScript==";
const permissions = ["GM_getValue", "GM_setValue"];

function getBanner(path: string) {
  const file = readFileSync(path, "utf8");
  if (!file.includes(delimiter)) {
    throw new Error(`Missing delimiter in file: ${path}`);
  }

  const tags = [
    `// @version     ${commitCount}`,
    `// @namespace   https://github.com/kidonng/userscript`,
    `// @homepageURL https://github.com/kidonng/userscript/tree/${commit}/${dirname(path)}`,
  ];

  for (const permission of permissions) {
    if (file.includes(permission)) {
      tags.push(`// @grant       ${permission}`);
    }
  }

  return file.split(delimiter)[0]! + tags.join("\n") + "\n" + delimiter;
}

export const configs = globSync("source/*/*.user.ts{,x}").map(
  (script) =>
    ({
      entrypoints: [script],
      banner: getBanner(script),
      outdir: "dist",
      plugins: [
        {
          name: "Build Time",
          setup: (build) => {
            build.onEnd(() =>
              console.log(`${new Date().toLocaleTimeString()} Built ${script}`),
            );
          },
        },
      ],
    }) satisfies Bun.BuildConfig,
);
