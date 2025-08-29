# MEDIBOT Environment Variables Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

### 🔐 Authentication & Database
```bash
# NextAuth Authentication
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=your_convex_deploy_key_here
```

### 🤖 AI & Chat
```bash
# Gemini AI API (Already configured)
GEMINI_API_KEY=AIzaSyAmJ37gnnNDdUtDahFakcNnNlZsk7Eb9Rw
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyAmJ37gnnNDdUtDahFakcNnNlZsk7Eb9Rw
```

### 📹 Video Calls
```bash
# Vonage Video API
VONAGE_API_KEY=your_vonage_api_key_here
VONAGE_API_SECRET=your_vonage_api_secret_here
NEXT_PUBLIC_VONAGE_API_KEY=your_vonage_api_key_here
```

### 🏥 Hardware Integration
```bash
# ESP32 Hardware
NEXT_PUBLIC_ESP32_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_ESP32_API_URL=http://localhost:8080/api
```

### 📧 Notifications
```bash
# Email Service (Choose one)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here

# OR
EMAIL_SERVICE=resend
RESEND_API_KEY=your_resend_api_key_here

# SMS Service (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
```

### 🗄️ File Storage
```bash
# AWS S3 (Recommended)
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name_here

# OR Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
```

### 📊 Analytics
```bash
# Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id_here

# Error Monitoring
SENTRY_DSN=your_sentry_dsn_here
```

## Setup Instructions

### 1. NextAuth Authentication
1. Configure your authentication providers in `lib/auth.ts`
2. Set up environment variables for your chosen providers

### 2. Convex Database
1. Go to [convex.dev](https://convex.dev)
2. Create a new project
3. Run `npx convex dev` to start development
4. Copy your deployment URL

### 3. Gemini AI API
✅ **Already configured** with your API key: `AIzaSyAmJ37gnnNDdUtDahFakcNnNlZsk7Eb9Rw`

### 4. Vonage Video Calls
1. Go to [vonage.com](https://vonage.com)
2. Create a developer account
3. Get your API key and secret
4. Enable video API in your dashboard

### 5. ESP32 Hardware
1. Configure your ESP32 to send data to the API endpoints
2. Set up WebSocket connection for real-time updates
3. Update the WebSocket URL in your ESP32 code

### 6. Email Service
**Option A: SendGrid**
1. Go to [sendgrid.com](https://sendgrid.com)
2. Create an account and verify your domain
3. Generate an API key

**Option B: Resend**
1. Go to [resend.com](https://resend.com)
2. Create an account and verify your domain
3. Generate an API key

### 7. File Storage
**Option A: AWS S3**
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Create an IAM user with S3 permissions
3. Create an S3 bucket for file storage

**Option B: Cloudinary**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Create an account
3. Get your cloud name, API key, and secret

## Environment File Structure

Your `.env.local` file should look like this:

```bash
# Copy this template and fill in your values
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://...
CONVEX_DEPLOY_KEY=...
VONAGE_API_KEY=...
VONAGE_API_SECRET=...
NEXT_PUBLIC_ESP32_WS_URL=ws://localhost:8080/ws
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=...
```

## Security Notes

1. **Never commit `.env.local` to version control**
2. **Use different keys for development and production**
3. **Rotate API keys regularly**
4. **Limit API key permissions to minimum required**
5. **Use environment-specific configurations**

## Production Deployment

For production, set these environment variables in your hosting platform:

- **Vercel**: Use the Environment Variables section in your project settings
- **Netlify**: Use the Environment Variables section in your site settings
- **Railway**: Use the Variables section in your project
- **AWS**: Use AWS Systems Manager Parameter Store or Secrets Manager

## Testing Your Setup

After setting up your environment variables:

1. Restart your development server
2. Check the browser console for any missing environment variable errors
3. Test the Gemini API integration
4. Verify Convex database connection
5. Test ESP32 data flow

## Need Help?

- Check the [Clerk documentation](https://clerk.com/docs)
- Visit the [Convex documentation](https://docs.convex.dev)
- Review [Vonage video API docs](https://developer.vonage.com/video)
- Check [SendGrid API docs](https://sendgrid.com/docs/api-reference)
- Review [AWS S3 documentation](https://docs.aws.amazon.com/s3/)