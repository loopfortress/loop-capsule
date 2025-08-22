import { Capsule, type CapsuleOptions, CapsuleType } from './Capsule.js'

export class ClassCapsule extends Capsule {
  SuperClass: Function

  constructor (SuperClass: Function, options: CapsuleOptions) {
    super(CapsuleType.class, options)
    this.SuperClass = SuperClass
  }

  override validateExport (exportValue: any) : void {
    if (typeof exportValue !== 'function') {
      throw new Error('Capsule export is not a function')
    }

    if (exportValue !== this.SuperClass && !(exportValue.prototype instanceof this.SuperClass)) {
      throw new Error('Capsule export does not extend SuperClass')
    }
  }
}
