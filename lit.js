/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/lit-html@3.1.2/lit-html.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t = globalThis,
  e = t.trustedTypes,
  s = e ? e.createPolicy("lit-html", { createHTML: (t) => t }) : void 0,
  i = "$lit$",
  n = `lit$${(Math.random() + "").slice(9)}$`,
  o = "?" + n,
  r = `<${o}>`,
  h = document,
  l = () => h.createComment(""),
  $ = (t) => null === t || ("object" != typeof t && "function" != typeof t),
  A = Array.isArray,
  a = (t) => A(t) || "function" == typeof t?.[Symbol.iterator],
  _ = "[ \t\n\f\r]",
  c = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
  d = /-->/g,
  p = />/g,
  u = RegExp(
    `>|${_}(?:([^\\s"'>=/]+)(${_}*=${_}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,
    "g"
  ),
  g = /'/g,
  v = /"/g,
  f = /^(?:script|style|textarea|title)$/i,
  m =
    (t) =>
    (e, ...s) => ({ _$litType$: t, strings: e, values: s }),
  y = m(1),
  H = m(2),
  x = Symbol.for("lit-noChange"),
  N = Symbol.for("lit-nothing"),
  T = new WeakMap(),
  b = h.createTreeWalker(h, 129);
function C(t, e) {
  if (!Array.isArray(t) || !t.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return void 0 !== s ? s.createHTML(e) : e;
}
const M = (t, e) => {
  const s = t.length - 1,
    o = [];
  let h,
    l = 2 === e ? "<svg>" : "",
    $ = c;
  for (let e = 0; e < s; e++) {
    const s = t[e];
    let A,
      a,
      _ = -1,
      m = 0;
    for (; m < s.length && (($.lastIndex = m), (a = $.exec(s)), null !== a); )
      (m = $.lastIndex),
        $ === c
          ? "!--" === a[1]
            ? ($ = d)
            : void 0 !== a[1]
            ? ($ = p)
            : void 0 !== a[2]
            ? (f.test(a[2]) && (h = RegExp("</" + a[2], "g")), ($ = u))
            : void 0 !== a[3] && ($ = u)
          : $ === u
          ? ">" === a[0]
            ? (($ = h ?? c), (_ = -1))
            : void 0 === a[1]
            ? (_ = -2)
            : ((_ = $.lastIndex - a[2].length),
              (A = a[1]),
              ($ = void 0 === a[3] ? u : '"' === a[3] ? v : g))
          : $ === v || $ === g
          ? ($ = u)
          : $ === d || $ === p
          ? ($ = c)
          : (($ = u), (h = void 0));
    const y = $ === u && t[e + 1].startsWith("/>") ? " " : "";
    l +=
      $ === c
        ? s + r
        : _ >= 0
        ? (o.push(A), s.slice(0, _) + i + s.slice(_) + n + y)
        : s + n + (-2 === _ ? e : y);
  }
  return [C(t, l + (t[s] || "<?>") + (2 === e ? "</svg>" : "")), o];
};
class S {
  constructor({ strings: t, _$litType$: s }, r) {
    let h;
    this.parts = [];
    let $ = 0,
      A = 0;
    const a = t.length - 1,
      _ = this.parts,
      [c, d] = M(t, s);
    if (
      ((this.el = S.createElement(c, r)),
      (b.currentNode = this.el.content),
      2 === s)
    ) {
      const t = this.el.content.firstChild;
      t.replaceWith(...t.childNodes);
    }
    for (; null !== (h = b.nextNode()) && _.length < a; ) {
      if (1 === h.nodeType) {
        if (h.hasAttributes())
          for (const t of h.getAttributeNames())
            if (t.endsWith(i)) {
              const e = d[A++],
                s = h.getAttribute(t).split(n),
                i = /([.?@])?(.*)/.exec(e);
              _.push({
                type: 1,
                index: $,
                name: i[2],
                strings: s,
                ctor:
                  "." === i[1] ? U : "?" === i[1] ? P : "@" === i[1] ? R : B,
              }),
                h.removeAttribute(t);
            } else
              t.startsWith(n) &&
                (_.push({ type: 6, index: $ }), h.removeAttribute(t));
        if (f.test(h.tagName)) {
          const t = h.textContent.split(n),
            s = t.length - 1;
          if (s > 0) {
            h.textContent = e ? e.emptyScript : "";
            for (let e = 0; e < s; e++)
              h.append(t[e], l()),
                b.nextNode(),
                _.push({ type: 2, index: ++$ });
            h.append(t[s], l());
          }
        }
      } else if (8 === h.nodeType)
        if (h.data === o) _.push({ type: 2, index: $ });
        else {
          let t = -1;
          for (; -1 !== (t = h.data.indexOf(n, t + 1)); )
            _.push({ type: 7, index: $ }), (t += n.length - 1);
        }
      $++;
    }
  }
  static createElement(t, e) {
    const s = h.createElement("template");
    return (s.innerHTML = t), s;
  }
}
function w(t, e, s = t, i) {
  if (e === x) return e;
  let n = void 0 !== i ? s._$Co?.[i] : s._$Cl;
  const o = $(e) ? void 0 : e._$litDirective$;
  return (
    n?.constructor !== o &&
      (n?._$AO?.(!1),
      void 0 === o ? (n = void 0) : ((n = new o(t)), n._$AT(t, s, i)),
      void 0 !== i ? ((s._$Co ??= [])[i] = n) : (s._$Cl = n)),
    void 0 !== n && (e = w(t, n._$AS(t, e.values), n, i)),
    e
  );
}
class I {
  constructor(t, e) {
    (this._$AV = []), (this._$AN = void 0), (this._$AD = t), (this._$AM = e);
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const {
        el: { content: e },
        parts: s,
      } = this._$AD,
      i = (t?.creationScope ?? h).importNode(e, !0);
    b.currentNode = i;
    let n = b.nextNode(),
      o = 0,
      r = 0,
      l = s[0];
    for (; void 0 !== l; ) {
      if (o === l.index) {
        let e;
        2 === l.type
          ? (e = new E(n, n.nextSibling, this, t))
          : 1 === l.type
          ? (e = new l.ctor(n, l.name, l.strings, this, t))
          : 6 === l.type && (e = new L(n, this, t)),
          this._$AV.push(e),
          (l = s[++r]);
      }
      o !== l?.index && ((n = b.nextNode()), o++);
    }
    return (b.currentNode = h), i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV)
      void 0 !== s &&
        (void 0 !== s.strings
          ? (s._$AI(t, s, e), (e += s.strings.length - 2))
          : s._$AI(t[e])),
        e++;
  }
}
class E {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    (this.type = 2),
      (this._$AH = N),
      (this._$AN = void 0),
      (this._$AA = t),
      (this._$AB = e),
      (this._$AM = s),
      (this.options = i),
      (this._$Cv = i?.isConnected ?? !0);
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return void 0 !== e && 11 === t?.nodeType && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    (t = w(this, t, e)),
      $(t)
        ? t === N || null == t || "" === t
          ? (this._$AH !== N && this._$AR(), (this._$AH = N))
          : t !== this._$AH && t !== x && this._(t)
        : void 0 !== t._$litType$
        ? this.$(t)
        : void 0 !== t.nodeType
        ? this.T(t)
        : a(t)
        ? this.k(t)
        : this._(t);
  }
  S(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), (this._$AH = this.S(t)));
  }
  _(t) {
    this._$AH !== N && $(this._$AH)
      ? (this._$AA.nextSibling.data = t)
      : this.T(h.createTextNode(t)),
      (this._$AH = t);
  }
  $(t) {
    const { values: e, _$litType$: s } = t,
      i =
        "number" == typeof s
          ? this._$AC(t)
          : (void 0 === s.el &&
              (s.el = S.createElement(C(s.h, s.h[0]), this.options)),
            s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const t = new I(i, this),
        s = t.u(this.options);
      t.p(e), this.T(s), (this._$AH = t);
    }
  }
  _$AC(t) {
    let e = T.get(t.strings);
    return void 0 === e && T.set(t.strings, (e = new S(t))), e;
  }
  k(t) {
    A(this._$AH) || ((this._$AH = []), this._$AR());
    const e = this._$AH;
    let s,
      i = 0;
    for (const n of t)
      i === e.length
        ? e.push((s = new E(this.S(l()), this.S(l()), this, this.options)))
        : (s = e[i]),
        s._$AI(n),
        i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), (e.length = i));
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t && t !== this._$AB; ) {
      const e = t.nextSibling;
      t.remove(), (t = e);
    }
  }
  setConnected(t) {
    void 0 === this._$AM && ((this._$Cv = t), this._$AP?.(t));
  }
}
class B {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, n) {
    (this.type = 1),
      (this._$AH = N),
      (this._$AN = void 0),
      (this.element = t),
      (this.name = e),
      (this._$AM = i),
      (this.options = n),
      s.length > 2 || "" !== s[0] || "" !== s[1]
        ? ((this._$AH = Array(s.length - 1).fill(new String())),
          (this.strings = s))
        : (this._$AH = N);
  }
  _$AI(t, e = this, s, i) {
    const n = this.strings;
    let o = !1;
    if (void 0 === n)
      (t = w(this, t, e, 0)),
        (o = !$(t) || (t !== this._$AH && t !== x)),
        o && (this._$AH = t);
    else {
      const i = t;
      let r, h;
      for (t = n[0], r = 0; r < n.length - 1; r++)
        (h = w(this, i[s + r], e, r)),
          h === x && (h = this._$AH[r]),
          (o ||= !$(h) || h !== this._$AH[r]),
          h === N ? (t = N) : t !== N && (t += (h ?? "") + n[r + 1]),
          (this._$AH[r] = h);
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === N
      ? this.element.removeAttribute(this.name)
      : this.element.setAttribute(this.name, t ?? "");
  }
}
class U extends B {
  constructor() {
    super(...arguments), (this.type = 3);
  }
  j(t) {
    this.element[this.name] = t === N ? void 0 : t;
  }
}
class P extends B {
  constructor() {
    super(...arguments), (this.type = 4);
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== N);
  }
}
class R extends B {
  constructor(t, e, s, i, n) {
    super(t, e, s, i, n), (this.type = 5);
  }
  _$AI(t, e = this) {
    if ((t = w(this, t, e, 0) ?? N) === x) return;
    const s = this._$AH,
      i =
        (t === N && s !== N) ||
        t.capture !== s.capture ||
        t.once !== s.once ||
        t.passive !== s.passive,
      n = t !== N && (s === N || i);
    i && this.element.removeEventListener(this.name, this, s),
      n && this.element.addEventListener(this.name, this, t),
      (this._$AH = t);
  }
  handleEvent(t) {
    "function" == typeof this._$AH
      ? this._$AH.call(this.options?.host ?? this.element, t)
      : this._$AH.handleEvent(t);
  }
}
class L {
  constructor(t, e, s) {
    (this.element = t),
      (this.type = 6),
      (this._$AN = void 0),
      (this._$AM = e),
      (this.options = s);
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    w(this, t);
  }
}
const W = {
    P: i,
    A: n,
    C: o,
    M: 1,
    L: M,
    R: I,
    D: a,
    V: w,
    I: E,
    H: B,
    N: P,
    U: R,
    B: U,
    F: L,
  },
  j = t.litHtmlPolyfillSupport;
j?.(S, E), (t.litHtmlVersions ??= []).push("3.1.2");
const D = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let n = i._$litPart$;
  if (void 0 === n) {
    const t = s?.renderBefore ?? null;
    i._$litPart$ = n = new E(e.insertBefore(l(), t), t, void 0, s ?? {});
  }
  return n._$AI(t), n;
};
export {
  W as _$LH,
  y as html,
  x as noChange,
  N as nothing,
  D as render,
  H as svg,
};
export default null;
//# sourceMappingURL=/sm/5356316b9b10c1738c4b4d9559db5afcc3afd9d63dd6623bea45f5c9b449b8de.map
