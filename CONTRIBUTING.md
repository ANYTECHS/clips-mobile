# Contributing to ClipCash Mobile

Thanks for helping improve ClipCash Mobile. This guide explains the expected contribution flow, local setup, branch names, commit messages, and pull request checklist.

## Find an Issue

Start with [ISSUES.md](./ISSUES.md) and the GitHub issue tracker. Pick a clear issue, read the acceptance criteria, and check whether an open pull request already exists for the same work.

## Fork and Clone

1. Fork `ANYTECHS/clips-mobile` to your GitHub account.
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/clips-mobile.git
cd clips-mobile
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/ANYTECHS/clips-mobile.git
git fetch upstream
```

4. Create your branch from the latest upstream `main`:

```bash
git checkout -b feature/short-description upstream/main
```

## Branch Naming

Use short, descriptive branch names with one of these prefixes:

- `feature/` for new screens, components, or user-facing behavior
- `fix/` for bug fixes and regressions
- `chore/` for docs, tooling, cleanup, or maintenance

Examples:

```text
feature/profile-screen
fix/android-bottom-tab-inset
chore/contributing-guide
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the Expo development server:

```bash
pnpm expo start
```

You can also use the package scripts:

```bash
pnpm start
pnpm android
pnpm ios
pnpm web
```

## Code Style

- Follow the existing React Native, Expo Router, and TypeScript patterns in `src/`.
- Prefer shared theme values from `src/constants/theme.ts` instead of hard-coded spacing or colors.
- Keep components focused and reusable when behavior appears in more than one screen.
- Avoid unrelated formatting changes or large refactors in focused issue PRs.

## Commit Messages

Use Conventional Commits:

```text
type(scope): short summary
```

Common types:

- `feat`: new feature or UI behavior
- `fix`: bug fix
- `docs`: documentation-only change
- `chore`: maintenance or tooling
- `test`: tests only
- `refactor`: code restructuring without behavior changes

Examples:

```text
feat(tabs): add my clips navigation
fix(android): correct bottom tab inset
docs: add contributing guide
```

## Before Opening a Pull Request

Run the checks that apply to your change:

```bash
pnpm lint
```

If you add tests, run the relevant test command and include the result in your PR description.

For UI changes, test the screen on the platforms affected by the issue:

- iOS simulator or device
- Android emulator or device
- Web, when the route supports web

## Pull Request Checklist

Before submitting, confirm:

- [ ] The PR references the issue, for example `Closes #123`.
- [ ] The change is limited to the issue scope.
- [ ] `pnpm lint` passes, or any existing blocker is clearly explained.
- [ ] The app was tested on iOS and/or Android when the change affects mobile UI.
- [ ] A screenshot or screen recording is attached for visual changes.
- [ ] New behavior is documented when future contributors need to understand it.

## Review Expectations

Keep PRs small, respond to maintainer feedback, and update the branch if `main` changes before merge:

```bash
git fetch upstream
git rebase upstream/main
git push --force-with-lease
```

Do not force-push over someone else's branch. If a requested change is unclear, ask for clarification in the PR thread.
