# Task

Before invoking agents inside directories, make sure that the git diff shows that the directory has
been touched.
Invoke two agents and handle the following:

## Inside of web directory,

Run:
- npm run typecheck
    If there are typescript errors, fix them!
- npm run format
- npm run lint:fix

If there are lints, clean them!

## Inside of api directory,

Run:
- cargo checks
    If there are rust errors, fix them!
- cargo clippy
    If there are lints, clean them!
