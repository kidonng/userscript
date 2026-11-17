import { configs } from './config.ts'

for (const config of configs) {
  await Bun.build(config)
}
