import path from "node:path"
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { lookUpSync } from './utils/lookupdir.js'

const cwdRequire = createRequire(process.cwd()) // Create a `require` function scoped to the cwd

export enum CapsuleType {
  module = 'module',
  function = 'function',
  class = 'class',
  object = 'object'
}

export interface CapsuleOptions {
  defaultFileName?: string
  useDefault?: boolean
  allowVoid?: boolean
  skipValidation?: boolean
}

export abstract class Capsule {
  static TYPES = CapsuleType
  capsuleType: CapsuleType
  defaultFileName: string = ''
  useDefault: boolean = true
  allowVoid: boolean = false
  skipValidation: boolean = false

  static resolveModulePath (moduleName: string) {
    return cwdRequire.resolve(moduleName, { paths: [process.cwd()] })
  }

  static resolvePackagePath (moduleName: string) {
    const moduleFilePath = cwdRequire.resolve(moduleName, { paths: [process.cwd()] })
    const filePath = lookUpSync('package.json', { cwd: moduleFilePath })
    return filePath && path.dirname(filePath)
  }

  protected constructor (capsuleType: CapsuleType, options?: CapsuleOptions) {
    this.capsuleType = capsuleType
    this.defaultFileName = options?.defaultFileName || ''
    this.useDefault = !!options?.useDefault || false
    this.allowVoid = !!options?.allowVoid || false
    this.skipValidation = options?.skipValidation || false
  }

  abstract validateExport (exportValue: any) : void

  canByFoundAt (fromDir: string, fileName: string = this.defaultFileName) {
    const moduleFilePath = path.join(fromDir, fileName)
    return existsSync(moduleFilePath)
  }

  async import<T> (moduleName: string) {
    let moduleExport
    let defaultExport

    const modulePath = Capsule.resolveModulePath(moduleName)
    if (!modulePath) {
      throw new Error(`Failed to resolve module path for ${moduleName}`)
    }

    try {
      moduleExport = await import(modulePath)
      defaultExport = moduleExport?.default
    } catch (e: Error | any) {
      throw new Error(`Failed to load capsule ${e.message}`)
    }

    try {
      const exportValue = this.useDefault ? defaultExport : moduleExport
      const skipValidation = this.skipValidation || (exportValue === undefined && this.allowVoid)

      if (!skipValidation) {
        this.validateExport(exportValue)
      }
      return exportValue as T
    } catch (e: Error | any) {
      throw new Error(`Failed to validate capsule export ${e.message}`)
    }
  }

  async load<T> (fromDir: string, fileName: string = this.defaultFileName) : Promise<T> {
    const moduleFilePath = path.join(fromDir, fileName)
    return this.import(moduleFilePath)
  }
}
