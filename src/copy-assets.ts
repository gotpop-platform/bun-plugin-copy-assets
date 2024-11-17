import { join, relative } from "path"
import { type BunPlugin } from "bun"
import { promises as fs } from "fs"
import { logger } from "@gotpop-platform/package-logger"

async function copyFiles({
  source,
  destination,
  silent = false,
}: {
  source: string
  destination: string
  silent: boolean
}) {
  const sourcePath = join(process.cwd(), source)
  const destinationPath = join(process.cwd(), destination)
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

export interface CopyFilesPluginOptions {
  // Source and destination configuration
  inputDir?: string
  outputDir?: string
  directories: string[]

  // File handling options
  patterns?: string[]
  exclude?: string[]

  // Processing options
  preserveStructure?: boolean
  flatten?: boolean

  // Hooks
  onFile?: (source: string, dest: string) => Promise<void>
  onDir?: (source: string, dest: string) => Promise<void>

  // Logging options
  verbose?: boolean
  silent?: boolean
}

export const createCopyFilesPlugin = (options: CopyFilesPluginOptions): BunPlugin => ({
  name: "copy-assets",
  async setup(build) {
    const {
      inputDir = "src",
      outputDir = "dist",
      directories,
      patterns = ["**/*"],
      exclude = [],
      preserveStructure = true,
      flatten = false,
      onFile,
      onDir,
      verbose = false,
      silent = false,
    } = options

    if (!silent) logger({ msg: "Copying assets...", styles: ["bold", "bgYellowBright"] })

    try {
      for (const directory of directories) {
        const destination = join(
          outputDir,
          preserveStructure ? directory.replace(inputDir, "") : ""
        )

        if (onDir) await onDir(directory, destination)

        await copyFiles({
          source: "/" + inputDir + "/" + directory,
          destination: "/" + destination,
          silent,
        })
      }

      if (!silent)
        logger({
          msg: "Finished copying assets",
          styles: ["bold", "bgGreenBright"],
        })
    } catch (error) {
      logger({ msg: String(error), styles: ["bold", "red"] })
    }
  },
})
