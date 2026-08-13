# Contributing

Thank you for improving `react-7tv`.

## Setup

1. Fork and clone the repository.
2. Install dependencies with `npm install`.
3. Create a focused branch.
4. Run `npm run check` before opening a pull request.

Changes to matching, API normalization, or rendering should include tests. Keep
the package SSR-safe: do not read browser globals at module scope. Avoid adding
runtime dependencies unless the benefit clearly outweighs the bundle cost.

## Pull requests

Explain the user-facing behavior and compatibility impact. Keep unrelated
refactors separate. Public API changes should update the README and TypeScript
exports in the same pull request.

## Releasing

Maintainers should update `CHANGELOG.md`, choose a Semantic Versioning bump, and
run `npm run check` plus `npm pack --dry-run`. Publish from a clean tagged commit
with `npm publish`; the package requests public access and npm provenance.

By contributing, you agree that your contribution is licensed under the MIT
License.
