# ProShop

ProShop is a single-store e-commerce website built to take a customer from discovering a product through reviewing an order, while giving administrators a separate area to maintain the store. The application is deployed on Vercel. This document describes the website's features, architecture, data model, and implementation.

## What the website does

The storefront is organized around product discovery and a straightforward purchase journey. The home page presents featured categories, discounted products, featured products, and top-rated products. Customers can continue into the full catalog or a category, narrow the results, inspect a product, save it to a wishlist, and add a selected variant to their cart.

The site also includes customer accounts and an administration area. Store data such as products, stock, orders, saved addresses, and notifications is backed by PostgreSQL. The cart and in-progress checkout form are kept in the customer's browser.

## Customer experience

### Finding and evaluating products

- The home page displays selected categories, discounted items, featured products, and top-rated products.
- `/products` displays the catalog. Customers can filter and sort results, use pagination, and see active filters and result counts.
- `/category/[slug]` presents a category, its subcategories, breadcrumbs, and its matching products.
- `/product/[slug]` displays product details, images, specifications, available variants, price and stock information, reviews, and related products.
- The catalog query helpers in `lib/products.ts` and `lib/categories.ts` load data from PostgreSQL. Catalog filtering parameters are parsed in `lib/catalog-params.ts`.

### Cart and checkout

The cart allows customers to add a product variant, update its quantity, or remove it. The displayed totals include item subtotal, shipping, tax, and total. The current pricing rules are a 15% tax rate, a flat shipping charge of 10 for orders up to 100, and free shipping when the subtotal is above 100. The shared server-side rules are in `lib/pricing.ts`; the cart also calculates its displayed totals in `store/slices/cartSlice.ts`.

Checkout has two screens:

1. `/checkout` collects shipping details and payment metadata.
2. `/checkout/review` shows the address, cart contents, payment summary, and totals before the customer submits the order.

On submission, the server reloads product and variant data rather than relying on the prices in the browser. It checks that products are available and stock is sufficient, recalculates the price, decreases stock, and inserts the order and its line items in a database transaction. If stock or price has changed, the order is rejected and the transaction does not leave a partial order.

After a successful response, the website displays an order confirmation and clears the cart and checkout draft. Customers can review their orders from `/orders`.

**Payment is not processed by a payment provider.** Checkout currently accepts a card brand, last four digits, and expiry date as payment metadata. It does not collect or charge a full card number.

### Accounts and personal features

Customers can register, sign in, sign out, update profile details, change their password, and update their avatar. Their account pages also provide:

- `/profile` for profile information.
- `/profile/password` for password changes.
- `/orders` for order history.
- `/wishlist` for saved products.
- `/notifications` for order updates and other in-app notifications.
- `/settings` for a saved shipping address, payment metadata, and notification preferences.

The wishlist is stored in PostgreSQL and synchronized with the application state after sign-in. A customer's cart is stored in browser `localStorage`; the checkout draft is stored in `sessionStorage`, so it is limited to that browser session.

## Administration

The `/admin` area has a dashboard and sections for orders, products, categories, and users. Administrators can create and edit catalog records, update variants and stock, manage users, and change order status. The admin navigation is defined in `components/admin/AdminNav.tsx`; shared page authorization is handled by `lib/admin-auth.ts`.

Access to admin pages requires a valid session for an active user whose database role is `admin`. The database schema and sample catalog seed do not create an admin account; administrator accounts must be provisioned separately.

## Technical design

### Technology

- **Next.js App Router** provides page routing, server-rendered catalog pages, layouts, and API route handlers.
- **React and TypeScript** are used for the interface, application logic, and shared data types.
- **Tailwind CSS 4** provides the utility-based styling.
- **Redux Toolkit** manages client-side cart, user, wishlist, and checkout state.
- **Neon Serverless SQL** connects the server-side application to PostgreSQL.
- **Node.js crypto** provides password hashing and session signing.
- **lucide-react** supplies interface icons.

Dependency versions are recorded in `package.json` and `package-lock.json`.

### How a request flows through the application

1. A visitor opens a page handled by the Next.js App Router in `app/`.
2. For catalog pages, server components call data helpers in `lib/`, which query PostgreSQL through `lib/db.ts`.
3. Interactive UI components use the Redux store provided by `store/StoreProvider.tsx`.
4. When a customer performs a server-backed action, a client component sends a request to a route handler under `app/api/`.
5. The route handler validates the submitted data, uses the shared database helper, and returns a JSON response.
6. PostgreSQL constraints provide a final layer of data integrity for relationships, unique values, valid states, prices, and stock quantities.

The root layout in `app/layout.tsx` installs the store provider, wishlist synchronization, shared header, and footer. Suspense boundaries on data-heavy pages provide loading placeholders while server data is being prepared.

### Client state and persistence

The Redux store is assembled in `store/index.ts` from four feature slices:

- `cart`: cart lines and displayed totals.
- `user`: signed-in customer information used by the interface.
- `wishlist`: saved products and synchronization state.
- `checkout`: shipping and payment form draft.

The cart slice persists cart items in `localStorage` using the `proshop_cart` key. The checkout slice persists the in-progress form in `sessionStorage` using `proshop_checkout`. These browser values support the interface but are not trusted for the final order calculation: the order endpoint validates current product prices and stock against the database.

### Authentication and authorization

Registration validates the input and hashes the password with `scrypt` before inserting the account. Login loads the account by email and verifies the password hash. Inactive accounts cannot sign in.

On successful registration or login, the server sets a `proshop_session` cookie. Its payload contains the user ID and expiry time and is signed with HMAC-SHA256 using `SESSION_SECRET`. The cookie is HTTP-only, uses `SameSite=Lax`, and is marked `Secure` in production. Session verification is implemented in `lib/session.ts`; `lib/user-auth.ts` and `lib/admin-auth.ts` provide server-side access to the current user and administrator.

Admin API handlers check for an administrator before performing management actions. The admin layout also requires an administrator before rendering admin pages.

## Database design

The PostgreSQL schema is defined in `app/schema.sql`. Its tables are grouped around these parts of the store:

| Area | Main tables | What they represent |
| --- | --- | --- |
| Accounts and delivery | `users`, `shipping_addresses` | Customer/admin accounts and saved delivery addresses. |
| Catalog | `categories`, `brands`, `products`, `product_images` | Product organization, brands, core product information, and images. |
| Variants and attributes | `product_variants`, `variant_images`, `attributes`, `category_attributes`, `product_attribute_values`, `price_history` | Variant-level prices and stock, product options/specifications, and recorded price changes. |
| Customer shopping | `carts`, `cart_items`, `wishlist_items` | Database structures for carts and saved products. The current application cart experience itself is browser-persisted. |
| Orders and payment metadata | `orders`, `order_items`, `payment_methods` | Order totals and statuses, snapshots of purchased items and shipping/payment details, and saved payment metadata. |
| Reviews and notifications | `reviews`, `notifications` | Product feedback and in-app customer notifications. Notification preferences are stored on `users`. |

Foreign keys connect related records, while unique constraints prevent duplicate emails, slugs, SKUs, and wishlist entries. Check constraints enforce valid roles and order/payment statuses, non-negative prices and stock, valid discount amounts, and review ratings in the range 1–5. Indexes support common catalog, order, review, wishlist, and notification lookups.

Order items store the purchased product name, variant, quantity, and unit price as a snapshot. The order also stores shipping and payment snapshots. This preserves the order history if the related catalog or customer settings later change.

## API surface

The route handlers are implemented under `app/api/`. Catalog pages mostly use server-side data helpers rather than a public catalog API.

| Route | Methods | Responsibility |
| --- | --- | --- |
| `/api/auth/register` | `POST` | Validate and create an account, then start a session. |
| `/api/auth/login` | `POST` | Verify credentials and start a session. |
| `/api/auth/logout` | `POST` | Clear the session. |
| `/api/orders` | `GET`, `POST` | Load a customer's order history and submit a new order. |
| `/api/wishlist` | `GET`, `POST`, `DELETE` | Read, add, or remove wishlist products. |
| `/api/profile/update` | `PUT` | Update profile data. |
| `/api/profile/password` | `PUT` | Change the password. |
| `/api/profile/avatar` | `PUT` | Update the avatar. |
| `/api/settings` | `GET`, `PUT`, `DELETE` | Read, save, or remove address and payment metadata. |
| `/api/notifications` | `GET`, `PATCH`, `DELETE` | Read and manage notifications. |
| `/api/notifications/prefs` | `GET`, `PUT` | Read and update notification preferences. |
| `/api/admin/products` | `POST` | Create a product. |
| `/api/admin/products/[id]` | `PATCH`, `DELETE` | Update or delete a product. |
| `/api/admin/variants/[id]` | `PATCH` | Update a product variant. |
| `/api/admin/categories` | `POST` | Create a category. |
| `/api/admin/categories/[id]` | `PATCH`, `DELETE` | Update or delete a category. |
| `/api/admin/orders/[id]` | `PATCH` | Update an order. |
| `/api/admin/users` | `POST` | Create a user. |
| `/api/admin/users/[id]` | `PATCH`, `DELETE` | Update or delete a user. |
| `/api/db-test` | `GET` | Check database connectivity. |

Database queries use positional parameters through the shared `query` helper in `lib/db.ts`. Admin endpoints perform an administrator check before applying management changes.

## Project layout

| Path | Contents |
| --- | --- |
| `app/` | Storefront and admin pages, shared layouts, global styles, and route handlers. |
| `app/api/` | Authentication, orders, profile, settings, wishlist, notifications, and admin APIs. |
| `app/schema.sql` | PostgreSQL tables, constraints, and indexes. |
| `components/` | Reusable UI grouped by feature: admin, auth, cart, category, checkout, layout, notifications, product, profile, and settings. |
| `lib/` | Database access, product/category queries, authentication, validation, pricing, and shared helpers. |
| `store/` | Redux store, provider, typed hooks, synchronization, and state slices. |
| `types/` | Shared TypeScript interfaces for users, products, variants, orders, and checkout. |
| `seed.sql` | Optional sample categories, brands, and products. |

## Main routes

| URL | Page |
| --- | --- |
| `/` | Storefront home page. |
| `/products` | Full catalog with filters and sorting. |
| `/categories` | Category listing. |
| `/category/[slug]` | Products in a category. |
| `/product/[slug]` | Product details and related products. |
| `/cart` | Shopping cart. |
| `/checkout` | Shipping and payment form. |
| `/checkout/review` | Order review and submission. |
| `/login`, `/signup` | Sign-in and registration. |
| `/profile`, `/profile/password` | Account profile and password. |
| `/orders` | Customer order history. |
| `/wishlist` | Saved products. |
| `/notifications` | In-app notifications. |
| `/settings` | Saved address, payment metadata, and preferences. |
| `/admin` | Admin dashboard and management sections. |

## Scope and known limitations

- ProShop is designed as a single-store shop; it does not implement multi-vendor accounts.
- Checkout records payment metadata but does not integrate with a payment gateway or charge a card.
- The cart is stored in the browser and is not synchronized as a persistent server-side cart.
- The admin area depends on an active database account assigned the `admin` role.
- Database-backed pages and API operations require the schema to be applied and the database to be reachable.

## Deployment, setup, and validation

### Vercel deployment

The application is deployed on Vercel. The deployment requires the server-side environment variables `DATABASE_URL` and `SESSION_SECRET`, configured in the Vercel project settings for the relevant environments. The PostgreSQL database must be reachable by the deployed application, and `app/schema.sql` must have been applied before the application uses it.

Keep production environment values private. Redeploy after changing environment variables so the deployment uses the updated configuration.

### Requirements and environment

You need Node.js, npm, and a reachable PostgreSQL database. Neon is used by the project through `@neondatabase/serverless`.

Create a `.env.local` file in the project root:

```dotenv
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_random_secret_at_least_32_characters_long
```

`DATABASE_URL` is the database connection string. `SESSION_SECRET` must be a random value of at least 32 characters. Keep both values private and do not commit `.env.local`.

### Database preparation

Apply the schema to the configured database before starting the application:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f app/schema.sql
```

To add sample catalog data, inspect `seed.sql` first. It deletes existing cart items and products (and dependent product data) before inserting its sample catalog. Do not run it on a database with data you need to preserve.

The schema and seed file do not create an administrator account. Provision an active account with the `admin` role through a controlled database operation if administrative access is required.

### Install and run

From the project root:

```bash
npm ci
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). For a production build and local production server:

```bash
npm run build
npm run start
```

### Validation commands

The project provides these checks:

```bash
npm run lint
npm run build
```

There is currently no test script defined in `package.json`.
