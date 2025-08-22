import { Capsule, type CapsuleOptions, CapsuleType } from './Capsule.js'

export class FunctionCapsule extends Capsule {
  constructor (options: CapsuleOptions) {
    super(CapsuleType.function, options)
  }

  override validateExport (exportValue: any) : void {
    if (typeof exportValue !== 'function') {
      throw new Error(`Capsule export is not a function: ${typeof exportValue}`)
    }
  }
}
