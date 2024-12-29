/**
 * Welcome, traveller!
 *
 * You're seeing this because your tsconfig.json has
 * been configured incorrectly.
 *
 * Ensure that your `tsconfig.json` has one of these
 * settings for `module` and `moduleResolution`:
 *
 * ```json
 * {
 *   // If you're transpiling with 'tsc'
 *   "module": "NodeNext", // "Node16" is also fine
 *
 *   // Otherwise (or if you're not sure)...
 *   "module": "Preserve",
 *
 *   // Delete "moduleResolution" if you find it:
 *   "moduleResolution": "Delete Me"
 * }
 * ```
 *
 * Without this step, you won't be able to import from
 * Evalite's multiple entrypoints:
 * `evalite/traces`, `evalite/ai-sdk` etc.
 *
 * For more information, check out this
 * [cheat sheet](https://www.totaltypescript.com/tsconfig-cheat-sheet).
 */

declare const evalite: "Something is configured incorrectly!";

export { evalite };
