/* CPAR321 v2-th（2026-11-09）：321學神神學 中英逐句並讀
   繁／简頁並讀英文、英文頁並讀繁體中文：課程五個版本（教師本、學員本、小組本、回講卡、講章）
   的標題、金句、全文與「本課的限度」，以及「有己四型」「修正321」彈出頁。
   英文來源：頁內的 ENC（英文教師本／學員本／小組本／講章／卡片）；中文來源：課程原始資料。
   設定存 localStorage 'cpar321'（所有 321 App 共用）。 */
(function () {
  if (window.CPAR321 || typeof renderLesson !== 'function' || typeof ENC === 'undefined' || typeof CACHE === 'undefined') return;
  function LG() { try { return lang(); } catch (e) { return 'zh-Hant'; } }
  function EN() { return LG() === 'en'; }
  function UI() { var l = LG(); return l === 'en' ? 'en' : (l === 'zh-Hans' ? 'sc' : 'tc'); }
  var UNIT = EN() ? null : 'span.ms';            // 中文頁的句子已包成 span.ms（畫線／朗讀單位），插在單位後面
  /* ── 共用核心（與 321聖經講義 CPAR321 同一套演算法）──
     段落 LCS 配對 → 主要段落找句尾 → 另一語言切句、依長度比例 DP 對齊 → 插入 .cps。
     .cps 的文字放在 data-t、用 CSS ::before 顯示：DOM 裡沒有文字節點，
     所以朗讀、畫線、逐句點選、介面翻譯層都看不到它，只作用在主要內容。 */
  var STR = {
    tc: { btn: '中英並讀', on: '開', off: '關', loading: '英文內容載入中…', fail: '英文內容載入失敗，請檢查網路', none: '這一部分目前沒有英文版' },
    sc: { btn: '中英并读', on: '开', off: '关', loading: '英文内容载入中…', fail: '英文内容载入失败，请检查网络', none: '这一部分目前没有英文版' },
    en: { btn: 'Chinese parallel', on: 'On', off: 'Off', loading: 'Loading the Chinese text…', fail: 'Couldn’t load the Chinese text — check your connection', none: 'No Chinese text for this part' }
  };
  function T(k) { return STR[UI()][k]; }
  function isOn() { try { return localStorage.getItem('cpar321') === '1'; } catch (e) { return false; } }
  function setOn(v) { try { localStorage.setItem('cpar321', v ? '1' : ''); } catch (e) {} }
  var ALT_LANG = function () { return EN() ? 'zh-Hant' : 'en'; };

  var SEL = 'h1,h2,h3,h4,h5,p,li,blockquote,td,th,dt,dd';
  var SKIP_IN = '.cps,.cparbar,.cpar-st,button,details.refs,select,textarea' + (typeof SKIPX === 'string' && SKIPX ? ',' + SKIPX : '');
  function blocks(root) {
    var all = root.querySelectorAll(SEL), out = [];
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (e.closest(SKIP_IN)) continue;
      var p = e.parentElement, nested = false;
      while (p && p !== root) { if (p.matches && p.matches(SEL)) { nested = true; break; } p = p.parentElement; }
      if (!nested) out.push(e);
    }
    return out;
  }
  function sig(e) { return e.tagName + '.' + (e.className || '').toString().split(/\s+/).filter(function (c) { return c && !/^(hl|on|mks|sent|ms|tts-reading)$/.test(c); }).sort().join('.'); }
  function lcs(a, b) {
    var n = a.length, m = b.length, i, j, L = [];
    for (i = 0; i <= n; i++) L.push(new Uint16Array(m + 1));
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var pairs = []; i = 0; j = 0;
    while (i < n && j < m) { if (a[i] === b[j]) { pairs.push([i, j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
    return pairs;
  }
  function txt(e) { return (e.textContent || '').replace(/\s+/g, ' ').trim(); }
  function clearIn(root) { if (!root) return; var old = root.querySelectorAll('.cps'); for (var o = 0; o < old.length; o++) old[o].parentNode.removeChild(old[o]); }
  /* 主要畫面 root 與另一語言的 HTML 依段落結構配對 */
  function pairInto(root, altHtml, strip) {
    if (!root) return 0;
    clearIn(root);
    if (!altHtml) return 0;
    var box = document.createElement('div'); box.innerHTML = altHtml;
    var kill = box.querySelectorAll('script,style,svg,button,canvas,input,textarea,select' + (strip ? ',' + strip : ''));
    for (var k = 0; k < kill.length; k++) kill[k].parentNode.removeChild(kill[k]);
    var A = blocks(root), B = blocks(box);
    if (!A.length || !B.length) return 0;
    var cut = 1500, pairs = [];
    for (var s = 0; s < Math.max(A.length, B.length); s += cut) {
      lcs(A.slice(s, s + cut).map(sig), B.slice(s, s + cut).map(sig)).forEach(function (p) { pairs.push([p[0] + s, p[1] + s]); });
    }
    var n = 0;
    pairs.forEach(function (p) { n += pairOne(A[p[0]], txt(B[p[1]])); });
    return n;
  }
  function pairOne(me, t2) {
    var t1 = txt(me);
    t2 = (t2 || '').replace(/^#{1,6}\s+/, '');
    if (!t2 || t1 === t2 || !/[A-Za-z一-鿿]/.test(t2)) return 0;
    if (EN() ? !/[一-鿿]/.test(t2) : !/[A-Za-z]{2}/.test(t2)) return 0;   // 另一語言其實沒翻（同一種文字）就不插
    return sentPair(me, t2);
  }
  var ZH_END = /[。！？；!?]+(?:[」』”’）)】〕]*)/g, EN_END = /[.!?;](?:["”’)\]]*)(?=\s|$)/g;
  function splitSents(t, zh) {
    t = t.replace(/\s+/g, ' ').trim(); if (!t) return [];
    var re = zh ? /[^。！？；!?]+(?:[。！？；!?]+[」』”’）)】〕]*)?/g : /[^.!?;]+(?:[.!?;]+["”’)\]]*)?(?=\s|$)|[^.!?;]+$/g;
    var out = (t.match(re) || [t]).map(function (x) { return x.trim(); }).filter(Boolean), merged = [];
    out.forEach(function (x) {
      if (merged.length && (x.replace(/[\s\p{P}]/gu, '').length < (zh ? 3 : 6))) merged[merged.length - 1] += (zh ? '' : ' ') + x;
      else merged.push(x);
    });
    return merged;
  }
  function plen(t, zh) { return Math.max(1, zh ? t.replace(/[\s\p{P}]/gu, '').length : t.replace(/\s+/g, ' ').length); }
  function mainBounds(block) {
    var zh = !EN(), re = zh ? ZH_END : EN_END, w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null), node, out = [], acc = '';
    while ((node = w.nextNode())) {
      var pe = node.parentElement;
      if (pe && pe.closest('.cps,button,svg,.dtag,.hl-note')) continue;
      var tx = node.nodeValue, m, pos = 0, unit = (UNIT && pe) ? pe.closest(UNIT) : null;
      if (unit && !block.contains(unit)) unit = null;
      re.lastIndex = 0;
      while ((m = re.exec(tx))) {
        var end = m.index + m[0].length;
        acc += tx.slice(pos, end); pos = end;
        out.push({ node: node, off: end, unit: unit, text: acc }); acc = '';
      }
      acc += tx.slice(pos);
    }
    if (acc.replace(/\s/g, '')) out.push({ node: null, off: 0, unit: null, text: acc, tail: true });
    var res = [];
    out.forEach(function (b) {
      var last = res[res.length - 1];
      if (last && b.unit && last.unit === b.unit) { last.text += b.text; last.node = b.node; last.off = b.off; return; }
      if (b.tail && last && !last.unit && !last.node) { last.text += b.text; return; }
      res.push(b);
    });
    return res;
  }
  function align(ma, al) {
    var M = ma.map(function (t) { return plen(t, !EN()); }), A2 = al.map(function (t) { return plen(t, EN()); });
    var sm = M.reduce(function (a, b) { return a + b; }, 0), sa = A2.reduce(function (a, b) { return a + b; }, 0), r = sa / sm;
    var m = M.length, n = A2.length, INF = 1e9, C = [], B = [], i, j;
    for (i = 0; i <= m; i++) { C.push(new Float64Array(n + 1).fill(INF)); B.push(new Array(n + 1)); }
    C[0][0] = 0;
    var moves = [[1, 1, 0], [1, 2, .6], [2, 1, .6], [1, 3, 1.4], [3, 1, 1.4], [2, 2, 1], [1, 0, 3], [0, 1, 3]];
    for (i = 0; i <= m; i++) for (j = 0; j <= n; j++) {
      if (C[i][j] >= INF) continue;
      moves.forEach(function (mv) {
        var a = i + mv[0], b = j + mv[1]; if (a > m || b > n) return;
        var x = 0, y = 0, k; for (k = i; k < a; k++) x += M[k]; for (k = j; k < b; k++) y += A2[k];
        var c = C[i][j] + mv[2] + Math.abs(y - r * x) / Math.sqrt(r * x + y + 1);
        if (c < C[a][b]) { C[a][b] = c; B[a][b] = [i, j]; }
      });
    }
    var groups = []; i = m; j = n;
    while (i > 0 || j > 0) { var p = B[i][j]; if (!p) break; groups.unshift([p[0], i, p[1], j]); i = p[0]; j = p[1]; }
    return groups;
  }
  function mkSpan(t) { var d = document.createElement('span'); d.className = 'cps'; d.setAttribute('lang', ALT_LANG()); d.setAttribute('data-t', t); d.setAttribute('aria-hidden', 'true'); return d; }
  var INLINE = /^(A|B|STRONG|EM|I|U|SPAN|MARK|SMALL|SUP|SUB|CODE|Q|CITE)$/;
  /* 在文字節點的 off 處插入；剛好在行內元素的結尾時，跳到該元素外面再插，免得插進連結或畫線裡 */
  function insertAt(node, off, sp, block) {
    if (off < node.nodeValue.length) { var rest = node.splitText(off); rest.parentNode.insertBefore(sp, rest); return; }
    var ref = node;
    while (!ref.nextSibling && ref.parentNode && ref.parentNode !== block && INLINE.test(ref.parentNode.tagName)) ref = ref.parentNode;
    ref.parentNode.insertBefore(sp, ref.nextSibling);
  }
  function sentPair(me, altText) {
    var bounds = mainBounds(me), alts = splitSents(altText, EN());
    if (!bounds.length || !alts.length) return 0;
    var groups = bounds.length === 1 ? [[0, 1, 0, alts.length]] : align(bounds.map(function (b) { return b.text; }), alts);
    var ins = [];
    groups.forEach(function (g) {
      var t = alts.slice(g[2], g[3]).join(EN() ? '' : ' ');
      if (!t) return;
      var at = g[1] > g[0] ? g[1] - 1 : Math.max(0, g[0] - 1);
      if (ins.length && ins[ins.length - 1][0] === at) ins[ins.length - 1][1] += (EN() ? '' : ' ') + t; else ins.push([at, t]);
    });
    for (var k = ins.length - 1; k >= 0; k--) {
      var b = bounds[ins[k][0]], sp = mkSpan(ins[k][1]);
      if (b.unit) { var u = b.unit; while (!u.nextSibling && u.parentNode && u.parentNode !== me && INLINE.test(u.parentNode.tagName)) u = u.parentNode; u.parentNode.insertBefore(sp, u.nextSibling); }
      else if (b.node) insertAt(b.node, b.off, sp, me);
      else me.appendChild(sp);
    }
    return ins.length;
  }
  function css() {
    if (document.getElementById('cparCss')) return;
    var st = document.createElement('style'); st.id = 'cparCss';
    st.textContent = '.cps{display:block;margin:2px 0 8px;padding:1px 0 1px 9px;border-left:3px solid rgba(128,128,128,.42);font-size:.88em;line-height:1.65;opacity:.74;font-weight:400;font-style:normal;letter-spacing:0;text-transform:none;text-align:left;white-space:normal;background:none;cursor:default}'
      + '.cps::before{content:attr(data-t)}h1 .cps,h2 .cps,h3 .cps,h4 .cps{font-weight:600}'
      + '.cparbar{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:6px;margin:6px 0 8px}'
      + '.cparbtn{border:1px solid rgba(128,128,128,.45);background:transparent;color:inherit;border-radius:999px;padding:6px 14px;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}'
      + '.cparbtn.on{border-color:currentColor;box-shadow:inset 0 0 0 1px currentColor}.cpar-st{font-size:12.5px;opacity:.75;margin:0 0 8px;text-align:right}';
    document.head.appendChild(st);
  }
  function btnLabel() { var on = isOn(); return '🌐 ' + T('btn') + (UI() === 'en' ? ': ' : '：') + (on ? T('on') : T('off')); }
  function makeBar() {
    var d = document.createElement('div'); d.className = 'cparbar';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'cparbtn' + (isOn() ? ' on' : '');
    b.textContent = btnLabel(); b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); CPAR321.toggle(); };
    d.appendChild(b); return d;
  }
  function syncBtns() {
    var bs = document.querySelectorAll('.cparbtn');
    for (var i = 0; i < bs.length; i++) { bs[i].textContent = btnLabel(); bs[i].classList.toggle('on', isOn()); }
  }
  function status(bar, msg) {
    if (!bar || !bar.parentNode) return;
    var s = bar.nextSibling && bar.nextSibling.className === 'cpar-st' ? bar.nextSibling : null;
    if (!msg) { if (s) s.parentNode.removeChild(s); return; }
    if (!s) { s = document.createElement('div'); s.className = 'cpar-st'; bar.parentNode.insertBefore(s, bar.nextSibling); }
    s.textContent = msg;
  }
  function clearAll() { clearIn(document.body); var st = document.querySelectorAll('.cpar-st'); for (var i = 0; i < st.length; i++) st[i].parentNode.removeChild(st[i]); }

  function E(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fullHtml(arr) {
    if (!arr || !arr.length) return null;
    return arr.map(function (b) {
      var h = b.html || '';
      try { if (typeof boldAsciiMaps === 'function') h = boldAsciiMaps(h); } catch (e) {}
      return '<details class="blk"><summary><span class="bh">' + E(String(b.heading || '').replace(/\*\*/g, '')) + '</span></summary><div class="inner">' + h + '</div></details>';
    }).join('');
  }
  function hasEn(e, d) { return d === 'full' ? !!e.full : d === 'card' ? !!e.cardData : !!e[d]; }
  function altLesson(L0) {
    var id = L0.id, d = (typeof CUR !== 'undefined' && CUR.depth) || 'core8', e = ENC.lessons[id] || {};
    if (!EN()) {
      var body = d === 'full' ? fullHtml(e.full)
        : d === 'card' ? (e.cardData ? cardHTML(Object.assign({}, L0, { views: Object.assign({}, L0.views, { cardData: e.cardData }) })) : null)
        : (e[d] || null);
      return { head: e.title ? '<h2 class="big">' + E(e.title) + '</h2><p>' + E(e.t || '') + '</p>' : null, body: body, closing: (typeof EN_CLOSING !== 'undefined') ? EN_CLOSING : null };
    }
    if (!hasEn(e, d)) return { head: '<h2 class="big">' + E(L0.title) + '</h2><p>' + E(L0.oneLineTruth || '') + '</p>', body: null, closing: L0.parts && L0.parts.closing };
    var b2 = d === 'full' ? fullHtml(L0.views.full) : d === 'card' ? cardHTML(L0) : (L0.views[d] || null);
    return { head: '<h2 class="big">' + E(L0.title) + '</h2><p>' + E(L0.oneLineTruth || '') + '</p>', body: b2, closing: L0.parts && L0.parts.closing };
  }
  function applyLesson() {
    var view = document.getElementById('view'), lb = document.getElementById('lbody');
    if (!view || !lb) return;
    css();
    var bar = view.querySelector('.cparbar');
    if (!bar) { bar = makeBar(); var dep = view.querySelector('.depth'); if (dep) dep.parentNode.insertBefore(bar, dep); else lb.parentNode.insertBefore(bar, lb); }
    if (!isOn()) { clearIn(view); status(bar, ''); return; }
    var L0 = CUR && CACHE[CUR.lesson]; if (!L0) return;
    var a = altLesson(L0);
    var sect = view.querySelector('.sect'); if (sect && a.head) pairInto(sect, a.head);
    pairInto(lb, a.body, '.bn,.ar');
    var cl = lb.nextElementSibling;
    if (cl && cl.classList.contains('card') && a.closing) { var cb = cl.querySelector('.body'); if (cb) pairInto(cb, a.closing); }
    status(bar, a.body ? '' : T('none'));
  }
  var SHEETCUR = null;
  function applySheet() {
    var sb = document.getElementById('sheetbody'); if (!sb || !SHEETCUR) return;
    css();
    var bar = sb.querySelector('.cparbar');
    if (!bar) { bar = makeBar(); sb.insertBefore(bar, sb.firstChild); }
    if (!isOn()) { clearIn(sb); return; }
    var id = SHEETCUR.id, L0 = CACHE[id]; if (!L0) return;
    var rev = SHEETCUR.nm === 'openRev', e = ENC.lessons[id] || {}, title, body;
    if (!EN()) { title = e.title; body = enBlock(id, rev ? 'rev' : 'diag'); }
    else { title = L0.title; body = L0.parts && (rev ? L0.parts.revisions : L0.parts.diagnosis); }
    pairInto(sb, body ? '<h2 class="big">' + E(title || '') + '</h2><div class="body">' + body + '</div>' : null);
  }
  var oR = window.renderLesson;
  window.renderLesson = function () { var r = oR.apply(this, arguments); try { applyLesson(); } catch (e) {} return r; };
  ['openDiag', 'openRev'].forEach(function (nm) {
    var o = window[nm]; if (typeof o !== 'function') return;
    window[nm] = function (id) {
      var p = o.apply(this, arguments);
      return Promise.resolve(p).then(function (r) { SHEETCUR = { nm: nm, id: id }; try { applySheet(); } catch (e) {} return r; });
    };
  });
  window.CPAR321 = {
    toggle: function () {
      setOn(!isOn()); syncBtns();
      if (!isOn()) { clearAll(); return; }
      try { applyLesson(); } catch (e) {}
      var sh = document.getElementById('sheet');
      if (sh && sh.classList.contains('on') && document.querySelector('#sheetbody .cparbar')) { try { applySheet(); } catch (e) {} }
    },
    _pair: pairInto, _apply: applyLesson
  };
  try { if (document.getElementById('lbody')) applyLesson(); } catch (e) {}
})();
