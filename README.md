# Nati & Kris’ Recipes

A Next.js app for saving recipes, filtering by category, following cooking steps,
and keeping an ingredient checklist in a shopping cart. Recipes use a local SQLite
database through Prisma; the cart stays in your browser’s local storage.

## Quick start on macOS

1. Install [Node.js](https://nodejs.org/en/download) if needed. This project’s
   Next.js version requires Node **20.9 or newer**. Check with `node --version`.
2. Open Terminal and run:

   ```bash
   cd /Users/kristiyan.nachev/Projects/recipes-app
   npm ci
   npm run setup
   npm run dev
   ```

   If you cloned the repository elsewhere, use that directory instead.
3. Open [http://localhost:3000](http://localhost:3000). Stop the server with
   **Ctrl+C**. Changes to source files appear automatically while it is running.

`npm run setup` generates Prisma Client and applies the committed database
migrations. No database server, API keys, or `.env` file are needed. SQLite data
lives in `prisma/dev.db`; uploaded images live in `public/uploads`.
The initial run needs internet access to install dependencies and fetch the
Google fonts used by the app.

After the first setup, start the app with just `npm run dev`.
Run `npm run setup` again after pulling changes to the Prisma schema or migrations.

Development, build, typecheck, and test commands automatically regenerate Prisma
Client before running. If your editor still reports an old model field such as
`category` instead of `categories` after a schema change, run `npm run typecheck`.
In VS Code, open the Command Palette (**Cmd+Shift+P**) and choose
**TypeScript: Restart TS Server** to refresh the editor's cached types.

## Try the main flows

- Open a recipe, or use **+ New Recipe** to create one. Enter ingredients and
  cooking steps on separate lines; choose any number of categories and optionally
  upload a photo. Selected category chips turn green.
- Search by title and select a category on the home page. A recipe tagged with
  both Chicken and Soups appears under either filter.
- Open a recipe and use **Start Cooking** to advance through its steps.
- Choose **Add to Cart**, open the cart icon, and tick ingredients as you shop.
  Refresh to check that the checklist persists.
- Edit a recipe and switch between English and Bulgarian in the navigation bar.

Your EN/BG choice is saved in a browser cookie for one year and used when the
server renders a page, so it survives refreshes and new visits. Interface labels,
validation messages, save/upload/delete errors, and fallback pages follow that
choice. Existing form values and cart selections stay in place when switching.
Recipe titles, ingredients, and steps remain the text you entered; automatic
recipe translation is a separate planned feature.

## Components and code

- `src/app/`: routes, API handlers, and server-side recipe loading/saving.
- `src/components/RecipeForm.tsx`: shared create/edit form layout and fields.
- `src/components/NewRecipeForm.tsx`: create/upload requests, errors, and pending state.
- `src/components/EditRecipeForm.tsx`: edit submission, translated errors, and pending state.
- `src/components/FormField.tsx`: reusable labels and shared form-control styles.
- `src/components/RecipeCategoryPicker.tsx`: category checkboxes shared by create/edit forms.
- `src/components/RecipeCategoryBadges.tsx`: translated category badges shared by cards and details.
- `src/components/RecipeList.tsx`: search and category filtering.
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
confirmation dialogs. It also checks that the global controls leave room for
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
If port 3000 is occupied, run `npm run dev -- --port 3001` and open
[http://localhost:3001](http://localhost:3001).

Framework setup details: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation).
