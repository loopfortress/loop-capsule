Loop Capsule
============

A tiny helper to load modules from files with validation for different export types:
- FunctionCapsule: validates a function export
- ClassCapsule: validates a class export that matches or extends a given superclass
- ObjectCapsule: validates an instance-of a given class
- ModuleCapsule: validates an arbitrary module/object export via a custom validator

It also provides a small directory lookup utility that walks up directories to find a file or directory (e.g., package.json).

Install
-------

- Using pnpm: pnpm add @loopfortress/capsule
- Using npm: npm i @loopfortress/capsule

Usage
-----

JavaScript (ESM):

```javascript
import { FunctionCapsule, ClassCapsule, ObjectCapsule, ModuleCapsule } from '@loopfortress/capsule'
const fnCap = new FunctionCapsule({ useDefault: true })
const fn = await fnCap.import('/abs/path/to/myFunc.mjs')

class Base {}
const classCap = new ClassCapsule(Base, { useDefault: true })
const ExportedClass = await classCap.import('/abs/path/to/myClass.mjs')

class Thing {}
const objCap = new ObjectCapsule(Thing, { useDefault: true })
const obj = await objCap.import('/abs/path/to/instance.mjs')

const moduleCap = new ModuleCapsule({ useDefault: true }, (exp) => exp && exp.ok ? false : 'missing ok')
const data = await moduleCap.import('/abs/path/to/data.mjs')
```

Lookup helper:

```javascript
import { lookUp, lookUpSync } from '@loopfortress/capsule'
const found = await lookUp('package.json', { cwd: process.cwd() })
```

Running dev docker containers
-----------------------------

Create a `.env` file with the following:

```
# Change these to match your user
DEV_UID=1000
DEV_GID=1000
```

Then run one of the following:

- **pnpm dev**: enters into an interactive devshell
- **pnpm proto**: runs a protoshell container
- **pnpm proto-up**: runs a protoshell container as a daemon
- **pnpm proto-down**: stop a protoshell container
- **pnpm proto-logs**: follow logs of a running protoshell container
- **pnpm proto**: runs a protoshell container


Testing
-------

This repo uses Node's built-in test runner with assert.

- pnpm test
- or npm test

Contributing
------------

Contributions are welcome! Feel free to open an issue or submit a pull request. Always ensure your contributions comply with the project's coding standards and pass validation.

License
-------

This project is licensed under the MIT License. See the [license](license) file for details.
