# Nati & Kris’ Recipes

A Next.js app for saving recipes, filtering by category, following cooking steps,
and keeping an ingredient checklist in a shopping cart. Recipes use a local SQLite
database through Prisma; the cart stays in your browser’s local storage.

## Quick start on macOS

1. Install [Node.js](https://nodejs.org/en/download) if needed. This project’s
   authentication dependencies require Node **20.19 or newer**. Check with `node --version`.
2. Open Terminal and run:

   ```bash
   cd /Users/kristiyan.nachev/Projects/recipes-app
   npm ci
   npm run setup
   npm run admin:create
   npm run dev
   ```

   If you cloned the repository elsewhere, use that directory instead.
3. Open [http://localhost:3000](http://localhost:3000). Stop the server with
   **Ctrl+C**. Changes to source files appear automatically while it is running.

`npm run setup` generates Prisma Client and applies the committed database
migrations and creates a random authentication secret in ignored `.env.local`.
`npm run admin:create` asks for your name, email and a hidden password (at least
12 characters). This creates your administrator account; public registration
always creates a regular account. No external database server or API keys are needed. SQLite data
lives in ignored `prisma/local.db`; uploaded images live in `public/uploads`.
On the first setup, existing recipes are copied from the legacy `prisma/dev.db`
snapshot into `prisma/local.db`; the original stays unchanged. Later setup runs
preserve the local database, including your accounts and notes.
The initial run needs internet access to install dependencies and fetch the
Google fonts used by the app.

After the first setup, start the app with just `npm run dev`.
Run `npm run setup` again after pulling changes to the Prisma schema or migrations.

Development, build, typecheck, and test commands automatically regenerate Prisma
Client before running. If your editor still reports an old model field such as
`category` instead of `categories` after a schema change, run `npm run typecheck`.
In VS Code, open the Command Palette (**Cmd+Shift+P**) and choose
**TypeScript: Restart TS Server** to refresh the editor's cached types.

## Accounts, ownership and personal recipes

- Everyone, including guests, can browse recipes, follow cooking steps and use the cart.
- Sign in with email and password to create recipes. The app records the creator
  automatically and displays their name on the recipe.
- A cook can edit their own recipes. Your administrator account can edit any
  recipe and is the only account allowed to delete recipes. These rules are
  checked on the server as well as reflected in the interface.
- Existing recipes have no assigned creator and remain editable by the administrator.
- On a recipe, use **Add to favorites** or save **Personal notes**. The home-page
  **My favorites only** filter combines with search and category filters.
  Favorites and notes belong to your account; other users, including the
  administrator, cannot view your notes through the app. The cart remains local
  to the browser and is not synchronized between accounts.
- Sign out from the navigation bar. A logged-out session cannot save changes.

For an existing checkout, stop the dev server, run `npm run setup`, then
`npm run admin:create`, and restart with `npm run dev`.
The account command exits without changing anything if an administrator already exists.
Create the administrator before registering that same email through the website.

Authentication uses [Better Auth](https://better-auth.com/docs/authentication/email-password)
with password hashing, database sessions, HTTP-only cookies and request rate limits.
Email verification and emailed password recovery are not configured in this version.
For another port or a hosted deployment, set `BETTER_AUTH_URL` in `.env.local`
to the actual app URL (use HTTPS when hosted). Keep `BETTER_AUTH_SECRET` private
and stable across restarts; do not commit `.env.local`.

## Try the main flows

- Open a recipe, or use **+ New Recipe** to create one. Enter ingredients and
  cooking steps on separate lines; choose any number of categories and optionally
  upload a photo. Selected category chips turn green.
- Search by title or ingredients and select categories on the home page.
  Combine them with cook, cooking-time and favorites filters, then choose a sort order.
- Open a recipe and use **Start Cooking** to advance through its steps.
- Choose **Add to Cart**, open the cart icon, and tick ingredients as you shop.
  Refresh to check that the checklist persists.
- Edit a recipe you created and switch between English and Bulgarian in the navigation bar.

Your EN/BG choice is saved in a browser cookie for one year and used when the
server renders a page, so it survives refreshes and new visits. Interface labels,
validation messages, save/upload/delete errors, and fallback pages follow that
choice. Existing form values and cart selections stay in place when switching.
Recipe titles, ingredients, and steps remain the text you entered; automatic
recipe translation is a separate planned feature.

## Search and filtering

Search checks recipe titles and ingredients, ignoring case and extra whitespace.
Every search word must match somewhere in those fields: `chicken rice` can find
"Chicken soup" with rice listed in its ingredients. Bulgarian text is supported;
recipe contents are searched as entered.

Select multiple category chips. **All selected categories** finds recipes with
every selected category, such as Chicken + Soups. Choose **Any selected category**
to include recipes with at least one selection. Clicking a selected chip removes
it; **All** clears just the category selection.

The cook filter uses the account that created the recipe. Older recipes can be
found under **No creator assigned**. Cooking-time limits are inclusive (15, 30,
45, 60 or 120 minutes); recipes without a recorded duration have their own
**Time not specified** option and are excluded from maximum-time filters.
Signed-in users can combine these controls with **My favorites only**.

Sort by newest, oldest, title in either direction, or shortest/longest cooking
time. Missing durations always appear last when sorting by cooking time.
The result count updates as filters change; **Reset filters** clears the search
and selections and restores newest-first sorting. Language changes preserve
selections. Guests can use every control except personal favorites.

## Components and code

- `src/app/`: routes, API handlers, and server-side recipe loading/saving.
- `src/lib/auth.ts`, `session.ts`, and `permissions.ts`: authentication configuration,
  current-user loading and ownership rules.
- `src/components/AuthForm.tsx`: translated sign-in and registration forms.
- `src/components/RecipePersonalDetails.tsx`: private favorites and notes.
- `scripts/`: private local setup and administrator creation.
- `src/components/RecipeForm.tsx`: shared create/edit form layout and fields.
- `src/components/NewRecipeForm.tsx`: create/upload requests, errors, and pending state.
- `src/components/EditRecipeForm.tsx`: edit submission, translated errors, and pending state.
- `src/components/FormField.tsx`: reusable labels and shared form-control styles.
- `src/components/RecipeCategoryPicker.tsx`: category checkboxes shared by create/edit forms.
- `src/components/RecipeCategoryBadges.tsx`: translated category badges shared by cards and details.
- `src/components/RecipeList.tsx`: recipe results and filter state.
- `src/components/RecipeFilters.tsx`: translated search, category, cook, duration,
  favorites and sorting controls.
- `src/lib/recipe-search.ts`: shared filtering and sorting logic.
- `src/types/recipe.ts`: list data with public creator names.
- `src/components/RecipeCard.tsx`: one recipe in the list.
- `src/components/RecipeImage.tsx`: images and the empty-image placeholder,
  shared by cards, details, and upload previews.
- `src/components/CookTime.tsx`: cooking-time icon and label.
- `src/components/RecipeIngredients.tsx`: ingredients and the add-to-cart action.
- `src/components/ShoppingCartRecipe.tsx`: one recipe’s ingredient checklist;
  the cart page manages persistence and updates.
- `src/types/shopping-cart.ts`: shared cart types, including older string ingredients.
- `src/constants/categories.ts`: the category list shared by filters and forms.
- `src/lib/dictionary.tsx`: English/Bulgarian interface strings and translation keys.
- `src/contexts/LanguageContext.tsx`: language selection, cookie persistence, and document language.
- `prisma/schema.prisma` and `prisma/migrations/`: database schema and history.

Recipe categories are stored as a JSON array, supported by this project's
[Prisma version with SQLite](https://www.prisma.io/docs/orm/reference/database-features).
The category migration converts existing values to single-item arrays and
uncategorized recipes to empty arrays, preserving all other recipe data.
Run `npm run setup` and restart the development server after pulling this change.

## Recipe backup and restore

Sign in as an administrator and open **My profile → Recipe backups**.

1. Click **Download backup** and keep the `.json.gz` file somewhere safe. It
   contains the shared recipe collection and the actual uploaded recipe photos.
2. To restore on this installation or another one, select the file and click
   **Preview restore**. Review how many recipes will be added or updated and how
   many will be assigned to your administrator account.
3. Click **Restore backup** and confirm in the dialog. Matching recipe IDs are
   updated; missing IDs are added. Other recipes are retained. Repeating a restore
   keeps the same recipe IDs and does not duplicate recipes.

All recipe fields, multiple categories, original creation dates and creator emails
are included. Existing accounts are matched by email. Recipes without a matching
account are assigned to the administrator performing the restore. For a new
installation, create the desired accounts before restoring to retain their recipe
ownership. Recipe links and shopping-cart references continue to use the same IDs.

This is a recipe collection backup: it does not include accounts, passwords,
profile photos, private notes, favorites or browser shopping carts. Existing notes
and favorites remain attached to matching recipes on the target installation.
External recipe-photo URLs remain links; their image files are not downloaded.
The backup contains creator email addresses, so keep the file private.

Backups use versioned gzip-compressed JSON, with embedded photos. Limits are
100 MB per backup file, 200 MB of expanded JSON, 10,000 recipes, and 5 MB per photo.
Exports additionally cap total unencoded photo bytes at 100 MB. An export fails
if an uploaded recipe photo is missing, instead of producing an incomplete backup.
Unsupported versions, invalid data and incomplete photo archives are rejected
before any writes. Recipe changes commit in one database transaction; fresh photo
filenames prevent overwriting existing uploads, and failed restores remove their
newly written photo files. Successful restores leave previous uploads in place.

## Checks and production preview

Install the browser used by the tests once after `npm ci`:

```bash
npx playwright install chromium
```

Run the tests:

```bash
npm test           # Fast category validation and database migration tests
npm run test:e2e   # Browser tests against a production build
npm run test:all   # Both suites
```

The browser suite covers recipe creation, editing, deletion, search, multiple
categories, EN/BG translations, cooking steps, shopping-cart persistence, and
confirmation dialogs. Account tests cover registration, sign-in, sign-out,
profile changes and photo uploads, backup exports and restores, creator ownership,
administrator permissions, forged server actions, private
notes and favorites, and rejected cross-origin mutations. Search tests cover
Bulgarian ingredients, combined category/cook/time/favorites filters, sorting,
resetting controls and mobile layout. It also checks that the global controls leave room for
page content at mobile and desktop widths, language persistence before JavaScript
loads, and translated validation and error messages during language changes.

Each browser run creates a temporary SQLite database using the real migrations,
builds into `.next-e2e`, and starts its own server on port **3100**. Your recipes,
uploads, and normal `.next` build stay unchanged. Leave port 3100 free; the tests
refuse to reuse an existing server. Building requires internet access for Google
fonts, as it does for the normal production build.

Failed browser tests save screenshots and traces in `test-results`. Open the
HTML report with `npx playwright show-report`. To run a single file, use, for
example, `npm run test:e2e -- tests/e2e/cart.spec.ts`.

Other checks and a production preview:

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

`npm test` checks category validation and runs the database migration against a
temporary SQLite database, including category preservation, multiple-category
saves, edits, and clearing all categories. It leaves your local recipes unchanged.

`npm start` serves the production build; use `npm run dev` for everyday development.
If port 3000 is occupied, set `BETTER_AUTH_URL=http://localhost:3001` in `.env.local`, then run
`npm run dev -- --port 3001` and open
[http://localhost:3001](http://localhost:3001).

Framework setup details: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation).
