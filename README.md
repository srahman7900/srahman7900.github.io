# srahman7900.github.io

Source of my academic homepage: https://srahman7900.github.io

A static site in plain HTML, CSS and a little JavaScript. There is no build step. GitHub Pages serves the files as they are (`.nojekyll` turns Jekyll off).

| File | Purpose |
|---|---|
| `index.html` | Main page: all sections and their content |
| `cv.html` | CV page that embeds the PDF |
| `Shohanoor_Rahman_CV.pdf` | The CV. Keep this file name. |
| `assets/css/style.css` | All styles, light and dark themes, print styles |
| `assets/js/main.js` | Theme toggle, mobile menu, active section, BibTeX copy |
| `assets/img/portrait.webp`, `portrait.jpg` | Portrait (WebP with JPEG fallback) |
| `404.html`, `sitemap.xml`, `robots.txt`, `favicon.svg` | Site files |

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## How to update

### Replace the CV PDF
1. Export the PDF from Overleaf.
2. Save it over `Shohanoor_Rahman_CV.pdf` in the repository root. Keep the same file name, so old links still work.
3. In `cv.html`, change the line `Updated <month year>`.

### Add a news item
In `index.html`, find `<ul class="news">` and add a new `<li>` at the top (newest first):

```html
<li><time datetime="2027-01">Jan 2027</time><span>One factual sentence.</span></li>
```

Keep 3 to 5 items. Remove the oldest one when you add a new one.

### Add a publication
1. In `index.html`, find the `Publications` section. Copy an existing `<article class="pub">` block into the right group (journal or conference).
2. Change the id (for example `pub-c3`), the title, the authors (keep my name in `<strong>`), the venue, the tags and the DOI link.
3. For BibTeX, change the `aria-controls` value of the BibTeX button and the `id` of the `<div class="bib">` to the same new value (for example `bib-c3`). Use only the fields you know.
4. When [J1] gets a decision, update its status in three places: the News item, the featured card (`#research`) and the publication entry (`#pub-j1`). Add DOI and BibTeX buttons only after it has a DOI.
5. Optional: add a `ScholarlyArticle` entry to the JSON-LD block in the `<head>`.

### Replace the portrait
Use a square (1:1) photo, at least 800 × 800 px. Make two files at about 480 px wide and replace `assets/img/portrait.webp` and `assets/img/portrait.jpg`, for example with https://squoosh.app or:

```sh
npx sharp-cli -i photo.jpg -o assets/img/portrait.webp resize 480 480
npx sharp-cli -i photo.jpg -o assets/img/portrait.jpg resize 480 480
```

Then change `width` and `height` on the `<img class="portrait">` tag in `index.html` to the new size.

### Change the "Last updated" date
Change the footer line in `index.html` and `cv.html`, and `<lastmod>` in `sitemap.xml`.

### Collaboration form (FormSubmit)
The form in the Collaborate section sends messages to srahman7900@gmail.com through [FormSubmit](https://formsubmit.co). Nothing to install. The first message after going live triggers an activation email from FormSubmit; click the link in it once. After that, FormSubmit offers a random alias string: put it in place of the email address in the form's `action` and `data-ajax` attributes so the address is not in the form code.

### View counter (GoatCounter)
`index.html` and `cv.html` load the GoatCounter script, which counts visits without cookies. Once a day, `.github/workflows/view-stats.yml` reads the totals and the top three countries and writes `country-stats.json` to the `stats` branch. The footer pill reads that file and stays hidden until it exists.

Setup, once:
1. Sign up at goatcounter.com with the code `srahman7900`. If that code is taken, use another and change it in `index.html`, `cv.html` and the workflow (`GC_SITE`).
2. In GoatCounter, open Settings → API, create a token with "Read statistics" permission, and copy it.
3. In this GitHub repo, open Settings → Secrets and variables → Actions → New repository secret. Name it `GOATCOUNTER_TOKEN` and paste the token.
4. Open Actions → View stats → Run workflow. The pill appears after the first run.

## Writing rules for this site
- No em dash characters. Use a comma, a colon or two sentences.
- British spelling in my own sentences. Copy paper titles exactly.
- Change the [J1] status only after the journal sends a decision.
