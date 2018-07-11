# mkiso

Utility for creating ISO 9660 images

[![npm](https://img.shields.io/npm/v/mkiso.svg)](https://www.npmjs.com/package/mkiso)
[![GitHub license](https://img.shields.io/github/license/t4nz/mkiso.svg)](https://github.com/t4nz/mkiso/blob/master/LICENSE)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5f0f54069d254079bdf9e5c71eb7debc)](https://www.codacy.com/app/t4nz/mkiso?utm_source=github.com&utm_medium=referral&utm_content=t4nz/mkiso&utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/dm/mkiso.svg)](https://www.npmjs.com/package/mkiso)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

This library uses adapters built on burning command-line tools to generate ISO 9660 images from a source directory. In order to be able to use this module, make sure you have [mkisofs](https://wiki.osdev.org/Mkisofs) installed on your linux system or hdiutil on your darwin system. It is also possible to use a custom adapter.

## Installation

---

```sh
yarn add mkiso
npm i mkiso
```

## Usage

---

The mkiso module returns a constructor that you can use to instanciate commands.

```ts
import mkiso from 'mkiso';

const cmd = mkiso(inputDirectory: string);
```

The following methods are available. Each of these methods can be apply before the [`exec()`](#exec) command.

#### label(name): set the volume name

```ts
mkiso(inputDirectory: string).label('my volume');
```

#### publisher(name): set the publisher name

```ts
mkiso(inputDirectory: string).publisher('Han Solo');
```

#### verbose(): enable the verbose mode

```ts
mkiso(inputDirectory: string).verbose();
```

#### output(target): set the iso output file path

mkiso will default to saving output image to the parent folder of input directory.

```ts
mkiso(inputDirectory: string).output('/path/to/image.iso');
```

#### adapter(adapter): Override the default adapter with a custom one

You can use an existing adapter into the adapters folder or link an external one.

```ts
mkiso(inputDirectory: string).adapter('mkisofs' | '/path/to/my/adapter');
```

#### exec(): start processing

This method must be called as a last instruction. Return a promise containing the stdout and the stderr

```ts
const res = await mkiso(inputDirectory: string)
  .label('my volume')
  .publisher('Han Solo')
  .output('/path/to/image.iso')
  .exec();
```

### Setting event handlers

You can set event listeners for listening the process events. The following events are available:

##### 'progress': stdout of process

##### 'stderr': stderr of process

##### 'error': [ChildProcess.error](https://nodejs.org/api/child_process.html#child_process_event_error)

##### 'close': [ChildProcess.close](https://nodejs.org/api/child_process.html#child_process_event_close)

```ts
const res = await mkiso(inputDirectory: string)
  .output('/path/to/image.iso')
  .verbose()
  .on('error', err => console.error('Error:', err))
  .on('progress', msg => console.log('onProgress:', msg))
  .on('close', (code, signal) => console.log('onClose:', code, signal))
  .exec();
```
