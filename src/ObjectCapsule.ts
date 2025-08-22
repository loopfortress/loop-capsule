import { Capsule, type CapsuleOptions, CapsuleType } from './Capsule.js'

export class ObjectCapsule extends Capsule {
  InstanceOf: Function

  constructor (InstanceOf: Function, options: CapsuleOptions) {
    super(CapsuleType.class, options)
    this.InstanceOf = InstanceOf
  }

  override validateExport (exportValue: any) : void {
    if (!(exportValue instanceof this.InstanceOf)) {
      throw new Error(`Capsule export is not an instance of intended class ${this.InstanceOf.name}: ${this.InstanceOf.name}`)
    }
  }
}
