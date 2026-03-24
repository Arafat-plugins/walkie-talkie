# M5-S3: Config Writer and Reader

## Goal

Validated Walkie-Talkie config disk-এ save করা এবং file থেকে load করে আবার validate করা।

## Changed Files

- `packages/config/src/config-store.ts`
- `packages/config/src/index.ts`
- `tests/unit/config-store.test.ts`

## What Was Added

### `packages/config/src/config-store.ts`

Purpose:
- config file path standardize করা
- config serialize/write করা
- file read করে validated config result return করা

Function-by-Function Why:
- `DEFAULT_CONFIG_FILE`
  - default config file naming এক জায়গায় ধরে রাখে
  - later CLI/runtime/readme same filename reuse করতে পারবে
- `resolveConfigPath(baseDirectory, fileName?)`
  - caller-কে path string manually build করতে না হয়
  - current working directory বা custom target dir থেকে deterministic file path দেয়
- `serializeConfig(config)`
  - config JSON formatting stable রাখে
  - deterministic output testable করে
- `writeConfigFile(path, config)`
  - directory create + file write one place-এ রাখে
  - caller-দের repeated fs boilerplate কমায়
- `readConfigFile(path)`
  - raw file read concern isolate করে
  - future-এ encoding/read strategy change করা সহজ হবে
- `loadConfigFile(path)`
  - read + parse + validate এক API-তে দেয়
  - file missing হলে `$file` scoped issue return করে
  - invalid JSON বা invalid config হলে caller clear issue list পায়

### `packages/config/src/index.ts`

Purpose:
- config package public API-তে store functions expose করা

### `tests/unit/config-store.test.ts`

Purpose:
- serialized output deterministic কিনা
- written config validated load path দিয়ে ফিরে আসে কিনা
- invalid config file error path দেয় কিনা
- missing file safe failure দেয় কিনা

## Verification

Commands run:

```bash
node --test --experimental-strip-types tests/unit/config-parser.test.ts tests/unit/config-store.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected result:
- tests pass
- typecheck clean

## Call Flow

Valid save path:
-> `resolveConfigPath(baseDirectory)`
-> `writeConfigFile(path, config)`
-> `serializeConfig(config)`
-> config file written

Validated load path:
-> `loadConfigFile(path)`
-> `readConfigFile(path)`
-> `parseAndValidateConfig(raw)`
-> success config or issue list

## API Contract

### `writeConfigFile(path, config)`

Input:
- resolved file path
- `WalkieTalkieConfig`

Output:
- `Promise<void>`

### `loadConfigFile(path)`

Input:
- resolved file path

Output:
- `{ ok: true, path, config }`
- or `{ ok: false, path, issues }`

## Next Safe Step

`M5-S4`: initial secrets handling strategy add করা, যাতে config save/read flow secrets carelessভাবে expose না করে।
