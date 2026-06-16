// ===== Reviews Module =====
(function () {
    "use strict";

    var CFG = window.REVIEWS_CONFIG || { apiUrl: "", businessName: "Toast & Tap" };
    var API = (CFG.apiUrl || "").trim();

    // ---- Seed reviews (shown when backend is empty / not yet connected) ----
    var SEED = [
        { name: "Sarah Jenkins", rating: 5, text: "Absolutely the best biryani I've had in Newport. The lamb biryani was rich, tender and full of flavour. Will be back!", date: "2026-05-28" },
        { name: "David O.", rating: 5, text: "Came in for the breakfast buffet and it was unreal value for the price. Great spread, friendly staff and a lovely atmosphere.", date: "2026-05-15" },
        { name: "Priya Kumar", rating: 4, text: "Lovely authentic flavours and generous portions. Chicken biryani was spot on. Took a little while at peak time but worth it.", date: "2026-04-30" },
        { name: "Tom Williams", rating: 5, text: "Watched the match here with a few pints and ordered the wings and a burger. Cracking food, cracking vibe. Highly recommend.", date: "2026-04-22" },
        { name: "Aisha M.", rating: 4, text: "Cosy spot with great coffee and the katsu rice bowl is a must-try. Staff were really welcoming.", date: "2026-03-19" },
        { name: "Mark Davies", rating: 5, text: "Top class. The prawn biryani and a glass of red — perfect evening. Service was attentive without being intrusive.", date: "2026-02-11" }
    ];

    var state = { reviews: [], filter: 0, usingSeed: false };

    // ---- Helpers ----
    function $(id) { return document.getElementById(id); }

    function escapeHtml(s) {
        return String(s || "").replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function starsHtml(rating) {
        var r = Math.round(rating), out = '<span class="rv-stars">';
        for (var i = 1; i <= 5; i++) {
            out += '<span class="' + (i <= r ? "filled" : "") + '">★</span>';
        }
        return out + "</span>";
    }

    function initials(name) {
        var parts = String(name || "?").trim().split(/\s+/);
        var a = parts[0] ? parts[0][0] : "?";
        var b = parts[1] ? parts[1][0] : "";
        return (a + b).toUpperCase();
    }

    function formatDate(d) {
        var dt;
        // Treat plain yyyy-MM-dd as a local date (avoids timezone off-by-one).
        var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || ""));
        if (m) {
            dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        } else {
            dt = new Date(d);
        }
        if (isNaN(dt)) return "";
        return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }

    function sortByDateDesc(arr) {
        return arr.slice().sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
    }

    // ---- Rendering ----
    function reviewCard(rev) {
        return '' +
            '<div class="review-card">' +
                '<div class="review-card-head">' +
                    '<div class="review-avatar">' + escapeHtml(initials(rev.name)) + '</div>' +
                    '<div class="review-meta">' +
                        '<div class="review-name">' + escapeHtml(rev.name) + '</div>' +
                        '<div class="review-date">' + escapeHtml(formatDate(rev.date)) + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="review-card-stars">' + starsHtml(rev.rating) + '</div>' +
                '<p class="review-text">' + escapeHtml(rev.text) + '</p>' +
            '</div>';
    }

    function renderSummary() {
        var revs = state.reviews;
        var total = revs.length;
        var avg = total ? revs.reduce(function (s, r) { return s + Number(r.rating); }, 0) / total : 0;

        $("ratingAverage").textContent = avg.toFixed(1);
        $("ratingAverageStars").innerHTML = starsHtml(avg);
        $("ratingTotal").textContent = total
            ? "based on " + total + " review" + (total === 1 ? "" : "s")
            : "No reviews yet";

        // distribution 5..1
        var counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        revs.forEach(function (r) {
            var k = Math.round(r.rating);
            if (counts[k] !== undefined) counts[k]++;
        });

        var bars = "";
        for (var star = 5; star >= 1; star--) {
            var c = counts[star];
            var pct = total ? (c / total) * 100 : 0;
            bars += '' +
                '<div class="rating-bar-row">' +
                    '<span class="rating-bar-label">' + star + ' ★</span>' +
                    '<div class="rating-bar-track"><div class="rating-bar-fill" data-pct="' + pct + '"></div></div>' +
                    '<span class="rating-bar-count">' + c + '</span>' +
                '</div>';
        }
        $("ratingBars").innerHTML = bars;

        // animate bar widths
        requestAnimationFrame(function () {
            $("ratingBars").querySelectorAll(".rating-bar-fill").forEach(function (el) {
                el.style.width = el.getAttribute("data-pct") + "%";
            });
        });
    }

    function renderTop() {
        var top = sortByDateDesc(state.reviews).slice(0, 3);
        var grid = $("reviewsTop");
        var empty = $("reviewsEmpty");
        if (!top.length) {
            grid.innerHTML = "";
            empty.hidden = false;
            return;
        }
        empty.hidden = true;
        grid.innerHTML = top.map(reviewCard).join("");
    }

    function renderAll() {
        var list = sortByDateDesc(state.reviews);
        if (state.filter) {
            list = list.filter(function (r) { return Math.round(r.rating) === state.filter; });
        }
        var box = $("reviewsAll");
        box.innerHTML = list.length
            ? list.map(reviewCard).join("")
            : '<p class="rv-all-empty">No reviews with this rating yet.</p>';
    }

    function renderAllVisible() {
        if ($("allModal").classList.contains("open")) renderAll();
    }

    // ---- Data loading ----
    function loadReviews() {
        if (!API) {
            state.reviews = SEED.slice();
            state.usingSeed = true;
            paint();
            return;
        }
        fetch(API, { method: "GET" })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var list = Array.isArray(data) ? data : (data && data.reviews) || [];
                state.reviews = list.length ? list : SEED.slice();
                state.usingSeed = !list.length;
                paint();
            })
            .catch(function () {
                state.reviews = SEED.slice();
                state.usingSeed = true;
                paint();
            });
    }

    function paint() {
        renderSummary();
        renderTop();
        renderAllVisible();
    }

    // ---- Modals ----
    function openModal(el) {
        el.classList.add("open");
        el.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
    function closeModal(el) {
        el.classList.remove("open");
        el.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    // ---- Toast ----
    var toastTimer;
    function toast(msg) {
        var t = $("rvToast");
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3500);
    }

    // ---- Star picker ----
    function setupStarPicker() {
        var picker = $("starPicker");
        var hidden = $("rvRating");
        var stars = Array.prototype.slice.call(picker.querySelectorAll(".rv-star"));

        function paintStars(val) {
            stars.forEach(function (s) {
                s.classList.toggle("active", Number(s.dataset.value) <= val);
            });
        }
        stars.forEach(function (s) {
            s.addEventListener("mouseenter", function () { paintStars(Number(s.dataset.value)); });
            s.addEventListener("click", function () {
                hidden.value = s.dataset.value;
                paintStars(Number(s.dataset.value));
            });
        });
        picker.addEventListener("mouseleave", function () { paintStars(Number(hidden.value)); });
    }

    // ---- Submit ----
    function submitReview(e) {
        e.preventDefault();
        var name = $("rvName").value.trim();
        var rating = Number($("rvRating").value);
        var text = $("rvText").value.trim();
        var msg = $("rvFormMsg");
        msg.className = "rv-form-msg";

        if (!name || !text) { msg.textContent = "Please fill in your name and review."; msg.className = "rv-form-msg error"; return; }
        if (!rating) { msg.textContent = "Please pick a star rating."; msg.className = "rv-form-msg error"; return; }

        var btn = $("rvSubmit");
        btn.disabled = true;
        btn.textContent = "Submitting...";

        var review = { name: name, rating: rating, text: text, date: new Date().toISOString().slice(0, 10) };

        function onDone(ok) {
            // optimistic: show immediately
            if (state.usingSeed && API) { state.reviews = []; state.usingSeed = false; }
            state.reviews.push(review);
            paint();
            closeModal($("writeModal"));
            $("reviewForm").reset();
            $("rvRating").value = "0";
            $("starPicker").querySelectorAll(".rv-star").forEach(function (s) { s.classList.remove("active"); });
            btn.disabled = false;
            btn.textContent = "Submit Review";
            msg.textContent = "";
            toast(ok ? "Thank you! Your review is posted ❤" : "Posted locally — connect the backend to save it.");
        }

        if (!API) { onDone(false); return; }

        fetch(API, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: "add", review: review })
        })
            .then(function (r) { return r.json(); })
            .then(function () { onDone(true); })
            .catch(function () { onDone(false); });
    }

    // ---- Wire up ----
    function init() {
        if (!document.getElementById("reviews-section") && !document.querySelector(".reviews-section")) return;

        setupStarPicker();

        $("writeReviewBtn").addEventListener("click", function () { openModal($("writeModal")); });
        $("viewAllBtn").addEventListener("click", function () { renderAll(); openModal($("allModal")); });

        document.querySelectorAll(".rv-modal [data-close]").forEach(function (el) {
            el.addEventListener("click", function () { closeModal(el.closest(".rv-modal")); });
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                document.querySelectorAll(".rv-modal.open").forEach(closeModal);
            }
        });

        $("rvFilter").addEventListener("click", function (e) {
            var chip = e.target.closest(".rv-filter-chip");
            if (!chip) return;
            $("rvFilter").querySelectorAll(".rv-filter-chip").forEach(function (c) { c.classList.remove("active"); });
            chip.classList.add("active");
            state.filter = Number(chip.dataset.star);
            renderAll();
        });

        $("reviewForm").addEventListener("submit", submitReview);

        loadReviews();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
