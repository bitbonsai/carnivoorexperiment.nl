// ../../.bun/install/global/node_modules/nuekit/src/browser/view-transitions.js
function $(query, root = document) {
  return root.querySelector(query);
}
function $$(query, root = document) {
  return [...root.querySelectorAll(query)];
}
var scrollPos = {};
async function loadPage(path, replace_state) {
  dispatchEvent(new Event("before:route"));
  scrollPos[location.pathname] = window.scrollY;
  if (!replace_state)
    history.pushState({ path }, 0, path);
  const dom = mkdom(await getHTML(path));
  const title = $("title", dom)?.textContent;
  if (title)
    document.title = title;
  const query = '[name="nue:components"]';
  $(query).content = $(query, dom).content;
  for (const script of $$("script[src]", dom)) {
    await import(script.getAttribute("src"));
  }
  const css_paths = updateStyles(dom);
  loadCSS(css_paths, () => {
    const ignore_main = simpleDiff($("main"), $("main", dom));
    simpleDiff($("body"), $("body2", dom), ignore_main);
    const { hash } = location;
    const el = hash && $(hash);
    scrollTo(0, el ? el.offsetTop - parseInt(getComputedStyle(el).scrollMarginTop) || 0 : 0);
    dispatchEvent(new Event("route"));
    const [_, app] = location.pathname.split("/");
    dispatchEvent(new Event(`route:${app || "home"}`));
    setActive(path);
  });
}
function onclick(root, fn) {
  root.addEventListener("click", (e) => {
    const el = e.target.closest("[href]");
    const path = el?.getAttribute("href");
    const target = el?.getAttribute("target");
    const name = path?.split("/")?.pop()?.split(/[#?]/)?.shift();
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !path || path[0] == "#" || path?.includes("//") || path?.startsWith("mailto:") || name?.includes(".") && !name?.endsWith(".html") || !!target)
      return;
    if (path != location.pathname)
      fn(path, el);
    e.preventDefault();
  });
}
function toRelative(path) {
  const curr = location.pathname;
  return curr.slice(0, curr.lastIndexOf("/") + 1) + path;
}
function setActive(path, attrname = "aria-selected") {
  if (path[0] != "/")
    path = toRelative(path);
  $$(`[${attrname}]`).forEach((el) => el.removeAttribute(attrname));
  $$("a").forEach((el) => {
    if (!el.hash && el.pathname == path) {
      setTimeout(() => el.setAttribute(attrname, ""), 50);
    }
  });
}
var is_browser = typeof window == "object";
if (is_browser) {
  if (!document.startViewTransition) {
    document.startViewTransition = (fn) => fn();
  }
  history.pushState({ path: location.pathname }, 0);
  onclick(document, async (path, el) => {
    const img = $("img", el);
    if (img)
      img.style.viewTransitionName = "active-image";
    document.startViewTransition(async () => {
      await loadPage(path);
    });
  });
  setActive(location.pathname);
  addEventListener("popstate", (e) => {
    const { path } = e.state || {};
    if (path) {
      const pos = scrollPos[path];
      document.startViewTransition(async () => {
        await loadPage(path, true);
        setTimeout(() => window.scrollTo(0, pos || 0), 10);
      });
    }
  });
}
function simpleDiff(a, b, ignore_main) {
  a.classList.value = b.classList.value;
  if (a.children.length == b.children.length) {
    [...a.children].forEach((el, i) => {
      if (!(ignore_main && el.tagName == "MAIN"))
        updateBlock(el, b.children[i]);
    });
    return true;
  } else {
    a.innerHTML = b.innerHTML;
  }
}
function updateBlock(a, b) {
  const orig = a.outerHTML.replace(' aria-selected=""', "");
  if (orig != b.outerHTML)
    a.replaceWith(b.cloneNode(true));
}
function updateStyles(dom) {
  const orig = $$("link, style");
  const new_styles = swapStyles(orig, $$("link, style", dom));
  new_styles.forEach((style) => $("head").appendChild(style));
  updateProductionStyles(dom);
  return new_styles.filter((el) => el.tagName == "link");
}
function hasStyle(sheet, sheets) {
  return sheets.find((el) => el.getAttribute("href") == sheet.getAttribute("href"));
}
function swapStyles(orig, styles) {
  orig.forEach((el, i) => el.disabled = !hasStyle(el, styles));
  return styles.filter((el) => !hasStyle(el, orig));
}
function findPlainStyle(dom) {
  return $$("style", dom).find((el) => !el.attributes.length);
}
function updateProductionStyles(dom) {
  const plain = findPlainStyle();
  const new_plain = findPlainStyle(dom);
  if (plain)
    plain.replaceWith(new_plain);
  else if (new_plain)
    $("head").appendChild(new_plain);
}
var cache = {};
async function getHTML(path) {
  let html = cache[path];
  if (html)
    return html;
  const resp = await fetch(path);
  html = await resp.text();
  if (resp.status == 404 && html?.trim()[0] != "<") {
    const title = document.title = "Page not found";
    $("article").innerHTML = `<section><h1>${title}</h1></section>`;
  } else {
    cache[path] = html;
  }
  return html;
}
function mkdom(html) {
  html = html.replace(/<(\/?)body/g, "<$1body2");
  const tmpl = document.createElement("template");
  tmpl.innerHTML = html.trim();
  return tmpl.content;
}
function loadCSS(paths, fn) {
  let loaded = 0;
  !paths[0] ? fn() : paths.forEach((el, i) => {
    loadSheet(el.href, () => {
      if (++loaded == paths.length)
        fn();
    });
  });
}
function loadSheet(path, fn) {
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = path;
  $("head").appendChild(el);
  el.onload = fn;
}
export {
  setActive,
  onclick,
  loadPage,
  $$,
  $
};
