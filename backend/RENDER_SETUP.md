# Render Deployment Setup Guide

## Environment Variables Configuration

When deploying to Render, you need to configure the following environment variables in your Render dashboard:

### Required Environment Variables

| Variable Name          | Description                       | Example/Notes                                                 |
| ---------------------- | --------------------------------- | ------------------------------------------------------------- |
| `SUPABASE_URL`         | Your Supabase project URL         | `https://your-project.supabase.co`                            |
| `SUPABASE_SERVICE_KEY` | Supabase service role key         | Found in Supabase Dashboard > Settings > API                  |
| `RESEND_API_KEY`       | Resend API key for sending emails | `re_xxxxxxxxxxxxxxxxxxxx`                                     |
| `EMAIL_FROM`           | Sender email address              | `onboarding@resend.dev` (for testing) or your verified domain |
| `NODE_ENV`             | Node environment                  | Set to `production`                                           |

### Optional Environment Variables

| Variable Name  | Description                | Example/Notes                                                              |
| -------------- | -------------------------- | -------------------------------------------------------------------------- |
| `FRONTEND_URL` | Your frontend URL for CORS | `https://your-frontend.vercel.app` or `https://your-frontend.onrender.com` |
| `PORT`         | Server port                | Automatically set by Render, defaults to 4000 locally                      |

## How to Set Environment Variables in Render

1. Go to your Render dashboard
2. Select your web service
3. Navigate to **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable listed above with their values
6. Click **Save Changes**

## Render Build Settings

When creating your web service on Render:

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Root Directory:** `backend` (if deploying from monorepo)

## Important Notes

### Native Dependencies

Your backend uses `canvas` and `sharp` libraries which require native compilation. The first deployment may take 5-10 minutes to build these dependencies.

### File Storage

The current setup stores uploaded templates in the local `templates/` directory. **Render uses ephemeral storage**, meaning files are deleted on each deployment or restart.

If you need persistent file storage, consider:

- **Supabase Storage** (recommended for your setup)
- AWS S3
- Cloudinary
- Another cloud storage service

### Cold Starts (Free Tier)

If using Render's free tier:

- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 10-30 seconds (cold start)
- Consider upgrading to paid tier for production use

## Deployment Checklist

- [ ] All code changes committed and pushed to Git
- [ ] Environment variables configured in Render
- [ ] Gmail App Password generated and added
- [ ] Supabase credentials verified
- [ ] Build and start commands configured
- [ ] First deployment successful
- [ ] API endpoints tested
- [ ] Frontend updated with new backend URL
- [ ] CORS configured with frontend URL

## Testing Your Deployment

After deployment, test these endpoints:

1. Health check: `GET https://your-service.onrender.com/api/workshops/active`
2. Certificate generation: `POST https://your-service.onrender.com/api/certificates/generate`
3. Email sending: `POST https://your-service.onrender.com/api/send-email`

## Frontend Configuration

Update your frontend's environment variables:

```env
VITE_API_URL=https://your-backend.onrender.com
```

And update the backend's `FRONTEND_URL` environment variable to match your frontend URL for proper CORS configuration.

## Troubleshooting

### Build Fails

- Check Render logs for specific errors
- Ensure all dependencies in package.json are correct
- Verify Node version compatibility

### Email Not Sending

- Verify `RESEND_API_KEY` is correct
- Ensure `EMAIL_FROM` is set (defaults to `onboarding@resend.dev`)
- Check Resend dashboard for API limits or errors
- Verify domain is verified in Resend (if using custom domain)

### Database Connection Issues

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Check Supabase dashboard for connection errors
- Ensure service role key is used (not anon key)

### CORS Errors

- Verify `FRONTEND_URL` is set correctly
- Check that frontend is making requests to correct backend URL
- Ensure credentials are included in requests if needed
