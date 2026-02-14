# Admin Login Setup Guide

## 1. Create `admin_users` Table

Run your SQL migration to create `admin_users` with at least:
- `user_id` (UUID)
- `email`
- `role`
- `is_active`
- timestamps

## 2. Create First Admin User

1. Create a user in Supabase Authentication.
2. Copy the user UUID.
3. Insert a row into `admin_users` for that UUID.

Example:

```sql
insert into admin_users (user_id, email, role, is_active)
values (
  'YOUR-USER-UUID',
  'admin@example.com',
  'admin',
  true
);
```

## 3. Configure RLS Policies

Recommended:
- Admin users can read and manage all products
- Admin users can manage images
- Public users can only read published products and published images

## 4. Restart Dev Server

After env/policy changes:

```bash
npm run dev:inventory-admin
```

## 5. Verify Login Flow

1. Open `http://localhost:3001/admin/login`
2. Sign in with admin credentials
3. Confirm redirect to `/admin/products`
4. Confirm draft and published products are visible in admin

## Files Added/Used

- `app/admin/login/page.tsx`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/session/route.ts`
- `app/components/AuthProvider.tsx`
- `app/components/Navbar.tsx`
- `middleware.ts`

## Troubleshooting

### Login succeeds but admin data is missing
- Verify user exists in `admin_users`
- Verify `is_active = true`
- Verify `user_id` matches `auth.users.id`

### Cannot create or update products
- Verify RLS policies allow admin writes
- Confirm service role or admin path is configured correctly

### Session is lost unexpectedly
- Check cookie settings
- Check domain/port consistency in local dev
- Check middleware route matching

## Security Notes

- Use strong passwords
- Limit admin accounts
- Monitor admin access
- Use HTTPS in production
