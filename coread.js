/* 321學神神學 · 一起共讀（通用版，三冊共用同一份）
   帶領者開房間 → 6 位數共讀碼／連結／QR；加入者的畫面跟著帶領者換到同一頁、同一課、同一個捲動位置，
   朗讀到哪一句、點了哪一句，加入者也會框起來。每個人保留自己的語言與字級（只傳「哪一課／第幾句」，不傳文字）。
   連線：peerjs.min.js（相容 PeerJS 介面的 Cloudflare 中繼站連線層）。
   用法：<script src="coread.js?v=…" data-pfx="th3-" data-app="321學神神學（三）" data-app-zs="…" data-app-en="…"></script>
   ES5，獨立於主程式；只讀 CUR／route／openLesson／S 等頂層識別字。 */
(function () {
  'use strict';
  var SC = document.currentScript;
  function attr(k, d) { var v = SC && SC.getAttribute(k); return v || d; }
  var VQ = ''; try { var vm = String((SC && SC.src) || '').match(/[?&]v=([^&]+)/); VQ = vm ? '?v=' + vm[1] : ''; } catch (e) { }
  var PFX = attr('data-pfx', 'th-');
  var APP = { zh: attr('data-app', '321學神神學'), zs: attr('data-app-zs', attr('data-app', '321学神神学')), en: attr('data-app-en', attr('data-app', '321 Theology')) };
  var SSK = 'cr-' + PFX, COOL = 8000;
  var PEER_JS = ['peerjs.min.js' + VQ];
  var QR_JS = ['https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js', 'https://unpkg.com/qrcode-generator@1.4.4/qrcode.js', 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'];
  /* 個人性頁面（不同步）與可同步的子頁（以全域函式名辨識） */
  var PERSONAL_FN = ['vSettings', 'vSpkDiag', 'vMemory'];
  var SUB_FN = ['vLoci', 'vTopics', 'vLexicon', 'vVerses', 'vDiag', 'vPath', 'vRevisions', 'vScale', 'vAssure'];

  var TX = {
    zh: { title: '一起共讀', desc: '開一個共讀房間，把共讀碼或連結傳給弟兄姊妹。他們打開後，畫面會跟著你翻到同一頁、同一課、同一個位置；你朗讀或點一句，大家的畫面也會框出同一句。每個人的語言與字級各自保留。', host: '開共讀房間（我來帶領）', join: '加入', codePH: '輸入 6 位數共讀碼', orJoin: '或加入別人的共讀', asScr: '🖥 作為投影螢幕（大字、隱藏介面、自動跟著帶領者）', code: '共讀碼', people: '已有 {0} 人加入', waiting: '等待弟兄姊妹加入…', invite: '傳送邀請', copyLink: '複製連結', copied: '已複製', scrB: '複製投影連結', scrT: '🖥 投影螢幕', scrD: '在連接投影機或電視的電腦／平板打開投影連結，畫面會變成大字、沒有按鈕、自動跟著你。', end: '結束共讀', leave: '離開共讀', close: '關閉', inviteMsg: '📡 一起來共讀《{2}》！\n點連結加入：{0}\n或打開 App 按右上角「📡」輸入共讀碼：{1}', following: '跟著帶領共讀', paused: '你自己捲動了 · 點這裡回到帶領者', connecting: '連線中…', hostChip: '共讀 {0} · {1} 人', ended: '共讀已結束', joined: '已加入共讀，畫面會跟著帶領者', loadErr: '共讀功能載入失敗，請確認網路後再試', badCode: '請輸入 6 位數共讀碼', notFound: '找不到這個共讀房間，請確認共讀碼，或請帶領者重新開房間', followOnly: '你正在跟著共讀', back2: '回到帶領者', tip: '提示：帶領者請保持 App 開著、螢幕不要關，大家才會一直同步。設定、我的、筆記、美圖工作室與小智屬於個人頁面，不會同步。', qrTip: '用手機相機掃描加入', btn: '共讀', joinedOne: '有一位弟兄姊妹加入共讀', hostLeft: '帶領者暫時離線，正在重新連線…', away: '帶領者在個人頁面（不同步）' },
    zs: { title: '一起共读', desc: '开一个共读房间，把共读码或链接传给弟兄姊妹。他们打开后，画面会跟着你翻到同一页、同一课、同一个位置；你朗读或点一句，大家的画面也会框出同一句。每个人的语言与字号各自保留。', host: '开共读房间（我来带领）', join: '加入', codePH: '输入 6 位数共读码', orJoin: '或加入别人的共读', asScr: '🖥 作为投影荧幕（大字、隐藏界面、自动跟着带领者）', code: '共读码', people: '已有 {0} 人加入', waiting: '等待弟兄姊妹加入…', invite: '发送邀请', copyLink: '复制链接', copied: '已复制', scrB: '复制投影链接', scrT: '🖥 投影荧幕', scrD: '在连接投影机或电视的电脑／平板打开投影链接，画面会变成大字、没有按钮、自动跟着你。', end: '结束共读', leave: '离开共读', close: '关闭', inviteMsg: '📡 一起来共读《{2}》！\n点链接加入：{0}\n或打开 App 按右上角「📡」输入共读码：{1}', following: '跟着带领共读', paused: '你自己滚动了 · 点这里回到带领者', connecting: '连线中…', hostChip: '共读 {0} · {1} 人', ended: '共读已结束', joined: '已加入共读，画面会跟着带领者', loadErr: '共读功能载入失败，请确认网络后再试', badCode: '请输入 6 位数共读码', notFound: '找不到这个共读房间，请确认共读码，或请带领者重新开房间', followOnly: '你正在跟着共读', back2: '回到带领者', tip: '提示：带领者请保持 App 开着、屏幕不要关，大家才会一直同步。设定、我的、笔记、美图工作室与小智属于个人页面，不会同步。', qrTip: '用手机相机扫描加入', btn: '共读', joinedOne: '有一位弟兄姊妹加入共读', hostLeft: '带领者暂时离线，正在重新连线…', away: '带领者在个人页面（不同步）' },
    en: { title: 'Read together', desc: 'Open a reading room and send the room code or link to others. When they open it, their screens follow you to the same page, lesson and position; when you read aloud or tap a sentence, it is outlined on everyone’s screen. Everyone keeps their own language and text size.', host: 'Open a room (I’ll lead)', join: 'Join', codePH: 'Enter the 6-digit room code', orJoin: 'Or join someone else’s room', asScr: '🖥 As a projector screen (big text, no controls, follows the leader)', code: 'Room code', people: '{0} joined', waiting: 'Waiting for others to join…', invite: 'Send invite', copyLink: 'Copy link', copied: 'Copied', scrB: 'Copy projector link', scrT: '🖥 Projector screen', scrD: 'Open the projector link on the computer or tablet connected to the projector: big text, no buttons, and it follows you automatically.', end: 'End session', leave: 'Leave', close: 'Close', inviteMsg: '📡 Come read “{2}” with me!\nTap to join: {0}\nOr open the app, tap “📡” at the top right and enter code {1}', following: 'Following the leader', paused: 'You scrolled · tap to return to the leader', connecting: 'Connecting…', hostChip: 'Room {0} · {1}', ended: 'Reading session ended', joined: 'Joined — your screen will follow the leader', loadErr: 'Could not load reading-together. Check your connection and try again.', badCode: 'Please enter the 6-digit room code', notFound: 'Room not found. Check the code, or ask the leader to open a new room.', followOnly: 'You are following', back2: 'Back to leader', tip: 'Tip: the leader should keep the app open with the screen on so everyone stays in sync. Settings, My page, notes, the image studio and the AI helper are personal and are not synced.', qrTip: 'Scan with a phone camera to join', btn: 'Together', joinedOne: 'Someone joined the room', hostLeft: 'The leader is offline for a moment — reconnecting…', away: 'The leader is on a personal page (not synced)' }
  };
  function lg() { try { var l = (S && S.settings && S.settings.lang) || ''; if (/^en/i.test(l)) return 'en'; if (/Hans|zs|cn|sc/i.test(l)) return 'zs'; } catch (e) { } return 'zh'; }
  function X(k) { var l = lg(), s = (TX[l] || TX.zh)[k] || TX.zh[k] || k; for (var i = 1; i < arguments.length; i++) s = s.split('{' + (i - 1) + '}').join(arguments[i]); return s; }
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ss(k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || 'null'); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function $(id) { return document.getElementById(id); }
  function toast(m) { try { if (typeof window.toast === 'function') { window.toast(m); return; } } catch (e) { } var t = $('crtoast'); if (!t) { t = document.createElement('div'); t.id = 'crtoast'; t.className = 'crtoast'; document.body.appendChild(t); } t.textContent = m; t.className = 'crtoast on'; clearTimeout(t._t); t._t = setTimeout(function () { t.className = 'crtoast'; }, 2400); }
  function copyTxt(s, okMsg) {
    function fb() { try { var a = document.createElement('textarea'); a.value = s; a.style.cssText = 'position:fixed;left:-999px;top:0'; document.body.appendChild(a); a.select(); document.execCommand('copy'); document.body.removeChild(a); toast(okMsg || X('copied')); } catch (e) { try { window.prompt('', s); } catch (e2) { } } }
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(function () { toast(okMsg || X('copied')); }, fb); else fb(); } catch (e) { fb(); }
  }

  /* 重複呼叫安全：同一頁只啟動一次 */
  if (window.CR) return;

  var QS = location.search, SCREEN = /[?&]screen=1/.test(QS);
  if (SCREEN) window.CR_SCREEN = true;

  var loaded = {};
  function loadJs(urls, test, cb) {
    if (test()) { cb(true); return; } var i = 0;
    (function nx() {
      if (i >= urls.length) { cb(false); return; } var u = urls[i++];
      if (loaded[u]) { setTimeout(function () { cb(test()); }, 0); return; }
      var s = document.createElement('script'); s.src = u; s.async = true;
      s.onload = function () { loaded[u] = 1; if (test()) cb(true); else nx(); }; s.onerror = function () { nx(); };
      document.head.appendChild(s);
    })();
  }

  /* ---------- 狀態 ---------- */
  var C = { role: '', code: '', peer: null, conns: [], host: null, last: null, retry: 0, rt: null, manualAt: 0, ptEl: null, status: '', want: null, sub: null, key: '', pt: null, ptAt: 0, fresh: false, mkAt: 0, tries: 0, navK: '', navAt: 0, lastRx: 0, scr: false, first: false, misses: 0 };
  function baseUrl() { return location.origin + location.pathname; }
  function joinUrl(code) { return baseUrl() + '?join=' + code; }
  function newCode() { var c = ''; for (var i = 0; i < 6; i++) c += Math.floor(Math.random() * 10); return c.charAt(0) === '0' ? '1' + c.slice(1) : c; }
  function live() { var o = []; for (var i = 0; i < C.conns.length; i++) if (C.conns[i].open) o.push(C.conns[i]); return o; }
  function ready() { try { return !!(typeof CUR !== 'undefined' && typeof IDX !== 'undefined' && IDX && typeof openLesson === 'function' && typeof route === 'function' && document.getElementById('view')); } catch (e) { return false; } }
  function panelOpen() { var p = $('crsheet'); return !!(p && p.className.indexOf('on') >= 0); }

  /* ---------- 掛上子頁辨識：包住全域函式（不改主程式檔） ---------- */
  function wrapFn(name, before) {
    try {
      var o = window[name]; if (typeof o !== 'function' || o.__cr) return;
      var w = function () { try { before(); } catch (e) { } return o.apply(this, arguments); };
      w.__cr = 1; window[name] = w;
    } catch (e) { }
  }
  function installWraps() {
    wrapFn('route', function () { C.sub = null; });
    wrapFn('openLesson', function () { C.sub = null; });
    var all = SUB_FN.concat(PERSONAL_FN), i;
    for (i = 0; i < all.length; i++) (function (n) { wrapFn(n, function () { C.sub = n; }); })(all[i]);
  }

  /* ---------- 頁面狀態（帶領者端）：個人性頁面回 null ---------- */
  function overlayOn() { try { return !!document.querySelector('#ai.on,#gxuPanel.on,.gxu-modal.on,.gxuov.on'); } catch (e) { return false; } }
  function pageState() {
    var tab, lesson, depth;
    try { tab = CUR.tab; lesson = CUR.lesson; depth = CUR.depth; } catch (e) { return null; }
    if (tab === 'me' || overlayOn()) return null;
    if (C.sub) { if (PERSONAL_FN.indexOf(C.sub) >= 0) return null; return { tab: tab, sub: C.sub }; }
    if (lesson) return { tab: tab, lesson: lesson, depth: depth };
    return { tab: tab };
  }
  function stateKey(p) { return p ? JSON.stringify([0, p.tab, p.lesson || null, p.depth || null, p.sub || null]) : '[1]'; }
  function frac() {
    var de = document.documentElement, mx = Math.max(de.scrollHeight, document.body ? document.body.scrollHeight : 0) - (window.innerHeight || 600);
    if (mx < 20) return 0; var f = (window.pageYOffset || de.scrollTop || 0) / mx; return Math.round(Math.min(1, Math.max(0, f)) * 1000) / 1000;
  }
  function toFrac(f, smooth) {
    var de = document.documentElement, mx = Math.max(de.scrollHeight, document.body ? document.body.scrollHeight : 0) - (window.innerHeight || 600);
    var y = Math.round(Math.max(0, mx) * (f || 0));
    try { window.scrollTo({ top: y, behavior: smooth === false ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, y); }
  }

  /* ---------- 句子定位：#view 內「第幾個句子元素」 ---------- */
  function ensureMs() { try { if (typeof wrapSentences === 'function') wrapSentences(); } catch (e) { } }
  function closestSel(el, sel) { try { return el.closest ? el.closest(sel) : null; } catch (e) { return null; } }
  /* 句子單元 = 每個 (段落, data-s) 的第一個 span.ms；畫線把一句切成幾塊也只算一句 */
  function unitsS() {
    var root = $('lbody'), out = [], keys = []; if (!root) return { els: out, keys: keys };
    var ms = root.querySelectorAll('span.ms'), lastB = null, bi = -1, seen = {};
    for (var i = 0; i < ms.length; i++) {
      var b = closestSel(ms[i], 'p,li,h4,td,th'); if (b !== lastB) { lastB = b; bi++; }
      var k = bi + ':' + ms[i].getAttribute('data-s');
      if (!seen[k]) { seen[k] = 1; out.push(ms[i]); keys.push(k); }
    }
    return { els: out, keys: keys };
  }
  function keyOf(span) {
    var root = $('lbody'); if (!root) return '';
    var ms = root.querySelectorAll('span.ms'), lastB = null, bi = -1;
    for (var i = 0; i < ms.length; i++) {
      var b = closestSel(ms[i], 'p,li,h4,td,th'); if (b !== lastB) { lastB = b; bi++; }
      if (ms[i] === span) return bi + ':' + ms[i].getAttribute('data-s');
    }
    return '';
  }
  function describe(e) {
    var root = $('lbody'); if (!root || !e || !root.contains(e)) return null;
    var s = (e.tagName === 'SPAN' && /(^|\s)ms(\s|$)/.test(String(e.className))) ? e : closestSel(e, 'span.ms');
    if (s && root.contains(s)) {
      var u = unitsS(), k = keyOf(s), idx = u.keys.indexOf(k);
      if (idx >= 0) return { k: 's', i: idx, n: u.els.length };
    }
    var all = root.querySelectorAll('*'), j = Array.prototype.indexOf.call(all, e);
    return j >= 0 ? { k: 'e', i: j, n: all.length } : null;
  }
  function resolve(d) {
    var root = $('lbody'); if (!root || !d) return null;
    var list;
    if (d.k === 's') { ensureMs(); list = unitsS().els; } else list = root.querySelectorAll('*');
    if (!list.length) return null;
    var i = (list.length === d.n) ? d.i : Math.round(d.n > 1 ? d.i / (d.n - 1) * (list.length - 1) : 0);
    return list[Math.max(0, Math.min(list.length - 1, i))];
  }
  function clearPt() { var o = document.querySelectorAll('.cr-pt'); for (var i = 0; i < o.length; i++) o[i].className = String(o[i].className).replace(/\s*\bcr-pt\b/g, ''); C.ptEl = null; }
  function showPt(el, scroll) {
    clearPt(); if (!el) return false;
    var dt = closestSel(el, 'details');
    while (dt) { if (!dt.open) dt.open = true; dt = dt.parentNode ? closestSel(dt.parentNode, 'details') : null; }
    el.className = (el.className ? el.className + ' ' : '') + 'cr-pt'; C.ptEl = el;
    if (scroll) { try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { try { el.scrollIntoView(); } catch (e2) { } } }
    return true;
  }

  /* ---------- 帶領者 ---------- */
  function host(code, quiet) {
    loadJs(PEER_JS, function () { return !!window.Peer; }, function (ok) {
      if (!ok) { toast(X('loadErr')); return; }
      teardown(); window.CR_SCREEN = false;
      C.role = 'host'; C.fresh = !code; C.code = code || newCode(); C.status = 'connecting'; C.key = ''; C.pt = null; C.last = null;
      ss(SSK, { r: 'host', c: C.code }); chip();
      var p = C.peer = new Peer(PFX + C.code, { debug: 0 });
      p.on('open', function () { C.retry = 0; C.fresh = false; C.status = 'ok'; chip(); if (!quiet) sheet(); snap(true); });
      p.on('connection', function (c) {
        C.conns.push(c);
        c.on('open', function () { chip(); toast(X('joinedOne')); paintCount(); if (C.last) try { c.send(C.last); } catch (e) { } });
        c.on('close', function () { drop(c); }); c.on('error', function () { drop(c); });
      });
      p.on('disconnected', function () { if (C.role === 'host' && !p.destroyed) setTimeout(function () { try { p.reconnect(); } catch (e) { } }, 1500); });
      p.on('error', function (e) {
        if (C.role !== 'host') return;
        if (e && e.type === 'unavailable-id') {
          if (C.fresh && C.retry++ < 5) { C.code = newCode(); ss(SSK, { r: 'host', c: C.code }); clearTimeout(C.rt); C.rt = setTimeout(function () { host(C.code, true); C.fresh = true; }, 200); return; }
          if (C.retry++ < 25) { C.status = 'connecting'; chip(); clearTimeout(C.rt); C.rt = setTimeout(function () { host(C.code, true); }, 3000); } else { toast(X('loadErr')); endNow(); } return;
        }
        if (e && (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error' || e.type === 'socket-closed')) { clearTimeout(C.rt); C.rt = setTimeout(function () { if (C.role === 'host') host(C.code, true); }, 4000); }
      });
    });
  }
  function drop(c) { var o = []; for (var i = 0; i < C.conns.length; i++) if (C.conns[i] !== c) o.push(C.conns[i]); C.conns = o; chip(); paintCount(); }
  function cast(m) { var cs = live(); for (var i = 0; i < cs.length; i++) try { cs[i].send(m); } catch (e) { } }
  /* 全量狀態：換頁時與加入時送；C.last 永遠是最新的完整狀態 */
  function snap(force) {
    if (C.role !== 'host' || (C.status !== 'ok' && !force)) return;
    if (panelOpen()) return;
    var p = pageState(), m = { t: 'st', ts: Date.now() };
    if (!p) { m.off = 1; } else { m.tab = p.tab; if (p.lesson) { m.lesson = p.lesson; m.depth = p.depth; } if (p.sub) m.sub = p.sub; }
    var key = stateKey(p);
    if (key !== C.key) { C.key = key; C.pt = null; }
    else if (!force && C.last && !m.off && C.last.f === frac() && JSON.stringify(C.last.pt || null) === JSON.stringify(C.pt || null)) return;
    if (!m.off) { m.f = frac(); if (C.pt) m.pt = C.pt; }
    C.last = m; cast(m);
  }
  var posT = null;
  window.addEventListener('scroll', function () {
    if (C.role !== 'host' || panelOpen()) return;
    try { if (typeof SPK !== 'undefined' && SPK.on && !SPK.pause) return; } catch (e) { }
    clearTimeout(posT); posT = setTimeout(function () {
      if (C.role !== 'host' || !C.last || C.last.off) return;
      if (C.pt && Date.now() - C.ptAt > 2000) { C.pt = null; delete C.last.pt; }
      var f = frac(); C.last.f = f; cast({ t: 'pos', f: f });
    }, 220);
  }, { passive: true });
  function sendMk(kind, d) {
    if (C.role !== 'host' || !d) return;
    C.pt = d; C.ptAt = Date.now();
    if (!C.last || C.last.off) { snap(true); }
    if (C.last && !C.last.off) { C.last.pt = d; }
    cast({ t: 'mk', k: kind, d: d });
  }
  /* 點一句（捕捉階段，早於主程式的 onclick 與重畫） */
  document.addEventListener('click', function (e) {
    if (C.role !== 'host') return;
    var t = e.target; if (!t || !t.closest) return;
    if (t.closest('a,mark,button')) return;
    var s = t.closest('span.ms'); if (!s || !$('lbody') || !$('lbody').contains(s)) return;
    var d = describe(s); if (d) sendMk('pt', d);
  }, true);
  /* 朗讀到哪一句：主程式把目前這句加上 .spk-now */
  var ttsT = null, lastTtsEl = null;
  function onTts() {
    if (C.role !== 'host') return;
    var el = null; try { el = document.querySelector('#lbody .spk-now'); } catch (e) { }
    if (!el || el === lastTtsEl) return; lastTtsEl = el;
    var d = describe(el); if (d) sendMk('tts', d);
  }

  /* ---------- 加入者 ---------- */
  function join(code, scr) {
    code = String(code || '').replace(/\D/g, ''); if (code.length !== 6) { toast(X('badCode')); return; }
    loadJs(PEER_JS, function () { return !!window.Peer; }, function (ok) {
      if (!ok) { toast(X('loadErr')); return; }
      teardown(); C.role = 'follow'; C.code = code; C.status = 'connecting'; C.first = true; C.misses = 0; C.scr = !!scr || SCREEN; C.manualAt = 0;
      if (C.scr) window.CR_SCREEN = true;
      ss(SSK, { r: 'follow', c: code, s: C.scr ? 1 : 0 }); chip(); closeSheet();
      var p = C.peer = new Peer({ debug: 0 });
      p.on('open', function () { dial(); });
      p.on('disconnected', function () { if (C.role === 'follow' && !p.destroyed) setTimeout(function () { try { p.reconnect(); } catch (e) { } }, 1500); });
      p.on('error', function (e) {
        if (C.role !== 'follow') return;
        if (e && e.type === 'peer-unavailable') { C.misses++; if (C.first && C.misses >= 3) { toast(X('notFound')); leave(true); return; } C.status = 'connecting'; chip(); redial(4000); return; }
        redial(4000);
      });
    });
  }
  function redial(ms) { clearTimeout(C.rt); C.rt = setTimeout(function () { if (C.role === 'follow') dial(); }, ms || 3000); }
  function dial() {
    var p = C.peer; if (!p || p.destroyed || C.role !== 'follow') return;
    if (p.disconnected) { try { p.reconnect(); } catch (e) { } redial(3000); return; }
    try { if (C.host) C.host.close(); } catch (e) { }
    var c = C.host = p.connect(PFX + C.code, { reliable: true });
    var to = setTimeout(function () { if (!c.open && C.role === 'follow' && C.host === c) { try { c.close(); } catch (e) { } redial(1000); } }, 12000);
    c.on('open', function () { clearTimeout(to); C.misses = 0; C.lastRx = Date.now(); C.status = 'ok'; if (C.first) { C.first = false; toast(X('joined')); } chip(); });
    c.on('data', function (m) {
      C.lastRx = Date.now(); if (C.status !== 'ok') { C.status = 'ok'; chip(); } if (!m) return;
      if (m.t === 'st') apply(m); else if (m.t === 'pos') onPos(m); else if (m.t === 'mk') onMk(m); else if (m.t === 'end') leave();
    });
    c.on('close', function () { clearTimeout(to); if (C.role === 'follow' && C.host === c) { C.status = 'lost'; chip(); redial(2500); } });
    c.on('error', function () { });
  }
  function canMove() { return Date.now() - C.manualAt > COOL; }
  function sameAs(m) {
    try {
      if (CUR.tab !== m.tab) return false;
      if (m.lesson) return CUR.lesson === m.lesson && CUR.depth === m.depth && !C.sub;
      if (m.sub) return C.sub === m.sub;
      return !CUR.lesson && !C.sub;
    } catch (e) { return false; }
  }
  function retry(ms) { clearTimeout(C.ap); C.ap = setTimeout(function () { if (C.role === 'follow' && C.want) apply(C.want); }, ms); }
  function apply(m) {
    C.want = m; if (C.role !== 'follow') return;
    if (m.off) { chip(); return; }
    if (sameAs(m)) { C.tries = 0; if (m !== C.pm) { C.pm = m; C.pr = 0; } settle(); return; }
    if (C.tries++ > 14) { chip(); return; }
    go(m);
  }
  function go(m) {
    if (!ready()) { retry(600); return; }
    var k = JSON.stringify([m.tab, m.lesson, m.depth, m.sub]);
    if (C.navK === k && Date.now() - C.navAt < 4000) { retry(700); return; }    // 載入中，等一下再看
    C.navK = k; C.navAt = Date.now();
    try { if (typeof SPK !== 'undefined' && SPK.on && typeof stopSpeak === 'function') stopSpeak(); } catch (e) { }
    try {
      if (m.lesson) {
        var p = openLesson(m.lesson, m.depth || undefined);
        if (p && p.then) p.then(function () { retry(120); }, function () { retry(1500); });
      } else {
        route(m.tab);
        if (m.sub && typeof window[m.sub] === 'function') window[m.sub]();
      }
    } catch (e) { }
    retry(900);
  }
  function settle() {
    var m = C.want; if (!m || m.off || C.role !== 'follow') return;
    var mv = canMove(), el = m.pt ? resolve(m.pt) : null;
    if (el) { showPt(el, mv); }
    else { clearPt(); if (m.pt && (C.pr = (C.pr || 0) + 1) < 6) retry(500); if (mv) toFrac(m.f || 0); }
    chip();
  }
  function onPos(m) {
    if (!C.want) return; C.want.f = m.f; if (C.want.pt && Date.now() - C.mkAt > 2000) { /* 帶領者已捲離標記處 */ }
    if (!sameAs(C.want) || C.want.off) return;
    if (canMove() && Date.now() - C.mkAt > 2500) toFrac(m.f);
  }
  function onMk(m) {
    if (!C.want || !m.d) return; C.want.pt = m.d; C.mkAt = Date.now();
    if (!sameAs(C.want) || C.want.off) return;
    var el = resolve(m.d); if (el) showPt(el, canMove());
    chip();
  }
  function userMove() { if (C.role === 'follow') { C.manualAt = Date.now(); chip(); clearTimeout(C.mt); C.mt = setTimeout(chip, COOL + 200); } }
  window.addEventListener('touchstart', userMove, { passive: true }); window.addEventListener('touchmove', userMove, { passive: true });
  window.addEventListener('wheel', userMove, { passive: true });
  window.addEventListener('keydown', function (e) { if (/^(Arrow|Page|Home|End| )/.test(e.key || '')) userMove(); }, false);
  function backToLeader() { C.manualAt = 0; if (C.want) { C.tries = 0; apply(C.want); } chip(); }

  /* ---------- 重畫鉤子 ---------- */
  var moT = null;
  function onRender() {
    if (C.role === 'host') snap(); else if (C.role === 'follow' && C.want) apply(C.want);
    chip();
  }
  function startObserve() {
    var v = $('view'); if (!v || typeof MutationObserver === 'undefined') return;
    new MutationObserver(function () { clearTimeout(moT); moT = setTimeout(onRender, 150); }).observe(v, { childList: true });
    new MutationObserver(function (recs) {
      if (C.role !== 'host') return;
      for (var i = 0; i < recs.length; i++) { var t = recs[i].target; if (t && t.classList && t.classList.contains('spk-now')) { clearTimeout(ttsT); ttsT = setTimeout(onTts, 90); return; } }
    }).observe(v, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  /* 心跳：帶領者每 5 秒報平安並檢查頁面（遮罩開關也會改變同步狀態）；加入者 15 秒沒收到就重連 */
  setInterval(function () {
    if (C.role === 'host') { cast({ t: 'hb' }); if (C.status === 'ok') snap(); }
    else if (C.role === 'follow' && C.host && C.lastRx && Date.now() - C.lastRx > 15000) { C.lastRx = 0; C.status = 'lost'; chip(); dial(); }
  }, 5000);
  setInterval(function () { if (C.role === 'host' && C.status === 'ok' && !panelOpen() && stateKey(pageState()) !== C.key) snap(); }, 1200);
  window.addEventListener('pagehide', function () { if (C.role === 'host') cast({ t: 'hb' }); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    if (C.role === 'follow' && C.status !== 'ok') dial();
    if (C.role === 'host' && C.peer && C.peer.disconnected) try { C.peer.reconnect(); } catch (e) { }
  });

  /* ---------- 結束 ---------- */
  function teardown() { clearTimeout(C.rt); clearTimeout(C.ap); try { if (C.peer) C.peer.destroy(); } catch (e) { } C.peer = null; C.conns = []; C.host = null; C.want = null; C.navK = ''; clearPt(); }
  function end() { var cs = live(); cast({ t: 'end' }); setTimeout(endNow, cs.length ? 300 : 0); }
  function endNow() { teardown(); C.role = ''; C.code = ''; C.last = null; ss(SSK, null); chip(); closeSheet(); toast(X('ended')); }
  function leave(quiet) { teardown(); C.role = ''; C.code = ''; ss(SSK, null); chip(); closeSheet(); if (!quiet) toast(X('ended')); }

  /* ---------- 畫面 ---------- */
  function css() {
    if ($('crcss')) return;
    var st = document.createElement('style'); st.id = 'crcss';
    st.textContent =
      '.cr-pt{outline:3px solid #C9A227!important;outline-offset:3px;border-radius:6px;background:rgba(201,162,39,.24)!important;animation:crpt 1.4s ease-in-out 4}' +
      '@keyframes crpt{0%,100%{box-shadow:0 0 0 0 rgba(201,162,39,.75)}50%{box-shadow:0 0 0 12px rgba(201,162,39,0)}}' +
      '#crTop.on{background:var(--accent,#0F4A40);color:#fff;border-color:var(--accent,#0F4A40)}' +
      '.crchip{position:fixed;right:8px;top:70px;z-index:70;border:0;border-radius:999px;padding:7px 14px 7px 10px;font:inherit;font-size:14px;line-height:1.4;letter-spacing:0;background:var(--accent,#0F4A40);color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.22);max-width:calc(100vw - 16px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}' +
      '.crchip .dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#5BD38A;margin-right:6px;vertical-align:1px;animation:crdot 1.6s infinite}' +
      '@keyframes crdot{0%,100%{opacity:1}50%{opacity:.35}}' +
      '.crchip.wait .dot{background:#F2C14E}.crchip.off{background:#8B5E1A}.crchip.off .dot{background:#fff;animation:none}' +
      '#crsheet{position:fixed;inset:0;z-index:200;background:rgba(20,24,30,.45);display:none;align-items:flex-end;justify-content:center;letter-spacing:0}#crsheet.on{display:flex}' +
      '#crsheet .cri{background:var(--bg,#FAF8F3);color:var(--ink,#20242B);width:100%;max-width:520px;max-height:88vh;overflow-y:auto;border-radius:20px 20px 0 0;padding:16px 18px calc(18px + env(safe-area-inset-bottom,0px));font:16px/1.6 var(--sans,system-ui,sans-serif);box-sizing:border-box}' +
      '#crsheet .crt{font-size:20px;font-weight:700;text-align:center;margin:0 0 8px;font-family:var(--serif,serif)}' +
      '#crsheet .crk{font-size:14px;color:var(--ink3,#79828F);text-align:center;margin-top:6px}' +
      '#crsheet .crcode{font-size:42px;font-weight:800;letter-spacing:.12em;text-align:center;color:var(--accent,#0F4A40);margin:2px 0 8px;font-variant-numeric:tabular-nums;line-height:1.2}' +
      '#crsheet .crqr{display:flex;justify-content:center;margin:4px 0}#crsheet .crqr img{width:180px;height:180px;image-rendering:pixelated;background:#fff;border-radius:10px;padding:4px}' +
      '#crsheet .crcnt{text-align:center;font-weight:700;margin:10px 0 4px}#crsheet .crsm{font-size:13.5px;color:var(--ink3,#79828F);line-height:1.6;text-align:center;margin:6px 0}' +
      '#crsheet .cract{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px}' +
      '#crsheet button.crb{font:inherit;font-size:16px;border:1px solid var(--line,#E4DFD4);background:var(--card,#fff);color:var(--ink,#20242B);border-radius:12px;padding:10px 16px;cursor:pointer;min-height:44px}' +
      '#crsheet button.crb.pri{background:var(--accent,#0F4A40);color:#fff;border-color:var(--accent,#0F4A40)}#crsheet button.crb.blk{display:block;width:100%}' +
      '#crsheet .crjoin{display:flex;gap:8px;margin-top:6px}#crsheet .crjoin input{flex:1;min-width:0;font:inherit;font-size:18px;letter-spacing:.1em;padding:10px 12px;border:1px solid var(--line,#E4DFD4);border-radius:12px;background:var(--card,#fff);color:var(--ink,#20242B);text-align:center}' +
      '#crsheet label.crchk{display:flex;gap:8px;align-items:flex-start;font-size:14px;margin-top:10px;color:var(--ink2,#4A5260)}#crsheet label.crchk input{margin-top:4px}' +
      '.crtoast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:300;background:rgba(30,30,30,.9);color:#fff;border-radius:999px;padding:8px 16px;font:15px/1.4 system-ui,sans-serif;display:none;max-width:90vw}.crtoast.on{display:block}';
    document.head.appendChild(st);
  }
  function topBtn() {
    if ($('crTop')) return;
    var sp = $('speak'), host0 = sp && sp.parentNode; if (!host0) { host0 = document.querySelector('header.top .wrap'); if (!host0) return; }
    var b = document.createElement('button'); b.className = 'iconbtn'; b.id = 'crTop'; b.type = 'button'; b.textContent = '📡';
    b.setAttribute('aria-label', X('title')); b.setAttribute('title', X('title'));
    b.onclick = function () { sheet(); };
    if (sp) host0.insertBefore(b, sp); else host0.appendChild(b);
  }
  function chip() {
    var tb = $('crTop'); if (tb) { tb.className = 'iconbtn' + (C.role ? ' on' : ''); tb.setAttribute('aria-label', X('title')); }
    var el = $('crchip');
    if (!C.role || C.scr && C.role === 'follow') { if (el) el.parentNode.removeChild(el); return; }
    if (!el) { el = document.createElement('button'); el.id = 'crchip'; el.className = 'crchip'; el.type = 'button'; el.onclick = function () { if (C.role === 'follow' && Date.now() - C.manualAt <= COOL) { backToLeader(); return; } sheet(); }; document.body.appendChild(el); }
    try { var hd = document.querySelector('header.top'); if (hd) el.style.top = Math.round(hd.getBoundingClientRect().bottom + 8) + 'px'; } catch (e) { }
    var t, cls = 'crchip';
    if (C.role === 'host') t = C.status === 'ok' ? X('hostChip', C.code, live().length) : X('connecting');
    else if (C.status !== 'ok') { t = C.status === 'lost' ? X('hostLeft') : X('connecting'); cls += ' wait'; }
    else if (C.want && C.want.off) { t = X('away'); cls += ' off'; }
    else if (Date.now() - C.manualAt <= COOL) { t = X('paused'); cls += ' off'; }
    else t = X('following');
    el.className = cls; el.innerHTML = '<span class="dot"></span>📡 ' + E(t);
  }
  function qrInto(id, text) {
    loadJs(QR_JS, function () { return typeof window.qrcode === 'function'; }, function (ok) {
      var box = $(id); if (!box || !ok) { if (box) box.style.display = 'none'; return; }
      try { var q = window.qrcode(0, 'M'); q.addData(text); q.make(); box.innerHTML = q.createImgTag(5, 10); } catch (e) { box.style.display = 'none'; }
    });
  }
  function paintCount() { var e = $('crcount'); if (e) { var n = live().length; e.textContent = n ? X('people', n) : X('waiting'); } }
  function closeSheet() { var p = $('crsheet'); if (p) p.className = ''; setTimeout(function () { if (C.role === 'host') snap(true); }, 100); }
  function openSheet(h) {
    css(); var p = $('crsheet');
    if (!p) { p = document.createElement('div'); p.id = 'crsheet'; document.body.appendChild(p); p.addEventListener('click', function (e) { if (e.target === p) closeSheet(); }); }
    p.innerHTML = '<div class="cri">' + h + '</div>'; p.className = 'on';
  }
  function sheet() {
    var h = '<div class="crt">📡 ' + E(X('title')) + '</div>', fmt = function (c) { return c.slice(0, 3) + ' ' + c.slice(3); };
    if (C.role === 'host') {
      h += '<div class="crk">' + E(X('code')) + '</div><div class="crcode">' + E(fmt(C.code)) + '</div>' +
        '<div class="crqr" id="crqr"></div><div class="crsm">' + E(X('qrTip')) + '</div><div class="crcnt" id="crcount"></div>' +
        '<div class="cract"><button class="crb pri" data-a="invite">↗ ' + E(X('invite')) + '</button><button class="crb" data-a="copy">⧉ ' + E(X('copyLink')) + '</button><button class="crb" data-a="scrcopy">🖥 ' + E(X('scrB')) + '</button></div>' +
        '<div class="crsm">' + E(X('scrD')) + '</div><div class="crsm">' + E(X('tip')) + '</div>' +
        '<div class="cract"><button class="crb" data-a="end">■ ' + E(X('end')) + '</button><button class="crb" data-a="close">' + E(X('close')) + '</button></div>';
      openSheet(h); paintCount(); qrInto('crqr', joinUrl(C.code)); return;
    }
    if (C.role === 'follow') {
      h += '<div class="crk">' + E(X('followOnly')) + '</div><div class="crcode">' + E(fmt(C.code)) + '</div>' +
        '<div class="cract"><button class="crb pri" data-a="back">' + E(X('back2')) + '</button><button class="crb" data-a="leave">' + E(X('leave')) + '</button></div>' +
        '<div class="cract"><button class="crb" data-a="close">' + E(X('close')) + '</button></div>';
      openSheet(h); return;
    }
    h += '<div class="crsm" style="text-align:left;font-size:15px">' + E(X('desc')) + '</div>' +
      '<button class="crb pri blk" data-a="host" style="margin-top:10px">📡 ' + E(X('host')) + '</button>' +
      '<div class="crk" style="margin-top:16px">' + E(X('orJoin')) + '</div>' +
      '<div class="crjoin"><input id="crin" type="tel" inputmode="numeric" maxlength="7" autocomplete="off" placeholder="' + E(X('codePH')) + '"><button class="crb pri" data-a="join">' + E(X('join')) + '</button></div>' +
      '<label class="crchk"><input type="checkbox" id="crscrchk"><span>' + E(X('asScr')) + '</span></label>' +
      '<div class="cract"><button class="crb" data-a="close">' + E(X('close')) + '</button></div>';
    openSheet(h);
    var inp = $('crin'); if (inp) inp.onkeydown = function (e) { if (e.keyCode === 13) doJoin(); };
  }
  function doJoin() { var i = $('crin'), c = $('crscrchk'); join(i ? i.value : '', !!(c && c.checked)); }
  document.addEventListener('click', function (e) {
    var n = e.target; while (n && n !== document && !(n.getAttribute && n.getAttribute('data-a') && closestSel(n, '#crsheet'))) n = n.parentNode; if (!n || n === document) return;
    var a = n.getAttribute('data-a');
    if (a === 'host') { closeSheet(); host(); }
    else if (a === 'join') doJoin();
    else if (a === 'invite') {
      var msg = X('inviteMsg', joinUrl(C.code), C.code, APP[lg()] || APP.zh);
      if (navigator.share) { navigator.share({ text: msg }).then(null, function () { copyTxt(msg); }); } else copyTxt(msg);
    }
    else if (a === 'copy') copyTxt(joinUrl(C.code));
    else if (a === 'scrcopy') copyTxt(joinUrl(C.code) + '&screen=1');
    else if (a === 'end') end();
    else if (a === 'leave') leave();
    else if (a === 'back') { closeSheet(); backToLeader(); }
    else if (a === 'close') closeSheet();
  }, false);

  /* ---------- 對外接口 ---------- */
  window.CR = {
    on: function () { return !!C.role; }, role: function () { return C.role; }, code: function () { return C.code; },
    sheet: sheet, host: host, join: join, end: end, leave: leave,
    _state: function () { return C; }, _dbg: function () { return { describe: describe, resolve: resolve, units: unitsS }; }
  };

  /* ---------- 啟動 ---------- */
  function boot() {
    css(); installWraps(); topBtn(); startObserve(); chip();
    var jm = QS.match(/[?&]join=([0-9]{6})/), keep = ss(SSK);
    function stripJoin() { try { history.replaceState(null, '', location.pathname + (SCREEN ? '?screen=1' : '') + location.hash); } catch (e) { } }
    var tries = 0;
    (function wait() {
      if (!ready() && tries++ < 60) { setTimeout(wait, 300); return; }
      if (jm) { stripJoin(); join(jm[1], SCREEN); }
      else if (keep && keep.c) { if (keep.r === 'host') host(keep.c, true); else join(keep.c, !!keep.s); }
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
