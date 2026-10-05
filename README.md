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

## Try the main flows

- Open a recipe, or use **+ New Recipe** to create one. Enter ingredients and
  cooking steps on separate lines; optionally choose a category and photo.
- Search by title and select a category on the home page.
- Open a recipe and use **Start Cooking** to advance through its steps.
- Choose **Add to Cart**, open the cart icon, and tick ingredients as you shop.
  Refresh to check that the checklist persists.
- Edit a recipe and switch between English and Bulgarian in the navigation bar.

## Components and code

- `src/app/`: routes, API handlers, and server-side recipe loading/saving.
- `src/components/RecipeForm.tsx`: shared create/edit form layout and fields.
- `src/components/NewRecipeForm.tsx`: create/upload requests, errors, and pending state.
- `src/components/FormField.tsx`: reusable labels and shared form-control styles.
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
- `prisma/schema.prisma` and `prisma/migrations/`: database schema and history.

## Checks and production preview

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

`npm start` serves the production build; use `npm run dev` for everyday development.
If port 3000 is occupied, run `npm run dev -- --port 3001` and open
[http://localhost:3001](http://localhost:3001).

Framework setup details: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation).
