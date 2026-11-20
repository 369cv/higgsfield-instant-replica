# Brief: build out the AI Influencer Wardrobe images

Paste everything below the line into the image/coding agent.

---

You are working on the GitHub repository **https://github.com/369cv/higgsfield-instant-replica** (branch `main`). It is a React + Vite + TypeScript site deployed on Vercel at https://halalfans.me. Your job is to generate the wardrobe images for the AI Influencer feature and add them to the repo. Do not use Higgsfield. Use your own image generation.

## What we're building

The AI Influencer page has a **Wardrobe** tab. Each of 40 virtual influencers stands in a loft scene, and the user swaps her outfits with a wipe animation. To make that swap work, every image of one character must line up exactly: the same pose, scale, camera height and floor line. Only looks that have an image are shown, so nothing should ever appear as "pending".

## The job list (already written, don't change it)

- `docs/wardrobe/assignments.json`: 160 jobs, which are 40 characters × (1 signature look + 3 outfits). Each job has:
  - `file`: the output file name, `{characterId}__{lookId}.png` (`signature` = the character's own outfit)
  - `sheet`: the character sheet (also in the repo at `public/influencer/characters/{characterId}.webp`). Face close-up on the left, full body on the right.
  - `outfit_ref`: a photo whose CLOTHING to copy (null for signature looks)
  - `prompt`: the exact prompt to use
- `docs/wardrobe/arena-prompt-pack.md`: the same jobs as readable batches.

## Image standards (every image must meet all of these)

1. **Identity.** The person is the character from the sheet: same face, skin tone, hair, body shape and height. Never use the face, hair or body of the person in the outfit reference.
2. **Outfit.** Copy only the clothing, shoes and accessories from the outfit reference, as described in the prompt. Signature looks keep the outfit from the sheet, at the highest quality.
3. **Pose and framing.** Full body, head to toe. Front-facing, standing straight, arms relaxed at the sides, feet together, centered. A small margin above the head and below the feet. Portrait 2:3, at least 1024×1536.
4. **Background.** Plain seamless light grey studio background with soft even daylight. No props, no scenery and no floor shadow clutter: the app removes the background and places her in the loft.
5. **Clean.** One person only. No text, logos, watermarks or frames. Photorealistic skin and fabric.
6. **Reject and redo** any image with extra or missing limbs, warped hands or feet, a cropped head or feet, a different face, or a second person.

## How to add the images

1. Generate each job and save it as `.cache/wardrobe-inbox/{file}` using the exact file name from the job.
2. Run the ingest script. It removes the background, registers the figure on the shared 680×1020 stage canvas, writes `public/influencer/looks/{characterId}/{lookId}.webp`, and regenerates `src/features/influencer/looks.generated.ts`:
   ```bash
   pip install rembg onnxruntime pillow scipy numpy
   python3 scripts/wardrobe/ingest_looks.py .cache/wardrobe-inbox
   ```
   (Add `--force` to replace an image you redid.)
3. Check the result:
   ```bash
   npm ci
   npx tsc --noEmit -p .
   npm run build
   ```
   Then open a few files in `public/influencer/looks/` and confirm a clean cut-out with no grey halo, the whole figure visible, and the feet near the bottom edge.

## Rules

- Only add or change files in `public/influencer/looks/` and `src/features/influencer/looks.generated.ts`. Don't edit any other source file, and don't hand-edit `looks.generated.ts` (the script writes it).
- Don't commit `.cache/`.
- Work in batches (for example one character's 4 images at a time) and commit as you go, so progress is never lost.
- Push to a new branch `wardrobe-looks` and open a pull request into `main`. Don't push to `main` directly. In the PR description, list which characters and looks are done and any you skipped, with the reason.
- If you can't meet a standard for a job, skip it and list it. A missing look is fine; a wrong-looking one is not.

## Done means

All 160 looks (or as many as pass the standards) are in `public/influencer/looks/`, `looks.generated.ts` lists them, the build passes, and a PR is open.
