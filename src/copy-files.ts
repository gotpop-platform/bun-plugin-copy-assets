import { join, relative } from "path"

import { promises as fs } from "fs"
import { logger } from "@gotpop-platform/package-logger"

export async function copyFiles({
  source,
  destination,
  silent = false,
}: {
  source: string
  destination: string
  silent: boolean
}) {
  const sourcePath = join(process.cwd(), source)
  const destinationPath = join(destination.replace(/^\//, ""))
  const relativePath = relative(process.cwd(), sourcePath)

  if (!silent) {
    logger(
      { msg: "Copying from", styles: ["italic"] },
      { msg: relativePath, styles: ["bold", "red"] },
      { msg: "to", styles: ["dim"] },
      { msg: destination, styles: ["bold", "green"] }
    )
  }

  await fs.mkdir(destinationPath, { recursive: true })

  const entries = await fs.readdir(sourcePath, { withFileTypes: true })

  for (const entry of entries) {
    const sourceEntryPath = join(sourcePath, entry.name)
    const destinationEntryPath = join(destinationPath, entry.name)
    const relativeSourcePath = relative(process.cwd(), sourceEntryPath)

    if (entry.isDirectory()) {
      await copyFiles({
        source: relativeSourcePath,
        destination: destinationEntryPath,
        silent,
      })
    } else {
      await fs.copyFile(sourceEntryPath, destinationEntryPath)
    }
  }
}
