# Contributing to Subs

Thanks for your interest in contributing to Subs! Here's how to get started.

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/omryhazak/subs.git
   cd subs
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Open in VS Code:

   ```bash
   code .
   ```

4. Press `F5` to launch the Extension Development Host and test your changes.

## Making Changes

1. Create a branch from `main`:

   ```bash
   git checkout -b my-feature
   ```

2. Make your changes in `src/`.

3. Test by pressing `F5` in VS Code to launch the extension in a development host.

4. Lint and format before committing:
   ```bash
   npm run lint
   npm run format
   ```

## Submitting a Pull Request

1. Push your branch and open a pull request against `main`.
2. Describe what you changed and why.
3. Link any related issues.

## Reporting Bugs

Use the [bug report template](https://github.com/omryhazak/subs/issues/new?template=bug_report.md) to file bugs. Include:

- VS Code version
- OS and version
- Steps to reproduce
- Expected vs. actual behavior

## Code Style

- This project uses ESLint and Prettier. Pre-commit hooks run automatically via Husky.
- Keep changes focused -- one feature or fix per PR.

## License

By submitting a pull request, you agree that your contribution is licensed under the [MIT License](LICENSE).
