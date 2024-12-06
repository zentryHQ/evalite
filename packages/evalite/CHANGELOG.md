# evalite

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
