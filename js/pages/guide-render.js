/**
 * guide-render.js — V7.2: دليل الاستخدام (عرض موحّد للغات الثلاث)
 * المحتوى في data/guide-<lang>.json (مصفوفة: العنصر N-1 = الأداة N) ويستخدمه أيضاً المساعد الذكي داخل الأدوات.
 * يدعم: البحث في الاسم والمحتوى، الطي/الفتح، فتح أداة محددة عبر #toolN، وزر "افتح الأداة".
 */
(function () {
  "use strict";
  var lang = document.documentElement.getAttribute("data-guide-lang") || "ar";
  var L = {
    ar: { open: "افتح الأداة", expand: "فتح الكل", collapse: "طي الكل", loading: "جارٍ تحميل الدليل...", err: "تعذّر تحميل الدليل. تحقق من الاتصال وأعد المحاولة." },
    en: { open: "Open the tool", expand: "Expand all", collapse: "Collapse all", loading: "Loading the guide...", err: "The guide could not be loaded. Check your connection and try again." },
    tr: { open: "Aracı aç", expand: "Tümünü aç", collapse: "Tümünü kapat", loading: "Kılavuz yükleniyor...", err: "Kılavuz yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin." }
  }[lang];
  var container = document.getElementById("toolsContainer");
  var searchInput = document.getElementById("searchInput");
  var noResults = document.getElementById("noResults");
  var tools = [];

  function norm(s) {
    return String(s || "").toLowerCase()
      .replace(/[\u064B-\u0652\u0640]/g, "")          // تشكيل وتطويل
      .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
      .replace(/ı/g, "i").replace(/İ/g, "i");
  }
  function plain(html) { var d = document.createElement("div"); d.innerHTML = html; return d.textContent || ""; }

  function render(filter) {
    var q = norm(filter.trim());
    var list = tools.filter(function (t) { return !q || t._name.indexOf(q) !== -1 || t._text.indexOf(q) !== -1; });
    container.innerHTML = "";
    noResults.style.display = list.length ? "none" : "block";
    list.forEach(function (tool, index) {
      var card = document.createElement("div");
      card.className = "tool-card";
      card.id = tool.tool;
      var header = document.createElement("button");
      header.type = "button";
      header.className = "collapsible-header";
      header.setAttribute("aria-expanded", "false");
      header.innerHTML = '<h2><span class="tool-num">' + tool.tool.replace("tool", "") + '</span><i class="fas ' + tool.icon + '"></i> ' + tool.name + '</h2><i class="fas fa-chevron-down toggle-icon"></i>';
      var content = document.createElement("div");
      content.className = "tool-content";
      content.innerHTML = tool.content +
        '<p class="open-tool"><a href="tools/' + tool.tool + '.html"><i class="fas fa-arrow-up-right-from-square"></i> ' + L.open + "</a></p>";
      header.addEventListener("click", function () {
        var open = content.classList.toggle("open");
        header.querySelector(".toggle-icon").classList.toggle("open", open);
        header.setAttribute("aria-expanded", open ? "true" : "false");
      });
      var hashOpen = location.hash === "#" + tool.tool;
      if ((index === 0 && !q && !location.hash) || hashOpen || (q && list.length <= 3)) {
        content.classList.add("open"); header.querySelector(".toggle-icon").classList.add("open"); header.setAttribute("aria-expanded", "true");
      }
      card.appendChild(header);
      card.appendChild(content);
      container.appendChild(card);
    });
    if (location.hash && !q) { var el = document.querySelector(location.hash); if (el) setTimeout(function () { el.scrollIntoView({ block: "start" }); }, 50); }
  }

  function toggleAll(open) {
    container.querySelectorAll(".tool-card").forEach(function (c) {
      c.querySelector(".tool-content").classList.toggle("open", open);
      c.querySelector(".toggle-icon").classList.toggle("open", open);
      c.querySelector(".collapsible-header").setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  var ex = document.getElementById("expandAll"), co = document.getElementById("collapseAll");
  if (ex) { ex.textContent = L.expand; ex.addEventListener("click", function () { toggleAll(true); }); }
  if (co) { co.textContent = L.collapse; co.addEventListener("click", function () { toggleAll(false); }); }

  searchInput.addEventListener("input", function (e) { render(e.target.value); });
  container.innerHTML = '<div class="no-results" style="display:block"><i class="fas fa-circle-notch fa-spin"></i> ' + L.loading + "</div>";
  fetch("data/guide-" + lang + ".json").then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (arr) {
    tools = arr.map(function (t) { t._name = norm(t.name); t._text = norm(plain(t.content)); return t; });
    render(searchInput.value || "");
  }).catch(function () {
    container.innerHTML = '<div class="no-results" style="display:block"><i class="fas fa-exclamation-circle"></i> ' + L.err + "</div>";
  });
})();
