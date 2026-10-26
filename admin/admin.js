(function () {
  "use strict";
  var cfg = window.TANORAMA_CONFIG;
  var DEFAULTS = window.TANORAMA;
  var EDITOR_EMAIL = "editor@tanorama.local"; // filled in behind the scenes; Scott only types the password
  var sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
    auth: { storageKey: "tanorama-editor-auth", persistSession: true, autoRefreshToken: true }
  });
  var $ = function (id) { return document.getElementById(id); };
  var state = clone(DEFAULTS);
  var dirty = false;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in (attrs || {})) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "on") for (var ev in attrs.on) n.addEventListener(ev, attrs.on[ev]);
      else if (attrs[k] !== undefined && attrs[k] !== null && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  var uid = 0; function nid() { return "f" + (++uid); }

  // ---------- views ----------
  function show(view) {
    $("boot").hidden = true;
    $("login-view").hidden = view !== "login";
    $("editor-view").hidden = view !== "editor";
  }

  // ---------- login ----------
  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("login-btn"), err = $("login-error");
    err.hidden = true; btn.disabled = true; btn.textContent = "Checking…";
    sb.auth.signInWithPassword({ email: EDITOR_EMAIL, password: $("password").value }).then(function (res) {
      btn.disabled = false; btn.textContent = "Log in";
      if (res.error) {
        err.textContent = /invalid/i.test(res.error.message) ? "That password didn’t work. Please try again." : "Couldn’t log in right now. Check your internet connection and try again.";
        err.hidden = false; $("password").select(); return;
      }
      $("password").value = "";
      openEditor();
    });
  });
  $("logout-btn").addEventListener("click", function () {
    if (dirty && !confirm("You have changes that aren’t saved. Log out anyway?")) return;
    sb.auth.signOut().then(function () { dirty = false; show("login"); });
  });

  // ---------- load ----------
  function openEditor() {
    $("boot").hidden = false; $("boot").textContent = "Loading your website…";
    sb.from(cfg.table).select("key,value").then(function (res) {
      state = clone(DEFAULTS);
      if (!res.error && res.data) res.data.forEach(function (r) { if (r.key in DEFAULTS) state[r.key] = r.value; });
      buildForm(); setDirty(false); show("editor");
      if (res.error) status("Couldn’t load the latest content. Showing the backup copy.", true);
    });
  }

  // ---------- save ----------
  function rowsFor(keys) {
    return keys.map(function (k) { return { key: k, value: state[k] === undefined ? null : state[k] }; });
  }
  function persist(keys) {
    return sb.from(cfg.table).upsert(rowsFor(keys), { onConflict: "key" }).then(function (res) {
      if (res.error) throw res.error; return res;
    });
  }
  function status(msg, warn) { $("save-status").textContent = msg; $("save-status").parentNode.classList.toggle("dirty", !!warn); }
  function setDirty(v) { dirty = v; status(v ? "You have unsaved changes." : "All changes saved.", v); }
  function explain(err) {
    var m = (err && (err.message || err.error)) || "";
    if (/JWT|expired|row-level|401|403|permission/i.test(m)) return "You’ve been logged out. Log in again, then save.";
    return "Couldn’t save. Check your internet connection and try again.";
  }
  $("save-btn").addEventListener("click", function () {
    var b = $("save-btn"); b.disabled = true; b.textContent = "Saving…";
    persist(Object.keys(DEFAULTS)).then(function () {
      setDirty(false); status("Saved. Your website is updated.");
    }).catch(function (e) { status(explain(e), true); }).then(function () { b.disabled = false; b.textContent = "Save changes"; });
  });
  window.addEventListener("beforeunload", function (e) { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  // ---------- form schema ----------
  var T = function (key, label, hint) { return { type: "text", key: key, label: label, hint: hint }; };
  var A = function (key, label, hint) { return { type: "textarea", key: key, label: label, hint: hint }; };
  var U = function (key, label, hint) { return { type: "url", key: key, label: label, hint: hint }; };
  var SECTIONS = [
    { title: "Top of the page", fields: [
      T("hero_claim", "Badge above the headline"),
      T("hero_title_lead", "Headline (first part)"),
      T("hero_title_em", "Headline (highlighted word)"),
      T("hero_subline", "Line under the headline"),
      T("hero_door", "Short welcome line"),
      T("hero_neighborhood", "Neighborhood shown next to the address"),
      T("book_button", "Words on the Book buttons"),
      { type: "image", key: "hero_image", label: "Top photo", hint: "Shown at the top of the page. With no photo, the site shows the sun-and-waves artwork." }
    ]},
    { title: "About the salon", fields: [
      T("about_kicker", "Small label"),
      T("about_title", "Heading"),
      A("about_body", "Paragraph"),
      { type: "image", key: "about_image", label: "About photo", hint: "Optional. Shown under the heading." },
      { type: "list", key: "about_facts", label: "Number boxes", add: "Add a number box", item: "Number box",
        cols: 2, sub: [{ k: "value", label: "Big number or words", ph: "30+" }, { k: "label", label: "Small words under it", ph: "years for Scott" }] }
    ]},
    { title: "Hours", note: "If you list no hours, the site asks people to call.", fields: [
      { type: "list", key: "hours", label: "Opening hours", add: "Add a line", item: "Line",
        cols: 2, sub: [{ k: "days", label: "Day or days", ph: "Monday – Friday" }, { k: "hours", label: "Hours", ph: "9:00 AM – 8:00 PM" }] },
      T("hours_kicker", "Small label"),
      T("hours_title", "Heading"),
      T("hours_subtitle", "Line under the heading"),
      A("hours_empty", "Message when no hours are listed"),
      A("hours_note", "Note under the hours", "For example, holiday hours.")
    ]},
    { title: "Services & prices", note: "Group your services (for example “Tanning beds”, “Spray tans”). If you list none, the site asks people to call.", fields: [
      { type: "services", key: "services" },
      T("services_kicker", "Small label"),
      T("services_title", "Heading"),
      A("services_empty", "Message when no services are listed"),
      A("services_note", "Note under the price list")
    ]},
    { title: "The board (reviews)", note: "Copy each review word for word, and put who wrote it and where (Google, Yelp, Facebook).", fields: [
      { type: "list", key: "reviews", label: "Reviews", add: "Add a review", item: "Review",
        sub: [{ k: "quote", label: "Review (exact words)", area: true }, { k: "author", label: "Name", ph: "First name and last initial" }, { k: "source", label: "Where it was posted", ph: "Google" }] },
      T("board_kicker", "Small label"),
      T("board_title", "Heading"),
      T("board_intro", "Line above the highlights"),
      { type: "strings", key: "board_themes", label: "What reviewers mention", add: "Add a highlight", item: "Highlight" }
    ]},
    { title: "Photo gallery", note: "Add photos of the salon. With no photos, this part of the site is hidden.", fields: [
      { type: "gallery", key: "gallery", label: "Gallery photos" },
      T("gallery_kicker", "Small label"),
      T("gallery_title", "Heading")
    ]},
    { title: "Booking", fields: [
      U("bookingUrl", "Online booking link", "Paste the web address of your booking page. Leave empty and the Book buttons will call the salon."),
      T("book_title", "Booking banner heading"),
      T("book_copy", "Banner text (when there’s no booking link)"),
      T("book_copy_online", "Banner text (when there is a booking link)")
    ]},
    { title: "Contact & location", fields: [
      T("phone", "Phone number", "Every Call button uses this number."),
      { type: "email", key: "email", label: "Email address", hint: "Leave empty to hide the Email button." },
      T("address_line1", "Street address"),
      T("address_line2", "Town, state, ZIP", "The map and Directions buttons use the address."),
      T("cross_street", "Directions hint"),
      T("visit_kicker", "Small label"),
      T("visit_title", "Heading")
    ]},
    { title: "Social media", note: "Paste the full web address of each page. Leave empty to hide that button.", fields: [
      U("instagram", "Instagram page"),
      U("facebook", "Facebook page"),
      T("follow_title", "Heading over the buttons")
    ]},
    { title: "Name & footer", fields: [
      T("brand_name", "Name in the top corner"),
      T("brand_place", "Small word next to the name"),
      T("footer_tagline", "Footer tagline"),
      T("footer_copyright", "Name after the © sign")
    ]}
  ];

  // ---------- form builders ----------
  function field(label, input, hint, id) {
    return h("div", { class: "field" }, [h("label", { for: id, text: label }), hint ? h("p", { class: "hint", text: hint }) : null, input]);
  }
  function textInput(get, set, opts) {
    opts = opts || {};
    var id = nid();
    var inp = opts.area ? h("textarea", { id: id, placeholder: opts.ph }) : h("input", { id: id, type: opts.kind || "text", placeholder: opts.ph, inputmode: opts.kind === "url" ? "url" : null, autocapitalize: opts.kind ? "off" : null });
    inp.value = get() || "";
    inp.addEventListener("input", function () { set(inp.value); setDirty(true); });
    if (opts.kind === "url") inp.addEventListener("blur", function () {
      var v = inp.value.trim();
      if (v && !/^https?:\/\//i.test(v)) { v = "https://" + v.replace(/^\/+/, ""); inp.value = v; set(v); setDirty(true); }
    });
    return { id: id, el: inp };
  }
  function simple(f) {
    var kind = f.type === "url" ? "url" : f.type === "email" ? "email" : null;
    var t = textInput(function () { return state[f.key]; }, function (v) { state[f.key] = v; }, { area: f.type === "textarea", kind: kind });
    return field(f.label, t.el, f.hint, t.id);
  }
  function moveBtns(arr, i, rerender) {
    var up = h("button", { type: "button", class: "icon-btn", "aria-label": "Move up", text: "↑", on: { click: function () { if (i > 0) { var x = arr.splice(i, 1)[0]; arr.splice(i - 1, 0, x); setDirty(true); rerender(); } } } });
    var down = h("button", { type: "button", class: "icon-btn", "aria-label": "Move down", text: "↓", on: { click: function () { if (i < arr.length - 1) { var x = arr.splice(i, 1)[0]; arr.splice(i + 1, 0, x); setDirty(true); rerender(); } } } });
    var rm = h("button", { type: "button", class: "icon-btn remove", text: "Remove", on: { click: function () { if (confirm("Remove this?")) { arr.splice(i, 1); setDirty(true); rerender(); } } } });
    return h("div", { class: "row-actions" }, [up, down, rm]);
  }
  function listEditor(f) {
    if (!Array.isArray(state[f.key])) state[f.key] = [];
    var wrap = h("div", { class: "field" });
    function render() {
      var arr = state[f.key]; wrap.textContent = "";
      wrap.appendChild(h("p", { class: "label", text: f.label }));
      var box = h("div", { class: "list" });
      if (!arr.length) box.appendChild(h("p", { class: "hint", text: "Nothing here yet." }));
      arr.forEach(function (obj, i) {
        var grid = h("div", { class: "item-grid" + (f.cols ? " cols-" + f.cols : "") });
        f.sub.forEach(function (s) {
          var t = textInput(function () { return obj[s.k]; }, function (v) { obj[s.k] = v; }, { area: s.area, ph: s.ph });
          grid.appendChild(field(s.label, t.el, null, t.id));
        });
        box.appendChild(h("div", { class: "item" }, [h("div", { class: "item-head" }, [h("span", { class: "label", text: f.item + " " + (i + 1) }), moveBtns(arr, i, render)]), grid]));
      });
      wrap.appendChild(box);
      wrap.appendChild(h("button", { type: "button", class: "btn btn-ghost btn-small", text: "+ " + f.add, on: { click: function () {
        var o = {}; f.sub.forEach(function (s) { o[s.k] = ""; }); arr.push(o); setDirty(true); render();
        var ins = wrap.querySelectorAll(".item:last-of-type input, .item:last-of-type textarea"); if (ins[0]) ins[0].focus();
      } } }));
    }
    render(); return wrap;
  }
  function stringsEditor(f) {
    if (!Array.isArray(state[f.key])) state[f.key] = [];
    var wrap = h("div", { class: "field" });
    function render() {
      var arr = state[f.key]; wrap.textContent = "";
      wrap.appendChild(h("p", { class: "label", text: f.label }));
      var box = h("div", { class: "list" });
      arr.forEach(function (s, i) {
        var t = textInput(function () { return arr[i]; }, function (v) { arr[i] = v; });
        t.el.setAttribute("aria-label", f.item + " " + (i + 1));
        box.appendChild(h("div", { class: "item" }, [h("div", { class: "item-head" }, [h("span", { class: "label", text: f.item + " " + (i + 1) }), moveBtns(arr, i, render)]), t.el]));
      });
      wrap.appendChild(box);
      wrap.appendChild(h("button", { type: "button", class: "btn btn-ghost btn-small", text: "+ " + f.add, on: { click: function () { arr.push(""); setDirty(true); render(); } } }));
    }
    render(); return wrap;
  }
  function servicesEditor() {
    if (!Array.isArray(state.services)) state.services = [];
    var wrap = h("div", { class: "field" });
    function render() {
      var groups = state.services; wrap.textContent = "";
      wrap.appendChild(h("p", { class: "label", text: "Price list" }));
      var box = h("div", { class: "list" });
      if (!groups.length) box.appendChild(h("p", { class: "hint", text: "No services listed yet. Add a group to start." }));
      groups.forEach(function (g, gi) {
        if (!Array.isArray(g.items)) g.items = [];
        var gt = textInput(function () { return g.group; }, function (v) { g.group = v; }, { ph: "Tanning beds" });
        var subs = h("div", { class: "subitems" });
        g.items.forEach(function (it, ii) {
          var grid = h("div", { class: "item-grid cols-3" });
          [["name", "Service", "Single session"], ["price", "Price", "$"], ["note", "Note (optional)", ""]].forEach(function (s) {
            var t = textInput(function () { return it[s[0]]; }, function (v) { it[s[0]] = v; }, { ph: s[2] });
            grid.appendChild(field(s[1], t.el, null, t.id));
          });
          subs.appendChild(h("div", { class: "item" }, [h("div", { class: "item-head" }, [h("span", { class: "label", text: "Service " + (ii + 1) }), moveBtns(g.items, ii, render)]), grid]));
        });
        subs.appendChild(h("button", { type: "button", class: "btn btn-ghost btn-small", text: "+ Add a service", on: { click: function () { g.items.push({ name: "", price: "", note: "" }); setDirty(true); render(); } } }));
        box.appendChild(h("div", { class: "item" }, [h("div", { class: "item-head" }, [h("span", { class: "label", text: "Group " + (gi + 1) }), moveBtns(groups, gi, render)]), field("Group name", gt.el, null, gt.id), subs]));
      });
      wrap.appendChild(box);
      wrap.appendChild(h("button", { type: "button", class: "btn btn-ghost btn-small", text: "+ Add a group", on: { click: function () { groups.push({ group: "", items: [{ name: "", price: "", note: "" }] }); setDirty(true); render(); } } }));
    }
    render(); return wrap;
  }

  // ---------- photos ----------
  function shrink(file) {
    // Phone photos can be huge; resize to at most 2000px wide/tall as JPEG.
    return new Promise(function (resolve) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return resolve(file);
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 2000, w = img.naturalWidth, hh = img.naturalHeight, s = Math.min(1, max / Math.max(w, hh));
        if (s === 1 && file.size < 1.5e6) { URL.revokeObjectURL(url); return resolve(file); }
        var c = document.createElement("canvas"); c.width = Math.round(w * s); c.height = Math.round(hh * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { URL.revokeObjectURL(url); resolve(b ? new File([b], "photo.jpg", { type: "image/jpeg" }) : file); }, "image/jpeg", 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }
  function upload(folder, file) {
    return shrink(file).then(function (f) {
      var ext = f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : f.type === "image/gif" ? "gif" : "jpg";
      var path = folder + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      return sb.storage.from(cfg.bucket).upload(path, f, { contentType: f.type, upsert: false }).then(function (res) {
        if (res.error) throw res.error;
        return { url: sb.storage.from(cfg.bucket).getPublicUrl(path).data.publicUrl, path: path, alt: "" };
      });
    });
  }
  function removeFile(slot) {
    if (!slot || !slot.path) return Promise.resolve();
    return sb.storage.from(cfg.bucket).remove([slot.path]).then(function (res) { if (res.error) throw res.error; });
  }
  function fileButton(text, onFile) {
    var inp = h("input", { type: "file", accept: "image/jpeg,image/png,image/webp,image/gif", "aria-label": text });
    inp.addEventListener("change", function () { var f = inp.files && inp.files[0]; inp.value = ""; if (f) onFile(f); });
    return h("span", { class: "btn btn-navy btn-small file-btn" }, [text, inp]);
  }
  function busy(msg) { status(msg, true); }
  function imageSlot(f) {
    var wrap = h("div", { class: "field slot" });
    function render() {
      var slot = state[f.key]; wrap.textContent = "";
      wrap.appendChild(h("p", { class: "label", text: f.label }));
      if (f.hint) wrap.appendChild(h("p", { class: "hint", text: f.hint }));
      wrap.appendChild(h("div", { class: "slot-preview" }, [slot && slot.url ? h("img", { src: slot.url, alt: "" }) : h("span", { text: "No photo. The sun-and-waves artwork shows here." })]));
      var actions = h("div", { class: "row-actions" });
      actions.appendChild(fileButton(slot && slot.url ? "Replace photo" : "Upload photo", function (file) {
        busy("Uploading photo…");
        var old = state[f.key];
        upload(f.key, file).then(function (n) {
          n.alt = (old && old.alt) || ""; state[f.key] = n;
          return persist([f.key]).then(function () { return removeFile(old).catch(function () {}); });
        }).then(function () { render(); status(dirty ? "Photo saved. You still have other unsaved changes." : "Photo saved. Your website is updated.", dirty); })
          .catch(function (e) { state[f.key] = old; render(); status(explain(e), true); });
      }));
      if (slot && slot.url) {
        actions.appendChild(h("button", { type: "button", class: "btn btn-danger btn-small", text: "Remove photo", on: { click: function () {
          if (!confirm("Remove this photo from the website?")) return;
          busy("Removing photo…");
          var old = state[f.key]; state[f.key] = null;
          persist([f.key]).then(function () { return removeFile(old).catch(function () {}); })
            .then(function () { render(); status("Photo removed."); })
            .catch(function (e) { state[f.key] = old; render(); status(explain(e), true); });
        } } }));
        var t = textInput(function () { return slot.alt; }, function (v) { slot.alt = v; }, { ph: "e.g. Private tanning room" });
        wrap.appendChild(actions);
        wrap.appendChild(field("Describe the photo (for people using screen readers)", t.el, "Then tap Save changes.", t.id));
        return;
      }
      wrap.appendChild(actions);
    }
    render(); return wrap;
  }
  function galleryEditor(f) {
    if (!Array.isArray(state.gallery)) state.gallery = [];
    var wrap = h("div", { class: "field" });
    function render() {
      var arr = state.gallery; wrap.textContent = "";
      wrap.appendChild(h("p", { class: "label", text: f.label }));
      var grid = h("div", { class: "gallery-list" });
      arr.forEach(function (g, i) {
        var t = textInput(function () { return g.alt; }, function (v) { g.alt = v; }, { ph: "Describe the photo" });
        t.el.setAttribute("aria-label", "Description for photo " + (i + 1));
        grid.appendChild(h("div", { class: "item slot" }, [
          h("div", { class: "slot-preview" }, [h("img", { src: g.url, alt: "" })]), t.el,
          h("button", { type: "button", class: "icon-btn remove", text: "Remove", on: { click: function () {
            if (!confirm("Remove this photo from the website?")) return;
            busy("Removing photo…");
            var removed = arr.splice(i, 1)[0];
            persist(["gallery"]).then(function () { return removeFile(removed).catch(function () {}); })
              .then(function () { render(); status("Photo removed."); })
              .catch(function (e) { arr.splice(i, 0, removed); render(); status(explain(e), true); });
          } } })
        ]));
      });
      if (!arr.length) wrap.appendChild(h("p", { class: "hint", text: "No gallery photos yet." }));
      wrap.appendChild(grid);
      wrap.appendChild(fileButton("+ Add a photo", function (file) {
        busy("Uploading photo…");
        upload("gallery", file).then(function (n) {
          arr.push(n); return persist(["gallery"]);
        }).then(function () { render(); status("Photo added. Your website is updated."); })
          .catch(function (e) { render(); status(explain(e), true); });
      }));
    }
    render(); return wrap;
  }

  function buildForm() {
    var form = $("editor-form"); form.textContent = "";
    SECTIONS.forEach(function (sec) {
      var fs = h("fieldset", {}, [h("legend", { text: sec.title }), sec.note ? h("p", { class: "sec-note", text: sec.note }) : null]);
      sec.fields.forEach(function (f) {
        var node = f.type === "list" ? listEditor(f) : f.type === "strings" ? stringsEditor(f) : f.type === "services" ? servicesEditor(f)
          : f.type === "image" ? imageSlot(f) : f.type === "gallery" ? galleryEditor(f) : simple(f);
        fs.appendChild(node);
      });
      form.appendChild(fs);
    });
  }

  // ---------- start ----------
  sb.auth.getSession().then(function (res) {
    if (res.data && res.data.session) openEditor(); else show("login");
  });
})();
