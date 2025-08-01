# Supabase Magic Link Authentication Setup

This guide will help you configure your Supabase project to use only magic link authentication for the cleanest and most user-friendly sign-in experience.

## 1. Supabase Project Setup

### Create a New Project
1. Go to [https://supabase.co/dashboard](https://supabase.co/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `neemee` (or your preferred name)
   - **Database Password**: Generate a secure password (save this)
   - **Region**: Choose closest to your users
5. Click "Create new project"

### Get Your Project Credentials
1. After project creation, go to **Settings** → **API**
2. Copy these values to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 2. Authentication Configuration

### Enable Magic Link Authentication
1. Go to **Authentication** → **Settings**
2. Under **Auth Configuration**:
   - ✅ **Enable email confirmations** (should be enabled by default)
   - ✅ **Enable magic link confirmations** (should be enabled by default)

### Disable Unused Authentication Methods
To ensure users only see the magic link option:

1. Go to **Authentication** → **Providers**
2. **Email Provider**:
   - ✅ Keep **Email** enabled
   - ✅ Keep **Magic link** enabled
   - ❌ Disable **Email confirmations** if you want instant sign-in without email confirmation
3. **Phone Provider**:
   - ❌ Disable if not needed
4. **Social Providers**:
   - ❌ Disable **Google**, **GitHub**, and all others
   - This ensures users only see the magic link option

### Configure Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize the **Magic Link** email template:
   ```html
   <h2>Sign in to Neemee</h2>
   <p>Click the link below to sign in to your account:</p>
   <p><a href="{{ .ConfirmationURL }}">Sign in to Neemee</a></p>
   <p>This link will expire in 60 minutes.</p>
   <p>If you didn't request this, you can safely ignore this email.</p>
   ```

### Set Up Redirect URLs
1. Go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: 
     ```
     http://localhost:3000/api/auth/callback
     https://your-domain.com/api/auth/callback
     ```

## 3. Email Delivery Configuration

### Development (Local Testing)
For development, Supabase provides a built-in email service that works out of the box. No additional configuration needed.

### Production (Custom SMTP)
For production, set up custom SMTP for better deliverability:

1. Go to **Authentication** → **Settings**
2. Scroll to **SMTP Settings**
3. Enable **Enable custom SMTP**
4. Configure with your email provider (Gmail, SendGrid, etc.):
   ```
   Host: smtp.gmail.com
   Port: 587
   User: your-email@gmail.com
   Password: your-app-password
   Sender email: your-email@gmail.com
   Sender name: Neemee
   ```

## 4. Security Settings

### Rate Limiting
1. Go to **Authentication** → **Settings**
2. Under **Security and sessions**:
   - **Rate limiting**: Enable (recommended)
   - **Session timeout**: 24 hours (default)
   - **Refresh token rotation**: Enable (recommended)

### Email Rate Limiting
1. Set reasonable limits for magic link emails:
   - **Max emails per hour**: 10 (per user)
   - **Max sign-up attempts**: 5 (per user per hour)

## 5. Database Schema (Optional)

### User Profiles Table
If you want to store additional user data:

```sql
-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own profile
CREATE POLICY "Users can see their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 6. Testing the Setup

### Test Magic Link Flow
1. Start your Next.js development server:
   ```bash
   cd frontend
   npm run dev
   ```
2. Navigate to `http://localhost:3000`
3. Try signing in with your email address
4. Check your email for the magic link
5. Click the link to sign in

### Troubleshooting Common Issues

#### Magic Link Not Working
- Check that your redirect URL is correctly configured
- Verify the magic link hasn't expired (60 minutes)
- Check your spam folder
- Ensure SMTP settings are correct (production)

#### Redirect Issues
- Verify your redirect URLs in Supabase dashboard
- Check that your callback route exists: `/api/auth/callback`
- Ensure your site URL matches your domain

#### Email Delivery Issues
- For development: Use the built-in Supabase email service
- For production: Set up custom SMTP with a reliable provider
- Check email provider logs for delivery issues

## 7. Production Checklist

Before going live:

- [ ] Set up custom SMTP for email delivery
- [ ] Configure proper redirect URLs for your domain
- [ ] Enable rate limiting
- [ ] Set up proper error monitoring
- [ ] Test magic link flow on production domain
- [ ] Configure custom email templates with your branding

## Next Steps

With magic link authentication configured, your users will enjoy:
- ✅ **No passwords to remember**
- ✅ **Secure email-based authentication**
- ✅ **Clean, simple sign-in flow**
- ✅ **No complex OAuth setup required**
- ✅ **Works on all devices and browsers**

Your authentication system is now simplified and user-friendly while maintaining high security standards.