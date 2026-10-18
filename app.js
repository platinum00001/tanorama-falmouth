(function () {
  var d = window.TANORAMA || {};
  var $ = function (id) { return document.getElementById(id); };
  var has = function (v) { return typeof v === "string" ? v.trim() !== "" : Array.isArray(v) && v.length > 0; };
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  $("year").textContent = new Date().getFullYear();

  // Booking: link out if a booking URL exists, otherwise call.
  if (has(d.bookingUrl)) {
    document.querySelectorAll(".js-book").forEach(function (a) {
      a.href = d.bookingUrl; a.target = "_blank"; a.rel = "noopener";
    });
    $("book-copy").textContent = "Book online, or give us a call.";
  }

  // Services & prices
  if (has(d.services)) {
    var list = $("services-list");
    d.services.forEach(function (g) {
      var card = el("article", "svc-group");
      if (g.group) card.appendChild(el("h3", null, g.group));
      var ul = el("ul", "svc-items");
      (g.items || []).forEach(function (it) {
        var li = el("li");
        var row = el("div", "svc-row");
        row.appendChild(el("span", "svc-name", it.name));
        row.appendChild(el("span", "svc-leader"));
        row.appendChild(el("span", "svc-price", it.price || "Call"));
        li.appendChild(row);
        if (it.note) li.appendChild(el("p", "svc-note", it.note));
        ul.appendChild(li);
      });
      card.appendChild(ul);
      list.appendChild(card);
    });
    $("services-fallback").textContent = "Questions about a service? Call (508) 495-9905.";
  }

  // Hours
  if (has(d.hours)) {
    var tb = $("hours-table").querySelector("tbody");
    d.hours.forEach(function (h) {
      var tr = el("tr");
      tr.appendChild(el("th", null, h.days)).setAttribute("scope", "row");
      tr.appendChild(el("td", null, h.hours));
      tb.appendChild(tr);
    });
    $("hours-table").hidden = false;
    $("hours-fallback").textContent = "Holiday hours may vary. Call (508) 495-9905 to confirm.";
  }

  // The board (reviews)
  if (has(d.reviews)) {
    var rl = $("reviews-list");
    d.reviews.forEach(function (r) {
      var fig = el("figure", "review");
      var bq = el("blockquote");
      bq.appendChild(el("p", null, "\u201C" + r.quote + "\u201D"));
      fig.appendChild(bq);
      var cap = [r.author, r.source].filter(Boolean).join(" \u00B7 ");
      if (cap) fig.appendChild(el("figcaption", null, cap));
      rl.appendChild(fig);
    });
  }

  // Email & social: shown only when filled in
  var show = function (id, href) { var a = $(id); if (!a) return; a.href = href; a.hidden = false; };
  if (has(d.email)) {
    show("email-link", "mailto:" + d.email); $("email-item").hidden = false;
    show("email-foot", "mailto:" + d.email);
  }
  if (has(d.instagram)) { show("ig-link", d.instagram); show("ig-foot", d.instagram); }
  if (has(d.facebook)) { show("fb-link", d.facebook); show("fb-foot", d.facebook); }
  if (has(d.instagram) || has(d.facebook)) $("follow").hidden = false;

  // Keep structured data in sync with filled-in fields
  try {
    var ld = JSON.parse($("ld-json").textContent);
    var same = [d.instagram, d.facebook].filter(has);
    if (same.length) ld.sameAs = same;
    if (has(d.email)) ld.email = d.email;
    $("ld-json").textContent = JSON.stringify(ld);
  } catch (e) {}
})();
