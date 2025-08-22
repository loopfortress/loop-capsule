import { Capsule, type CapsuleOptions, CapsuleType } from './Capsule.js'

export class ModuleCapsule extends Capsule {
  private validator: (moduleExport: any) => boolean

  constructor (options: CapsuleOptions, validator: (moduleExport: any) => boolean) {
    super(CapsuleType.module, options)
    this.validator = validator
  }

  override validateExport (moduleExport: any) : void {
    const firstError = this.validator(moduleExport)
    if (firstError) {
      throw new Error(`Invalid schema exported ${firstError}`)
    }
  }
}
