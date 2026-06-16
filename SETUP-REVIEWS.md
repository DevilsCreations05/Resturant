# Reviews Module — Setup Guide (≈5 minutes)

Your website is static (GitHub Pages, no server). To make customer reviews
**save permanently and show to everyone**, we use a free **Google Sheet** as the
database (you can open/download it as Excel/CSV anytime) plus a tiny **Google
Apps Script** that the website talks to. It also **emails you** on every new
review, with a link to your admin page.

No SMTP password is needed — emails are sent from the Google account you use
below. (⚠ The Gmail app password you shared earlier should **not** be put in any
website file; see the Security note at the bottom — please revoke it.)

---

## Step 1 — Create the Google Sheet
1. Go to <https://sheets.google.com> → **Blank spreadsheet**.
2. Name it e.g. `Toast & Tap Reviews`.

## Step 2 — Add the script
1. In the sheet: **Extensions → Apps Script**.
2. Delete any sample code, then paste the entire contents of
   **`google-apps-script.gs`** (in this repo).
3. Near the top, edit the `CONFIG` block:
   - `NOTIFY_EMAIL` — where review alerts go (e.g. `ak52592600@gmail.com`).
   - `ADMIN_SECRET` — **change this** to a strong password. This is the password
     you'll type on `admin.html`.
   - `ADMIN_URL` — your live admin page URL, e.g.
     `https://YOURDOMAIN/admin.html` (you can update this later).
4. Click **Save** (💾).

## Step 3 — Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Click the gear ⚙ → choose **Web app**.
3. Set:
   - **Description:** `reviews api`
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**
4. Click **Deploy**. Approve the permissions prompt (it needs to edit the sheet
   and send email *as you*).
5. Copy the **Web app URL** — it ends in `/exec`.

## Step 4 — Connect the website
1. Open **`config.js`** in this repo.
2. Paste your URL:
   ```js
   window.REVIEWS_CONFIG = {
       apiUrl: "https://script.google.com/macros/s/AKfycb..../exec",
       businessName: "Toast & Tap"
   };
   ```
3. Commit & push. Done! 🎉

---

## How it works
- **Customer writes a review** → posted instantly to the Sheet (no approval) →
  shown to all visitors → you get an email with a link to the admin page.
- **Top 3 reviews** show on the homepage, with the Play-Store-style rating
  summary (average + 5★/4★/3★/2★/1★ count bars). "View All Reviews" opens a
  modal with star filters.
- **Admin page** (`admin.html`): enter your `ADMIN_SECRET` to list every review
  and **delete** any of them. Deletion is authorised on the server (the script
  checks the secret), so it can't be faked from the browser.

## Before you connect the backend
The site still works — it shows the built-in **sample reviews** and the form
posts locally so you can preview the design. Real saving/email starts the moment
`apiUrl` is filled in.

## Updating the script later
If you edit `google-apps-script.gs`, in Apps Script do
**Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy** so the
live URL picks up your changes (the URL stays the same).

## Email quota
Free Gmail/Apps Script sends up to ~100 emails/day — plenty for review alerts.

---

## 🔒 Security note (important)
You pasted a Gmail **app password** earlier (`ak52592600@gmail.com`). This setup
**does not use it** — and it must never be placed in `config.js`, `reviews.js`,
or any file served to browsers, because anyone could read it and access your
email.

**Please revoke that app password now:** Google Account →
<https://myaccount.google.com/apppasswords> → remove it. Then, if you ever need
app-password-based email, generate a fresh one and keep it server-side only.
