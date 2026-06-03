Run the Playwright test suite against the deployed EZSpeaks site.

Steps:
1. Check if `@playwright/test` is installed by looking for `node_modules/@playwright/test`. If missing, tell the user to run `npm install` first.
2. Check if Playwright browsers are installed by running `npx playwright install --dry-run chromium 2>&1 | head -5`. If browsers are missing, run `npx playwright install chromium`.
3. Determine the target URL:
   - If the user provided a URL in their message (e.g. a Netlify permalink or staging URL), use that as BASE_URL.
   - Otherwise use the default `https://ezspeaks.com`.
4. Run the tests:
   ```
   BASE_URL=<url> npx playwright test --config=tests/playwright.config.js 2>&1
   ```
5. Parse the output and report results in this format:
   - Summary line: "X passed, Y failed, Z skipped"
   - For each failed test: test name, what went wrong, and a suggested fix
   - If all pass: confirm the site looks healthy and list the areas covered
6. If the HTML report was generated (tests/report/index.html), mention the user can open it with `npx playwright show-report tests/report`.

Always run from the project root: `/Users/evan/Desktop/Claude Projects/articulation-app`
