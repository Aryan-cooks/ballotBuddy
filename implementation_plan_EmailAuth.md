# Implement Email + Password Authentication

This plan outlines the steps to fulfill the request for Email + Password authentication, including profile creation upon signup, using Supabase.

## Current State
The app currently has a basic structure for `AuthContext.jsx`, `Login.jsx`, and `Register.jsx` which already uses `supabase.auth.signInWithPassword` and `supabase.auth.signUp`. However, upon successful signup, it does not explicitly create an entry in the `profiles` table from the client side.

## User Review Required
- Is the database configured with a trigger to automatically create profile rows on `auth.users` insert, or should we explicitly insert into the `profiles` table on the client side during signup? The `supabase_schema_docs.md` mentions a PostgreSQL trigger, but I will add explicit frontend insertion as requested by your prompt.

## Proposed Changes

### [MODIFY] `src/context/AuthContext.jsx`
- Update `signUpWithEmail` to explicitly create an entry in the `profiles` table using `supabase.from('profiles').insert(...)` (or `upsert`) after a successful `supabase.auth.signUp`.
- Ensure robust error handling using the existing `friendlyError` wrapper.

### Note on `Login.jsx` and `Register.jsx`
- `Login.jsx` already correctly calls `signInWithPassword` through `signInWithEmail` and redirects to the dashboard (`navigate('/')`) on success.
- `Register.jsx` already correctly redirects to the dashboard if a session is returned, or shows a user-friendly message to check email.
- The UI handles errors gracefully with user-friendly messages via `setError` and the `AuthContext` error mapping.

## Verification Plan
### Manual Verification
- Attempt to create a new account in the browser. Verify that the `profiles` table in Supabase is populated with the new user's information.
- Attempt to log in with the new account.
- Check error handling by entering incorrect passwords or duplicate emails to see the user-friendly messages.
