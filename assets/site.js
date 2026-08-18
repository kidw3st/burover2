/* Авторитет права: скелетоны фото, появление при прокрутке, меню, галерея */
(function () {
  "use strict";

  /* Скелетоны: фото проявляется после загрузки */
  function watchMedia(scope) {
    scope.querySelectorAll(".media img").forEach(function (img) {
      var media = img.closest(".media");
      if (!media || media.classList.contains("loaded")) return;
      if (img.complete && img.naturalWidth > 0) {
        media.classList.add("loaded");
      } else {
        img.addEventListener("load", function () { media.classList.add("loaded"); }, { once: true });
        img.addEventListener("error", function () { media.classList.add("loaded"); }, { once: true });
      }
    });
  }
  watchMedia(document);

  /* Появление при прокрутке */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealed = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    revealed.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealed.forEach(function (el) { io.observe(el); });
  }

  /* Логотип в шапке ведёт на самый верх */
  var brand = document.querySelector(".site-head .brand");
  if (brand && brand.getAttribute("href") === "#top") {
    brand.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0 });
    });
  }

  /* Мобильное меню */
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("mobile-menu");
  if (burger && menu) {
    function setMenu(open) {
      menu.hidden = !open;
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    }
    burger.addEventListener("click", function () { setMenu(menu.hidden); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) setMenu(false);
    });
  }

  /* Кнопка прокрутки наверх: скрыта, пока виден первый экран */
  var toTop = document.getElementById("to-top");
  if (toTop) {
    var hero = document.querySelector(".hero");
    function syncToTop() {
      toTop.hidden = window.scrollY <= window.innerHeight;
    }
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        toTop.hidden = entries[0].isIntersecting;
      }).observe(hero);
    } else {
      window.addEventListener("scroll", syncToTop, { passive: true });
      syncToTop();
    }
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0 });
    });
  }

  /* Папки с обязательной информацией: лист вылетает поверх экрана */
  var modal = document.getElementById("paper-modal");
  if (modal) {
    var sheet = modal.querySelector(".paper-sheet");
    var modalTitle = modal.querySelector(".paper-title");
    var modalBody = modal.querySelector(".paper-body");
    var activeDossier = null;
    var closing = false;

    function sheetTransformFrom(dossier) {
      var slot = dossier.querySelector(".folder-sheet").getBoundingClientRect();
      var to = sheet.getBoundingClientRect();
      var dx = slot.left + slot.width / 2 - (to.left + to.width / 2);
      var dy = slot.top + slot.height / 2 - (to.top + to.height / 2);
      var sx = Math.max(slot.width / to.width, 0.1);
      var sy = Math.max(slot.height / to.height, 0.05);
      return "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")";
    }

    function openPaper(dossier) {
      activeDossier = dossier;
      var btn = dossier.querySelector(".folder");
      modalTitle.textContent = dossier.querySelector(".folder-title").textContent;
      var src = dossier.querySelector(".paper p:not(.paper-head)");
      modalBody.innerHTML = "";
      if (src) modalBody.appendChild(src.cloneNode(true));
      dossier.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      modal.hidden = false;
      document.body.classList.add("modal-open");
      if (reduced) { modal.classList.add("in"); return; }
      sheet.style.transition = "none";
      sheet.style.transform = sheetTransformFrom(dossier);
      sheet.style.opacity = "0.35";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          sheet.style.transition = "";
          sheet.style.transform = "";
          sheet.style.opacity = "";
          modal.classList.add("in");
        });
      });
    }

    function closePaper() {
      if (!activeDossier || closing) return;
      var dossier = activeDossier;
      var finish = function () {
        modal.hidden = true;
        modal.classList.remove("in");
        sheet.style.transform = "";
        sheet.style.opacity = "";
        document.body.classList.remove("modal-open");
        dossier.classList.remove("open");
        dossier.querySelector(".folder").setAttribute("aria-expanded", "false");
        activeDossier = null;
        closing = false;
      };
      if (reduced) { finish(); return; }
      closing = true;
      modal.classList.remove("in");
      sheet.style.transform = sheetTransformFrom(dossier);
      sheet.style.opacity = "0.3";
      setTimeout(finish, 480);
    }

    document.querySelectorAll(".dossier .folder").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (modal.hidden) openPaper(btn.closest(".dossier"));
      });
    });
    modal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closePaper);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) closePaper();
    });
  }

  /* Галерея: показать все фотографии */
  var moreBtn = document.getElementById("show-more");
  if (moreBtn) {
    moreBtn.addEventListener("click", function () {
      document.querySelectorAll("#obshestvo-mosaic figure[hidden]").forEach(function (fig) {
        fig.hidden = false;
      });
      watchMedia(document.getElementById("obshestvo-mosaic"));
      moreBtn.parentElement.remove();
    });
  }
})();
