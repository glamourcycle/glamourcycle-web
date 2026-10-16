<!-- AI-CONTEXT-BEGIN -->
Audience: student charity volunteers and the person maintaining its GitHub repository.
Intent: launch a mobile-friendly Indian occasionwear sharing site with minimal operational work.
Decisions: static HTML/CSS/JS; GitHub Pages; email requests; optional Airtable forms and publish-time inventory sync. No custom backend or public Airtable credentials. The owner confirmed glamourcycle@gmail.com on 2026-10-15.
Visual direction: saturated saffron, teal, and coral colour fields; Indian textile-inspired paisley blocks and woven borders; solid ivory surfaces behind detailed text. Preserve readable contrast.
Donation intake: reuse the original DONATIONS Google Form at https://docs.google.com/forms/d/e/1FAIpQLScFDdH6EHXGB9z_9jPnfvEMQGiypii4UZYgQSL2YNX6zsxwdA/viewform. It collects donor details and quantity/location, not photo uploads. Notifications are configured by the Google Form editor, not this site.
Delivery: the site is published through GitHub Pages. The owner authorized repository access and publication of the collection layout improvements on October 16, 2026.
Collection layout: center the announcement text, keep event details at readable sizes, and use smaller Ma Durga artwork beside the text on desktop and below it on mobile.
Constraints: current catalog photos come from the original Google Site; reconstructed catalog numbers and original size notation need volunteer verification. No invented availability, impact totals, prices, pickup locations, or charity registration claims.
<!-- AI-CONTEXT-END -->
# Glam-Cycle

A single-page website for sharing Indian occasionwear. Includes the original site's five unmarked outfits, category filters, search, outfit details, and email requests.

## Preview

From this directory, run:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. A local server is required because the gallery loads a JSON file. There is no build step or package installation.

## Before launch

- Confirm the five catalog numbers, sizes, condition, and availability. The original site split digits across text elements. Numbers were reconstructed in page order, and size notation was preserved. Each outfit is described as a listing from the original site until Airtable replaces it.
- The photos and original descriptions came from https://www.glamourcycle.com/receive on October 15, 2026. Titles and clothing categories are editorial descriptions, not original catalog fields.
- Review the story and donation instructions. Add the charity's service area and confirmed handover process when known. The draft does not promise shipping, pickup, or automatic acceptance.
- Contact email confirmed by owner: glamourcycle@gmail.com.
- Test requests on a phone with an email account configured. The outfit dialog also has a copy-request button.

## GitHub Pages

1. Create a GitHub repository for the website. Use `main` as its default branch.
2. Put this directory's contents at the repository root, including `.github/workflows/pages.yml`.
3. In repository Settings → Pages, choose **GitHub Actions** as the publishing source.
4. Push to `main`. Check Actions → **Publish Glam-Cycle** for the resulting site URL.
5. Review the site before changing the existing domain.
6. After review, follow GitHub's custom-domain instructions to attach `www.glamourcycle.com`. Preserve the existing DNS records until the replacement is ready. Do not add an unverified domain to `CNAME` ahead of setup.

The workflow publishes only the website files, photos, and public catalog. It excludes scripts and this guide from the Pages artifact. Repository visibility is a separate setting.

## Airtable setup

Create a base named **Glam-Cycle** and a table named **Outfits**. Create these exact fields:

| Field | Type | Notes |
|---|---|---|
| Catalog number | Single line text, primary | Unique; preserve leading zeros; letters, digits, underscores, hyphens only |
| Title | Single line text | Public title |
| Category | Single select | Lehenga, Kurta set, Dress, Skirt set |
| Size | Single line text | Record the label as written; confirm age or measurement system |
| Description | Long text | Public outfit details only |
| Condition | Single line text | Note wear, marks, repairs, and missing pieces |
| Photos | Attachment | JPEG, PNG, or WebP; first photo is used on the website; at most 12 MB for the first photo |
| Status | Single select | Pending review, Available, Reserved, Donated |
| Approved for website | Checkbox | Leave unchecked until reviewed |

Keep donor names, contact details, and private notes in a separate **Donation submissions** table. The sync reads an explicit list of public outfit fields, but volunteers must also avoid putting private information in public descriptions or photos.

### Load the first five outfits

Open `data/outfits.json`. For each record:

1. Copy `id` to Catalog number, `title` to Title, `category` to Category, and `size` to Size.
2. Upload the matching file from `assets/` to Photos. Each filename contains the catalog number.
3. Check the outfit's details against the original records and confirm it is available.
4. Add a factual condition description.
5. Set Status to Available and check Approved for website only after review.

This is a five-record manual import. No Airtable base or data has been created remotely. Airtable credentials are not included.

### Donation form

1. Create the private **Donation submissions** table with clothing type, size, condition, pieces included, photos, general location, and donor email.
2. Build a public Airtable form for this table. Explain that volunteers review offers and confirm handover arrangements.
3. Keep the submissions table private. Do not share a base link or a view of donor records.
4. Paste the public form URL into `donationFormUrl` in `config.js`.
5. Submit a test with photos from a signed-out browser. Check that the selected form settings permit the intended donors to submit.
6. Volunteers create an Outfits record after review. New form submissions do not publish automatically.

The current **Offer an outfit** button opens the existing DONATIONS Google Form in a new tab. It collects email, a simple verification answer, age groups, clothing gender, quantity, and location. The form states that the charity currently runs in Ottawa, Ontario. It has no photo-upload field.

To receive email alerts, open the original form with edit access, select Responses → three-dot menu → Get email notifications for new responses. The website cannot enable or verify this editor setting.

Replace `donationFormUrl` in `config.js` with a public Airtable form URL when ready. If the URL is cleared, the website falls back to an email draft. No form was copied or submitted during setup.

### Connect Airtable inventory

1. Create a personal access token at https://airtable.com/create/tokens with `data.records:read` access to this base only.
2. Find the `app...` base ID and `tbl...` Outfits table ID from Airtable's URL or API documentation.
3. In GitHub Settings → Secrets and variables → Actions, add `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, and `AIRTABLE_TABLE_ID` as repository secrets.
4. Run Actions → **Publish Glam-Cycle** → **Run workflow**.
5. Confirm that only reviewed, available records appear. Reserve or donate a test record, rerun the workflow, and confirm that it disappears.

The script downloads the first photo for each approved available record into the deployment. It publishes a small JSON catalog with public fields. The Airtable token stays in GitHub Secrets. Expiring Airtable photo URLs are not embedded into the site.

This is a snapshot on publication, not a live connection. Run the workflow after inventory edits; a push to main also refreshes it. Changes to status do not affect the live site until a successful deployment. Email requests remain subject to volunteer confirmation. No recurring schedule is enabled.

Once any Airtable secret is set, missing configuration or sync errors fail the workflow instead of publishing a stale fallback. With no secrets, it publishes the supplied original-site snapshot. A successful workflow does not commit the exported catalog back to the repository; the published artifact contains the updated catalog.

### Local sync

Supply the same three environment variables through your shell's secret management, then run:

```sh
python3 scripts/sync_airtable.py
```

Do not put a token in `config.js`, an HTML file, or Git. The script does not automatically load `.env` files.

## Files

- `index.html`, `styles.css`, `app.js`: layout, styling, gallery, and requests.
- `config.js`: confirmed email, optional form URL, catalog source.
- `data/outfits.json`: original catalog or local export.
- `assets/`: original catalog photos, plus reusable SVG paisley blocks and textile borders. Photo filenames identify the outfit. `ma-durga-santiniketan.jpg` belongs to the removable next-collection event block.
- `scripts/sync_airtable.py`: optional Airtable export and photo download.
- `.github/workflows/pages.yml`: optional sync followed by GitHub Pages deployment.

## Current collection event

The homepage has a self-contained **Next collection** block after the hero ribbon: `#next-collection` in `index.html`, the matching CSS block in `styles.css`, and `assets/ma-durga-santiniketan.jpg`. Delete those three pieces after the event. There is no automatic expiry. In-person booth donations do not use the Google Form; the form remains for online offers.

Typography uses Google Fonts with local system fallbacks. The site has no analytics, payment processing, user accounts, or reservation lock. Volunteers coordinate requests by email.

## Verification

Checks passed on October 15, 2026: five catalog records; category filtering; catalog-number search; empty search results; outfit dialog opening; Escape closing; request email and catalog number; donation email fallback; photo loading; and no horizontal overflow at 320, 390, 768, and 1440 pixels. No browser JavaScript errors were observed. Desktop and mobile screenshots were visually reviewed.

The Airtable export passed checks with simulated API responses: only public fields were exported, photos were copied locally, the catalog source was updated, and invalid records did not replace the existing catalog. Live Airtable sync and GitHub Pages deployment require account configuration and have not been tested.

## Original page addresses

The `home/`, `donate/`, and `receive/` directories redirect original Google Sites addresses to the corresponding sections of the new website. The Pages workflow includes these files in the deployment. Preserve these redirects so saved links continue to work.
