// In a `catch (error)` block, TypeScript types `error` as `unknown` (not
// `any`) because JavaScript lets you `throw` literally anything — a string,
// a number, or a plain object, not just an Error. `unknown` forces us to
// check what we actually got before using it, instead of blindly assuming
// it has a `.message` property the way `any` would let us.
//
// This helper does that check once so every catch block in the app can
// safely get a printable string out of whatever was thrown.
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
