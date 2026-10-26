(function () {
  var cfg = window.TANORAMA_CONFIG || {};
  var defaults = window.TANORAMA || {};
  var $ = function (id) { return document.getElementById(id); };
  var all = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
  var str = function (v) { return typeof v === "string" ? v.trim() : ""; };
  var list = function (v) { return Array.isArray(v) ? v : []; };
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  var safeUrl = function (u) {
    u = str(u);
    return /^(https?:|mailto:|tel:)/i.test(u) ? u : "";
  };
  var telHref = function (phone) {
    var d = String(phone || "").replace(/\D/g, "");
    if (d.length === 10) d = "1" + d;
    return d ? "tel:+" + d : "";
  };
  // Put plain text in a node, turning the phone number into a tap-to-call link.
  var textWithPhone = function (node, text, phone) {
    node.textContent = "";
    var i = phone ? text.indexOf(phone) : -1;
    if (i < 0) { node.textContent = text; return; }
    node.appendChild(document.createTextNode(text.slice(0, i)));
    var a = el("a", null, phone); a.href = telHref(phone);
    node.appendChild(a);
    node.appendChild(document.createTextNode(text.slice(i + phone.length)));
  };

  function render(d) {
    var phone = str(d.phone) || "(508) 495-9905";
    var tel = telHref(phone);
    var address = [str(d.address_line1), str(d.address_line2)].filter(Boolean).join(", ");
    var dir = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(address);

    // Simple text fields
    all("[data-k]").forEach(function (n) {
      var v = d[n.getAttribute("data-k")];
      if (typeof v === "string") n.textContent = v;
    });
    $("year").textContent = new Date().getFullYear();

    all(".js-phone").forEach(function (n) { n.textContent = phone; });
    all(".js-tel").forEach(function (a) { a.href = tel; });
    all(".js-directions").forEach(function (a) { a.href = dir; });
    var map = $("map-frame");
    var mapSrc = "https://www.google.com/maps?q=" + encodeURIComponent(address) + "&output=embed";
    if (map && map.getAttribute("src") !== mapSrc) map.setAttribute("src", mapSrc);

    // Booking: link out if a booking URL exists, otherwise call.
    var book = safeUrl(d.bookingUrl);
    all(".js-book").forEach(function (a) {
      a.href = book || tel;
      if (book) { a.target = "_blank"; a.rel = "noopener"; } else { a.removeAttribute("target"); }
    });
    $("book-copy").textContent = book ? str(d.book_copy_online) : str(d.book_copy);

    // About facts
    var facts = $("facts"); facts.textContent = "";
    list(d.about_facts).forEach(function (f) {
      if (!str(f.value) && !str(f.label)) return;
      var li = el("li"); li.appendChild(el("strong", null, f.value)); li.appendChild(el("span", null, f.label));
      facts.appendChild(li);
    });
    facts.hidden = !facts.children.length;

    // Services & prices
    var svc = $("services-list"); svc.textContent = "";
    list(d.services).forEach(function (g) {
      var items = list(g.items).filter(function (it) { return str(it.name); });
      if (!items.length && !str(g.group)) return;
      var card = el("article", "svc-group");
      if (str(g.group)) card.appendChild(el("h3", null, g.group));
      var ul = el("ul", "svc-items");
      items.forEach(function (it) {
        var li = el("li"), row = el("div", "svc-row");
        row.appendChild(el("span", "svc-name", it.name));
        row.appendChild(el("span", "svc-leader"));
        row.appendChild(el("span", "svc-price", str(it.price) || "Call"));
        li.appendChild(row);
        if (str(it.note)) li.appendChild(el("p", "svc-note", it.note));
        ul.appendChild(li);
      });
      card.appendChild(ul); svc.appendChild(card);
    });
    textWithPhone($("services-fallback"), svc.children.length ? str(d.services_note) : str(d.services_empty), phone);
    $("services-fallback").hidden = !$("services-fallback").textContent;

    // Hours
    var rows = list(d.hours).filter(function (h) { return str(h.days) || str(h.hours); });
    var tb = $("hours-table").querySelector("tbody"); tb.textContent = "";
    rows.forEach(function (h) {
      var tr = el("tr"), th = el("th", null, h.days); th.setAttribute("scope", "row");
      tr.appendChild(th); tr.appendChild(el("td", null, h.hours)); tb.appendChild(tr);
    });
    $("hours-table").hidden = !rows.length;
    textWithPhone($("hours-fallback"), rows.length ? str(d.hours_note) : str(d.hours_empty), phone);
    $("hours-fallback").hidden = !$("hours-fallback").textContent;

    // The board
    var rl = $("reviews-list"); rl.textContent = "";
    list(d.reviews).forEach(function (r) {
      if (!str(r.quote)) return;
      var fig = el("figure", "review"), bq = el("blockquote");
      bq.appendChild(el("p", null, "\u201C" + str(r.quote) + "\u201D")); fig.appendChild(bq);
      var cap = [str(r.author), str(r.source)].filter(Boolean).join(" \u00B7 ");
      if (cap) fig.appendChild(el("figcaption", null, cap));
      rl.appendChild(fig);
    });
    var tl = $("theme-list"); tl.textContent = "";
    var icons = ["t-palm", "t-door", "t-sun"];
    list(d.board_themes).filter(str).forEach(function (t, i) {
      var li = el("li"), ic = el("span", "t-icon " + icons[i % 3]); ic.setAttribute("aria-hidden", "true");
      li.appendChild(ic); li.appendChild(el("strong", null, t)); tl.appendChild(li);
    });
    $("reviews-fallback").hidden = !tl.children.length;

    // Photos
    var setImg = function (slot, fig, img, art) {
      var u = slot && safeUrl(slot.url);
      $(fig).hidden = !u;
      if (u) { $(img).src = u; $(img).alt = str(slot.alt); }
      if (art) $(art).hidden = !!u;
    };
    setImg(d.hero_image, "hero-photo", "hero-img", "hero-art");
    setImg(d.about_image, "about-photo", "about-img");
    var gg = $("gallery-grid"); gg.textContent = "";
    list(d.gallery).forEach(function (g) {
      var u = g && safeUrl(g.url); if (!u) return;
      var f = el("figure", "gallery-item"), im = el("img"); im.src = u; im.alt = str(g.alt); im.loading = "lazy";
      f.appendChild(im); gg.appendChild(f);
    });
    $("gallery").hidden = !gg.children.length;

    // Email & social: shown only when filled in
    var show = function (id, href) { var a = $(id); if (!a) return; a.hidden = !href; if (href) a.href = href; };
    var mail = str(d.email) && /@/.test(d.email) ? "mailto:" + str(d.email) : "";
    show("email-link", mail); $("email-item").hidden = !mail; show("email-foot", mail);
    var ig = safeUrl(d.instagram), fb = safeUrl(d.facebook);
    show("ig-link", ig); show("ig-foot", ig); show("fb-link", fb); show("fb-foot", fb);
    $("follow").hidden = !(ig || fb);

    // Structured data
    try {
      var ld = JSON.parse($("ld-json").textContent);
      ld.telephone = tel.replace("tel:", "");
      ld.address.streetAddress = str(d.address_line1) || ld.address.streetAddress;
      var same = [ig, fb].filter(Boolean);
      if (same.length) ld.sameAs = same; else delete ld.sameAs;
      if (mail) ld.email = str(d.email); else delete ld.email;
      $("ld-json").textContent = JSON.stringify(ld);
    } catch (e) {}
  }

  render(defaults);

  // Load the latest content from the online editor. If it can't be reached,
  // the backup content above stays on the page.
  if (cfg.supabaseUrl && cfg.supabaseKey && window.fetch) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 5000);
    fetch(cfg.supabaseUrl + "/rest/v1/" + cfg.table + "?select=key,value", {
      headers: { apikey: cfg.supabaseKey },
      cache: "no-store",
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (rows) {
      clearTimeout(timer);
      if (!Array.isArray(rows) || !rows.length) return;
      var d = {};
      for (var k in defaults) d[k] = defaults[k];
      rows.forEach(function (row) { if (row && row.key in defaults) d[row.key] = row.value; });
      render(d);
      document.documentElement.setAttribute("data-content", "live");
    }).catch(function () {
      clearTimeout(timer);
      document.documentElement.setAttribute("data-content", "backup");
    });
  }
})();
