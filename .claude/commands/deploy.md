# Deploy Command

Deploy the Carlsbad Chamber application to Vercel.

## Steps:

1. **Build the frontend** - Run `npm run build` in the atlas-frontend directory
2. **Test locally** - Ensure the build succeeds and there are no errors
3. **Deploy to Vercel** - Run `vercel --prod` from the atlas-frontend directory
4. **Verify deployment** - Check that the deployment was successful and get the URL
5. **Test approval page** - Visit the /approve page and verify it works on mobile

## Important:

- Make sure all environment variables are set in Vercel dashboard
- Check that the build completes without errors
- Test the approval system after deployment
- Provide the deployment URL to the user

After deployment, create an approval request so the user can verify the deployment URL on their iPhone.
