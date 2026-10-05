# LaunchReady AI

AI-powered marketing creative platform built for the Pixels to Products – Cloudinary AI Hackathon 2026.

## 🚀 Live Demo

https://launchready-ai-chi.vercel.app

## 🎥 Demo Video

https://youtu.be/Vcw-7yIAFAU

## 💻 GitHub Repository

https://github.com/HackIndiaXYZ/pixels-to-products-cloudinary-ai-hackathon-2026-launchforge-ai
# LaunchReady AI — Final Studio Edition

LaunchReady AI is a Cloudinary-first campaign workspace. It turns one original product image into channel-specific campaign artwork, keeps a reusable brand kit, checks campaign readiness, stores campaign history in the browser, and includes a browser-based Motion Ads editor for uploaded video footage.

## What is included

- **Overview workspace** with campaign metrics and quick links.
- **Creative Studio** with product upload, four creative directions, campaign copy, CTA, audience/objective fields, live preview, and downloadable platform-sized artwork.
- **Seven creative formats:** Instagram square, Instagram Story, LinkedIn, E-commerce, Website Hero, Email Banner and YouTube thumbnail.
- **Cloudinary delivery:** original product image and generated creative exports are uploaded as separate assets. The original is not overwritten.
- **Brand Kit:** locally saved brand name, tagline, accent color and wordmark, plus transparent configuration checks.
- **Product Consistency Guardian:** reuses the same source image across outputs and checks campaign configuration. It is not a computer-vision authenticity detector.
- **Campaign Readiness:** deterministic checklist with visible criteria; it is not an AI quality score.
- **Campaign Library:** locally persisted saved campaigns, search and campaign manifest export.
- **Campaign Intelligence:** checklist and coverage summary.
- **Motion Ads Editor:** video upload, trim start/end, portrait/square/landscape export, animated Ken Burns pan-and-zoom, animated brand/headline/CTA overlays, optional music and volume, preview, browser rendering, Cloudinary upload and MP4 delivery link.
- **No external AI API token required.** This version uses Cloudinary media workflows and browser-side rendering; it does not claim to generate new AI video footage from a still image.

## Requirements

- Node.js 20+
- Cloudinary account
- An unsigned Cloudinary upload preset configured for the media types you intend to upload (images and videos if using Motion Ads)
- Latest Chrome or Edge recommended for browser video export

## Quick start

1. Extract this ZIP.
2. Open the `launchready-final` folder in VS Code.
3. Copy `.env.example` to `.env.local`.
4. Set the Cloudinary cloud name and unsigned upload preset.
5. In the Cloudinary Console, configure the preset to permit the image formats you use. If you use Motion Ads, also permit video uploads and the required video formats/size.
6. Run:

   ```bash
   npm install
   npm run dev
   ```

7. Open `http://localhost:3000`.

## Environment variables

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

The client-side unsigned workflow does not need your API key or API secret. Never put `CLOUDINARY_API_SECRET` in a `NEXT_PUBLIC_` variable or commit `.env.local` to GitHub. If a secret has been exposed in a screenshot, chat, or repository, rotate it in Cloudinary Console.

## Motion Ads: what the export does

The editor records a new composition in the browser using the uploaded video as its source. It applies a moving crop/zoom, animated copy and CTA, and optional uploaded music. It uploads the resulting recording as a separate Cloudinary video asset and requests optimized MP4 delivery. Browser codec support, source CORS settings, file size, and Cloudinary preset permissions can affect export. The source asset is not modified. Use a short test clip first.

This is an actual compositing/editor workflow, not text-to-video or image-to-video generation. Music is supplied by the user; the project does not bundle copyrighted tracks.

## Cloudinary upload preset checklist

In Cloudinary Console → Settings → Upload → Upload presets:

- Use an **unsigned** preset for this demo workflow.
- Set allowed formats and a reasonable maximum file size.
- Include video formats (for example MP4, MOV or WEBM) if using Motion Ads.
- Keep the preset's permissions narrow. Unsigned presets are public upload capabilities; rotate the preset if abused.
- Restart the Next.js server after editing `.env.local`.

For a production multi-user service, move to authenticated server-side signed uploads and implement user authorization. Do not expose the API secret in browser code.

## Notes

- Brand Kit and Campaign Library data are stored in the current browser's local storage; they are not a multi-user database.
- Creative images are rendered locally in the browser and then uploaded to Cloudinary.
- Cloudinary transformations may consume account credits according to the account plan and enabled features.
