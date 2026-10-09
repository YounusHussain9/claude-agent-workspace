# API catalogs

`node bin/api-scan.js` writes one file per linked repo here (`apis/<repo>.md`): every endpoint the repo calls
(frontend) or serves (backend), with `file:line` references. It understands axios-style clients, `fetch`,
NestJS decorators, Express routers and Laravel route files.

The generated files are git-ignored because they describe your private APIs. Regenerate them after backend changes.
Claude greps them; it never reads them whole.
