# Bump footer version to 0.2.000

## What changes

The footer version string is a single constant in the home page file. Updating it changes the text shown at the bottom of the app from "Stock Now · Version 0.1.100" to "Stock Now · Version 0.2.000".

## Technical detail

- `src/routes/index.tsx`, line 11: `const APP_VERSION = "0.1.100";` becomes `const APP_VERSION = "0.2.000";`
- No other file references the version.

## Note on the versioning rule

Your stated rule is +100 per published update, rolling to the next level past .900 (0.1.900 -> 0.2.000). Jumping straight from 0.1.100 to 0.2.000 skips that sequence; if you meant the normal increment it would be 0.1.200. Confirm which you want and I'll apply it — this plan assumes 0.2.000 as asked.
