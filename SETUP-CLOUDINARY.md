# Cloudinary setup

1. Open Cloudinary Console → Settings → Upload → Upload presets.
2. Create or select an unsigned preset for the LaunchReady demo.
3. Allow JPG, PNG and WEBP for Creative Studio uploads.
4. If you will use Motion Ads, also allow the video formats you plan to upload (MP4, MOV and/or WEBM) and set a suitable file-size limit.
5. Copy the cloud name and preset name into `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

6. Restart `npm run dev` after changing environment variables.
7. Test with one small image and one short video before the demo.

This browser-based unsigned upload demo does not need `CLOUDINARY_API_KEY` or `CLOUDINARY_API_SECRET`. Never expose the API secret in frontend code, `NEXT_PUBLIC_` variables, screenshots, or GitHub. If it has been exposed, rotate it in Cloudinary Console.

Unsigned presets are public upload capabilities. Restrict formats, file sizes and other preset settings. For production, implement authenticated server-side signed uploads.
