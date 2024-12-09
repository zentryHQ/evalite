# @evalite/core

## 0.3.0

### Minor Changes

- 32cb0e5: Adopted sqlite as the database instead of jsonl.

  The db will now be saved to `./node_modules/.evalite` by default instead of `evalite-report.jsonl`.

### Patch Changes

- ad28d0b: Made it possible to return any async iterable from a task - more permissive than a ReadableStream.
- a13be9e: Fixed a showstopper bug on Node 20 that prevented the server from running.

## 0.2.1

### Patch Changes

- 5abbeab: Made it possible to return any async iterable from a task - more permissive than a ReadableStream.

## 0.2.0

### Minor Changes

- 9769ab8: Added the ability to handle streams via returning a ReadableStream from an evalite task.

## 0.1.1

### Patch Changes

- a520613: UI tweaks

## 0.1.0

### Minor Changes

- 099b198: Changed createScorer so that it receives an object instead of multiple parameters.
- 099b198: Added a description field to createScorer.

## 0.0.5

### Patch Changes

- eb294a7: Added a link to the eval page to view the filepath in VSCode

## 0.0.4

### Patch Changes

- 213211f: Fixed broken build

## 0.0.3

### Patch Changes

- 4ca6a7d: Initial
