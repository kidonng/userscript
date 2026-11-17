import { globSync, readFileSync } from 'node:fs'
import { $ } from 'bun'

const commit = await $`git rev-parse HEAD`.text()
const commitCount = await $`git rev-list --count HEAD`.text()

const delimiter = '// ==/UserScript=='
function getBanner(path: string) {
  return (
    readFileSync(path, 'utf8')
      .split(delimiter)[0]!
      .replace(
        /(@version.+)/,
        `$1.${commitCount.toString().trim()}-${commit.toString().slice(0, 7)}`,
      )
      + delimiter
  )
}

export const configs = globSync('source/*/*.user.ts{,x}').map(script =>
  ({
    entrypoints: [script],
    banner: getBanner(script),
    outdir: 'dist',
    plugins: [
      {
        name: 'Build Time',
        setup: build => {
          build.onEnd(() =>
            console.log(`${new Date().toLocaleTimeString()} Built ${script}`),
          )
        },
      },
    ],
  } satisfies Bun.BuildConfig),
)
