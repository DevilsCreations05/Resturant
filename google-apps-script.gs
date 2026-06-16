/**
 * Toast & Tap — Reviews backend (Google Apps Script)
 * ---------------------------------------------------
 * This turns a Google Sheet into a free database + email notifier for the
 * website's review module. No server, no SMTP password needed — emails are
 * sent from the Google account that owns this script.
 *
 * SETUP: see SETUP-REVIEWS.md. In short:
 *   1. Create a Google Sheet.
 *   2. Extensions → Apps Script, paste this file.
 *   3. Edit the three CONFIG values below.
 *   4. Deploy → New deployment → Web app → Execute as "Me",
 *      Access "Anyone" → copy the /exec URL into config.js (apiUrl).
 */

// ===================== CONFIG — EDIT THESE =====================
var CONFIG = {
  // Where new-review notification emails are sent:
  NOTIFY_EMAIL: "ak52592600@gmail.com",

  // The admin password. This is the password you type on admin.html.
  // CHANGE THIS to something only you know.
  ADMIN_SECRET: "ChangeMe-StrongPassword-123",

  // Public URL of your admin page (used in the notification email link).
  // After your site is live, set this to e.g. https://yourdomain.com/admin.html
  ADMIN_URL: "https://toastandtap.example/admin.html",

  // Sheet tab name (leave as is unless you renamed it).
  SHEET_NAME: "Reviews"
};
// ==============================================================

// Columns: id | date | name | rating | text
var HEADERS = ["id", "date", "name", "rating", "text"];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SHEET_NAME);
    sh.appendRow(HEADERS);
  }
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

function readAll_() {
  var sh = getSheet_();
  var values = sh.getDataRange().getValues();
  var out = [];
  var tz = Session.getScriptTimeZone() || "GMT";
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[0] && !row[2]) continue; // skip blank rows
    var d = row[1];
    var dateStr = (d instanceof Date) ? Utilities.formatDate(d, tz, "yyyy-MM-dd") : String(d).slice(0, 10);
    out.push({ id: String(row[0]), date: dateStr, name: row[2], rating: Number(row[3]), text: row[4] });
  }
  return out;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- GET: list reviews (public). With ?admin=SECRET returns admin view. ----
function doGet(e) {
  try {
    var admin = e && e.parameter && e.parameter.admin;
    if (admin !== undefined && admin !== null && admin !== "") {
      if (String(admin) !== String(CONFIG.ADMIN_SECRET)) {
        return json_({ error: "unauthorized" });
      }
    }
    return json_(readAll_());
  } catch (err) {
    return json_({ error: String(err) });
  }
}

// ---- POST: add a review, or delete one (admin only). ----
function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    var action = body.action || "add";

    if (action === "add") {
      return addReview_(body.review || {});
    }
    if (action === "delete") {
      if (String(body.admin) !== String(CONFIG.ADMIN_SECRET)) {
        return json_({ error: "unauthorized" });
      }
      return deleteReview_(body.id);
    }
    return json_({ error: "unknown action" });
  } catch (err) {
    return json_({ error: String(err) });
  }
}

function addReview_(r) {
  var name = String(r.name || "").trim().slice(0, 80);
  var text = String(r.text || "").trim().slice(0, 1000);
  var rating = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)));
  if (!name || !text || !rating) return json_({ error: "missing fields" });

  var date = r.date ? String(r.date).slice(0, 10) : Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd");
  var id = "r" + new Date().getTime() + Math.floor(Math.random() * 1000);

  var sh = getSheet_();
  sh.appendRow([id, date, name, rating, text]);

  notify_(name, rating, text);
  return json_({ ok: true, id: id });
}

function deleteReview_(id) {
  if (!id) return json_({ error: "missing id" });
  var sh = getSheet_();
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sh.deleteRow(i + 1); // +1 because sheet rows are 1-indexed
      return json_({ ok: true });
    }
  }
  return json_({ error: "not found" });
}

function notify_(name, rating, text) {
  try {
    var subject = "⭐ New review (" + rating + "/5) — Toast & Tap";
    var body =
      "You received a new customer review:\n\n" +
      "Name:   " + name + "\n" +
      "Rating: " + rating + " / 5\n" +
      "Review: " + text + "\n\n" +
      "Manage / delete reviews here:\n" + CONFIG.ADMIN_URL + "\n";
    MailApp.sendEmail(CONFIG.NOTIFY_EMAIL, subject, body);
  } catch (err) {
    // Don't fail the submission if email quota is hit.
  }
}
