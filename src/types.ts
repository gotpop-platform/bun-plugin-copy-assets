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
