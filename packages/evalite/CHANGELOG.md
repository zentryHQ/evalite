# evalite

## 0.5.2

### Patch Changes

- 101179c: Added a section in the traces view to view the prompt and completion tokens
- fef1c4f: Allowed for viewing metadata along with each score
- 4d006a1: Added a view in the traces to show how long each trace took.
- Updated dependencies [101179c]
- Updated dependencies [fef1c4f]
- Updated dependencies [4d006a1]
  - @evalite/core@0.3.2

## 0.5.1

### Patch Changes

- Updated dependencies [8b23607]
- Updated dependencies [8130cc9]
  - @evalite/core@0.3.1

## 0.5.0

### Minor Changes

- 32cb0e5: Adopted sqlite as the database instead of jsonl.

  The db will now be saved to `./node_modules/.evalite` by default instead of `evalite-report.jsonl`.

### Patch Changes

- ad28d0b: Made it possible to return any async iterable from a task - more permissive than a ReadableStream.
- Updated dependencies [ad28d0b]
- Updated dependencies [32cb0e5]
- Updated dependencies [a13be9e]
  - @evalite/core@0.3.0

## 0.4.4

### Patch Changes

- 3aab797: Fixed console shortcuts during watch mode.

## 0.4.3

### Patch Changes

- 0961721: Fixed bug with running watch command

## 0.4.2

### Patch Changes

- f77cb6e: Fixed the <path> command.

## 0.4.1

### Patch Changes

- 5abbeab: Made it possible to return any async iterable from a task - more permissive than a ReadableStream.
- 74172d6: Improved report table formatting for objects.
- Updated dependencies [5abbeab]
  - @evalite/core@0.2.1

## 0.4.0

### Minor Changes

- 66e8dac: Made all evalite tests run simultaneously by default.

## 0.3.0

### Minor Changes

- 9769ab8: Added the ability to handle streams via returning a ReadableStream from an evalite task.

### Patch Changes

- Updated dependencies [9769ab8]
  - @evalite/core@0.2.0

## 0.2.1

### Patch Changes

- Updated dependencies [a520613]
  - @evalite/core@0.1.1

## 0.2.0

### Minor Changes

- 099b198: Changed createScorer so that it receives an object instead of multiple parameters.
- 099b198: Added a description field to createScorer.

### Patch Changes

- Updated dependencies [099b198]
- Updated dependencies [099b198]
  - @evalite/core@0.1.0

## 0.1.4

### Patch Changes

- eb294a7: Added a link to the eval page to view the filepath in VSCode
- Updated dependencies [eb294a7]
  - @evalite/core@0.0.5

## 0.1.3

### Patch Changes

- 213211f: Fixed broken build
- Updated dependencies [213211f]
  - @evalite/core@0.0.4

## 0.1.2

### Patch Changes

- e43c7a4: Added early version of the UI, available on localhost:3006 in watch mode.

## 0.1.1

### Patch Changes

- a6a86f1: Made table columns max width 80 chars.

## 0.1.0

### Minor Changes

- 28517ff: Removed scorers copied from autoevals. New recommendation is to use `autoevals` as the default - they are fully compatible with `evalite`.
- 28517ff: Added traceAISDKModel for tracing models with Vercel's AI SDK.
- e53a652: Added support for createScorer.

### Patch Changes

- 4ca6a7d: Initial
- Updated dependencies [4ca6a7d]
  - @evalite/core@0.0.3
