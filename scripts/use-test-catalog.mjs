import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(currentDir, "..")
const envPath = path.join(rootDir, ".env")
const catalogPath = path.join(rootDir, "docs", "sepolia-test-store-catalog.json")

const catalogContents = fs.readFileSync(catalogPath, "utf8")
const minifiedCatalog = JSON.stringify(JSON.parse(catalogContents))
const escapedCatalog = minifiedCatalog.replace(/'/g, "\\'")
const envLine = `NOODL3_STORE_CATALOG_JSON='${escapedCatalog}'`

const existingEnv = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : ""
const nextEnv = /^NOODL3_STORE_CATALOG_JSON=.*$/m.test(existingEnv)
  ? existingEnv.replace(/^NOODL3_STORE_CATALOG_JSON=.*$/m, envLine)
  : `${existingEnv.trimEnd()}${existingEnv.trim().length > 0 ? "\n" : ""}${envLine}\n`

fs.writeFileSync(envPath, nextEnv)

console.log("Updated .env with docs/sepolia-test-store-catalog.json")
