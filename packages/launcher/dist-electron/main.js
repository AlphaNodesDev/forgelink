var mt = Object.defineProperty;
var pt = (r, e, t) => e in r ? mt(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var j = (r, e, t) => pt(r, typeof e != "symbol" ? e + "" : e, t);
import { shell as ge, app as P, BrowserWindow as tt, ipcMain as D } from "electron";
import w from "node:path";
import gt from "node:os";
import { createHash as yt, createVerify as vt, randomUUID as _t } from "node:crypto";
import { createReadStream as xt, existsSync as $, readFileSync as rt, createWriteStream as st, writeFileSync as wt } from "node:fs";
import { fileURLToPath as kt } from "node:url";
import { stat as Ce, readdir as bt, readFile as ye, mkdir as Te, rm as J, rename as St } from "node:fs/promises";
import { Readable as at } from "node:stream";
import { pipeline as nt } from "node:stream/promises";
import it from "node:net";
import { spawn as Ct } from "node:child_process";
const Tt = [
  "seven-days-to-die",
  "minecraft",
  "project-zomboid",
  "ark",
  "rust",
  "valheim",
  "palworld",
  "terraria",
  "sons-of-the-forest"
];
var x;
(function(r) {
  r.assertEqual = (a) => {
  };
  function e(a) {
  }
  r.assertIs = e;
  function t(a) {
    throw new Error();
  }
  r.assertNever = t, r.arrayToEnum = (a) => {
    const n = {};
    for (const i of a)
      n[i] = i;
    return n;
  }, r.getValidEnumValues = (a) => {
    const n = r.objectKeys(a).filter((o) => typeof a[a[o]] != "number"), i = {};
    for (const o of n)
      i[o] = a[o];
    return r.objectValues(i);
  }, r.objectValues = (a) => r.objectKeys(a).map(function(n) {
    return a[n];
  }), r.objectKeys = typeof Object.keys == "function" ? (a) => Object.keys(a) : (a) => {
    const n = [];
    for (const i in a)
      Object.prototype.hasOwnProperty.call(a, i) && n.push(i);
    return n;
  }, r.find = (a, n) => {
    for (const i of a)
      if (n(i))
        return i;
  }, r.isInteger = typeof Number.isInteger == "function" ? (a) => Number.isInteger(a) : (a) => typeof a == "number" && Number.isFinite(a) && Math.floor(a) === a;
  function s(a, n = " | ") {
    return a.map((i) => typeof i == "string" ? `'${i}'` : i).join(n);
  }
  r.joinValues = s, r.jsonStringifyReplacer = (a, n) => typeof n == "bigint" ? n.toString() : n;
})(x || (x = {}));
var Re;
(function(r) {
  r.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(Re || (Re = {}));
const f = x.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]), V = (r) => {
  switch (typeof r) {
    case "undefined":
      return f.undefined;
    case "string":
      return f.string;
    case "number":
      return Number.isNaN(r) ? f.nan : f.number;
    case "boolean":
      return f.boolean;
    case "function":
      return f.function;
    case "bigint":
      return f.bigint;
    case "symbol":
      return f.symbol;
    case "object":
      return Array.isArray(r) ? f.array : r === null ? f.null : r.then && typeof r.then == "function" && r.catch && typeof r.catch == "function" ? f.promise : typeof Map < "u" && r instanceof Map ? f.map : typeof Set < "u" && r instanceof Set ? f.set : typeof Date < "u" && r instanceof Date ? f.date : f.object;
    default:
      return f.unknown;
  }
}, d = x.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
class M extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super(), this.issues = [], this.addIssue = (s) => {
      this.issues = [...this.issues, s];
    }, this.addIssues = (s = []) => {
      this.issues = [...this.issues, ...s];
    };
    const t = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
  }
  format(e) {
    const t = e || function(n) {
      return n.message;
    }, s = { _errors: [] }, a = (n) => {
      for (const i of n.issues)
        if (i.code === "invalid_union")
          i.unionErrors.map(a);
        else if (i.code === "invalid_return_type")
          a(i.returnTypeError);
        else if (i.code === "invalid_arguments")
          a(i.argumentsError);
        else if (i.path.length === 0)
          s._errors.push(t(i));
        else {
          let o = s, c = 0;
          for (; c < i.path.length; ) {
            const l = i.path[c];
            c === i.path.length - 1 ? (o[l] = o[l] || { _errors: [] }, o[l]._errors.push(t(i))) : o[l] = o[l] || { _errors: [] }, o = o[l], c++;
          }
        }
    };
    return a(this), s;
  }
  static assert(e) {
    if (!(e instanceof M))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, x.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, s = [];
    for (const a of this.issues)
      if (a.path.length > 0) {
        const n = a.path[0];
        t[n] = t[n] || [], t[n].push(e(a));
      } else
        s.push(e(a));
    return { formErrors: s, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
M.create = (r) => new M(r);
const ve = (r, e) => {
  let t;
  switch (r.code) {
    case d.invalid_type:
      r.received === f.undefined ? t = "Required" : t = `Expected ${r.expected}, received ${r.received}`;
      break;
    case d.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(r.expected, x.jsonStringifyReplacer)}`;
      break;
    case d.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${x.joinValues(r.keys, ", ")}`;
      break;
    case d.invalid_union:
      t = "Invalid input";
      break;
    case d.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${x.joinValues(r.options)}`;
      break;
    case d.invalid_enum_value:
      t = `Invalid enum value. Expected ${x.joinValues(r.options)}, received '${r.received}'`;
      break;
    case d.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case d.invalid_return_type:
      t = "Invalid function return type";
      break;
    case d.invalid_date:
      t = "Invalid date";
      break;
    case d.invalid_string:
      typeof r.validation == "object" ? "includes" in r.validation ? (t = `Invalid input: must include "${r.validation.includes}"`, typeof r.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${r.validation.position}`)) : "startsWith" in r.validation ? t = `Invalid input: must start with "${r.validation.startsWith}"` : "endsWith" in r.validation ? t = `Invalid input: must end with "${r.validation.endsWith}"` : x.assertNever(r.validation) : r.validation !== "regex" ? t = `Invalid ${r.validation}` : t = "Invalid";
      break;
    case d.too_small:
      r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "more than"} ${r.minimum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "over"} ${r.minimum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "bigint" ? t = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(r.minimum))}` : t = "Invalid input";
      break;
    case d.too_big:
      r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "less than"} ${r.maximum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "under"} ${r.maximum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "bigint" ? t = `BigInt must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly" : r.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(r.maximum))}` : t = "Invalid input";
      break;
    case d.custom:
      t = "Invalid input";
      break;
    case d.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case d.not_multiple_of:
      t = `Number must be a multiple of ${r.multipleOf}`;
      break;
    case d.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, x.assertNever(r);
  }
  return { message: t };
};
let It = ve;
function At() {
  return It;
}
const Nt = (r) => {
  const { data: e, path: t, errorMaps: s, issueData: a } = r, n = [...t, ...a.path || []], i = {
    ...a,
    path: n
  };
  if (a.message !== void 0)
    return {
      ...a,
      path: n,
      message: a.message
    };
  let o = "";
  const c = s.filter((l) => !!l).slice().reverse();
  for (const l of c)
    o = l(i, { data: e, defaultError: o }).message;
  return {
    ...a,
    path: n,
    message: o
  };
};
function u(r, e) {
  const t = At(), s = Nt({
    issueData: e,
    data: r.data,
    path: r.path,
    errorMaps: [
      r.common.contextualErrorMap,
      // contextual error map is first priority
      r.schemaErrorMap,
      // then schema-bound map if available
      t,
      // then global override map
      t === ve ? void 0 : ve
      // then global default map
    ].filter((a) => !!a)
  });
  r.common.issues.push(s);
}
class I {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(e, t) {
    const s = [];
    for (const a of t) {
      if (a.status === "aborted")
        return p;
      a.status === "dirty" && e.dirty(), s.push(a.value);
    }
    return { status: e.value, value: s };
  }
  static async mergeObjectAsync(e, t) {
    const s = [];
    for (const a of t) {
      const n = await a.key, i = await a.value;
      s.push({
        key: n,
        value: i
      });
    }
    return I.mergeObjectSync(e, s);
  }
  static mergeObjectSync(e, t) {
    const s = {};
    for (const a of t) {
      const { key: n, value: i } = a;
      if (n.status === "aborted" || i.status === "aborted")
        return p;
      n.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), n.value !== "__proto__" && (typeof i.value < "u" || a.alwaysSet) && (s[n.value] = i.value);
    }
    return { status: e.value, value: s };
  }
}
const p = Object.freeze({
  status: "aborted"
}), ee = (r) => ({ status: "dirty", value: r }), N = (r) => ({ status: "valid", value: r }), Ze = (r) => r.status === "aborted", Pe = (r) => r.status === "dirty", H = (r) => r.status === "valid", oe = (r) => typeof Promise < "u" && r instanceof Promise;
var h;
(function(r) {
  r.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, r.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(h || (h = {}));
class F {
  constructor(e, t, s, a) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = s, this._key = a;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const Me = (r, e) => {
  if (H(e))
    return { success: !0, data: e.value };
  if (!r.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new M(r.common.issues);
      return this._error = t, this._error;
    }
  };
};
function v(r) {
  if (!r)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: s, description: a } = r;
  if (e && (t || s))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: a } : { errorMap: (i, o) => {
    const { message: c } = r;
    return i.code === "invalid_enum_value" ? { message: c ?? o.defaultError } : typeof o.data > "u" ? { message: c ?? s ?? o.defaultError } : i.code !== "invalid_type" ? { message: o.defaultError } : { message: c ?? t ?? o.defaultError };
  }, description: a };
}
class _ {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return V(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: V(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new I(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: V(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (oe(t))
      throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    const t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    const s = this.safeParse(e, t);
    if (s.success)
      return s.data;
    throw s.error;
  }
  safeParse(e, t) {
    const s = {
      common: {
        issues: [],
        async: (t == null ? void 0 : t.async) ?? !1,
        contextualErrorMap: t == null ? void 0 : t.errorMap
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: V(e)
    }, a = this._parseSync({ data: e, path: s.path, parent: s });
    return Me(s, a);
  }
  "~validate"(e) {
    var s, a;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: V(e)
    };
    if (!this["~standard"].async)
      try {
        const n = this._parseSync({ data: e, path: [], parent: t });
        return H(n) ? {
          value: n.value
        } : {
          issues: t.common.issues
        };
      } catch (n) {
        (a = (s = n == null ? void 0 : n.message) == null ? void 0 : s.toLowerCase()) != null && a.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((n) => H(n) ? {
      value: n.value
    } : {
      issues: t.common.issues
    });
  }
  async parseAsync(e, t) {
    const s = await this.safeParseAsync(e, t);
    if (s.success)
      return s.data;
    throw s.error;
  }
  async safeParseAsync(e, t) {
    const s = {
      common: {
        issues: [],
        contextualErrorMap: t == null ? void 0 : t.errorMap,
        async: !0
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: V(e)
    }, a = this._parse({ data: e, path: s.path, parent: s }), n = await (oe(a) ? a : Promise.resolve(a));
    return Me(s, n);
  }
  refine(e, t) {
    const s = (a) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(a) : t;
    return this._refinement((a, n) => {
      const i = e(a), o = () => n.addIssue({
        code: d.custom,
        ...s(a)
      });
      return typeof Promise < "u" && i instanceof Promise ? i.then((c) => c ? !0 : (o(), !1)) : i ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((s, a) => e(s) ? !0 : (a.addIssue(typeof t == "function" ? t(s, a) : t), !1));
  }
  _refinement(e) {
    return new Y({
      schema: this,
      typeName: g.ZodEffects,
      effect: { type: "refinement", refinement: e }
    });
  }
  superRefine(e) {
    return this._refinement(e);
  }
  constructor(e) {
    this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (t) => this["~validate"](t)
    };
  }
  optional() {
    return z.create(this, this._def);
  }
  nullable() {
    return X.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return R.create(this);
  }
  promise() {
    return le.create(this, this._def);
  }
  or(e) {
    return ce.create([this, e], this._def);
  }
  and(e) {
    return ue.create(this, e, this._def);
  }
  transform(e) {
    return new Y({
      ...v(this._def),
      schema: this,
      typeName: g.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ke({
      ...v(this._def),
      innerType: this,
      defaultValue: t,
      typeName: g.ZodDefault
    });
  }
  brand() {
    return new Xt({
      typeName: g.ZodBranded,
      type: this,
      ...v(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new be({
      ...v(this._def),
      innerType: this,
      catchValue: t,
      typeName: g.ZodCatch
    });
  }
  describe(e) {
    const t = this.constructor;
    return new t({
      ...this._def,
      description: e
    });
  }
  pipe(e) {
    return Ie.create(this, e);
  }
  readonly() {
    return Se.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Ot = /^c[^\s-]{8,}$/i, jt = /^[0-9a-z]+$/, Et = /^[0-9A-HJKMNP-TV-Z]{26}$/i, $t = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Rt = /^[a-z0-9_-]{21}$/i, Zt = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Pt = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Mt = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Dt = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let me;
const Vt = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Lt = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, zt = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Ut = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ft = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Bt = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, ot = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Wt = new RegExp(`^${ot}$`);
function dt(r) {
  let e = "[0-5]\\d";
  r.precision ? e = `${e}\\.\\d{${r.precision}}` : r.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = r.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function qt(r) {
  return new RegExp(`^${dt(r)}$`);
}
function Jt(r) {
  let e = `${ot}T${dt(r)}`;
  const t = [];
  return t.push(r.local ? "Z?" : "Z"), r.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Ht(r, e) {
  return !!((e === "v4" || !e) && Vt.test(r) || (e === "v6" || !e) && zt.test(r));
}
function Gt(r, e) {
  if (!Zt.test(r))
    return !1;
  try {
    const [t] = r.split(".");
    if (!t)
      return !1;
    const s = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), a = JSON.parse(atob(s));
    return !(typeof a != "object" || a === null || "typ" in a && (a == null ? void 0 : a.typ) !== "JWT" || !a.alg || e && a.alg !== e);
  } catch {
    return !1;
  }
}
function Kt(r, e) {
  return !!((e === "v4" || !e) && Lt.test(r) || (e === "v6" || !e) && Ut.test(r));
}
class L extends _ {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== f.string) {
      const n = this._getOrReturnCtx(e);
      return u(n, {
        code: d.invalid_type,
        expected: f.string,
        received: n.parsedType
      }), p;
    }
    const s = new I();
    let a;
    for (const n of this._def.checks)
      if (n.kind === "min")
        e.data.length < n.value && (a = this._getOrReturnCtx(e, a), u(a, {
          code: d.too_small,
          minimum: n.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: n.message
        }), s.dirty());
      else if (n.kind === "max")
        e.data.length > n.value && (a = this._getOrReturnCtx(e, a), u(a, {
          code: d.too_big,
          maximum: n.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: n.message
        }), s.dirty());
      else if (n.kind === "length") {
        const i = e.data.length > n.value, o = e.data.length < n.value;
        (i || o) && (a = this._getOrReturnCtx(e, a), i ? u(a, {
          code: d.too_big,
          maximum: n.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: n.message
        }) : o && u(a, {
          code: d.too_small,
          minimum: n.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: n.message
        }), s.dirty());
      } else if (n.kind === "email")
        Mt.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
          validation: "email",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "emoji")
        me || (me = new RegExp(Dt, "u")), me.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
          validation: "emoji",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "uuid")
        $t.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
          validation: "uuid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "nanoid")
        Rt.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
          validation: "nanoid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "cuid")
        Ot.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
          validation: "cuid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "cuid2")
        jt.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
          validation: "cuid2",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "ulid")
        Et.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
          validation: "ulid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "url")
        try {
          new URL(e.data);
        } catch {
          a = this._getOrReturnCtx(e, a), u(a, {
            validation: "url",
            code: d.invalid_string,
            message: n.message
          }), s.dirty();
        }
      else n.kind === "regex" ? (n.regex.lastIndex = 0, n.regex.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
        validation: "regex",
        code: d.invalid_string,
        message: n.message
      }), s.dirty())) : n.kind === "trim" ? e.data = e.data.trim() : n.kind === "includes" ? e.data.includes(n.value, n.position) || (a = this._getOrReturnCtx(e, a), u(a, {
        code: d.invalid_string,
        validation: { includes: n.value, position: n.position },
        message: n.message
      }), s.dirty()) : n.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : n.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : n.kind === "startsWith" ? e.data.startsWith(n.value) || (a = this._getOrReturnCtx(e, a), u(a, {
        code: d.invalid_string,
        validation: { startsWith: n.value },
        message: n.message
      }), s.dirty()) : n.kind === "endsWith" ? e.data.endsWith(n.value) || (a = this._getOrReturnCtx(e, a), u(a, {
        code: d.invalid_string,
        validation: { endsWith: n.value },
        message: n.message
      }), s.dirty()) : n.kind === "datetime" ? Jt(n).test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
        code: d.invalid_string,
        validation: "datetime",
        message: n.message
      }), s.dirty()) : n.kind === "date" ? Wt.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
        code: d.invalid_string,
        validation: "date",
        message: n.message
      }), s.dirty()) : n.kind === "time" ? qt(n).test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
        code: d.invalid_string,
        validation: "time",
        message: n.message
      }), s.dirty()) : n.kind === "duration" ? Pt.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
        validation: "duration",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "ip" ? Ht(e.data, n.version) || (a = this._getOrReturnCtx(e, a), u(a, {
        validation: "ip",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "jwt" ? Gt(e.data, n.alg) || (a = this._getOrReturnCtx(e, a), u(a, {
        validation: "jwt",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "cidr" ? Kt(e.data, n.version) || (a = this._getOrReturnCtx(e, a), u(a, {
        validation: "cidr",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "base64" ? Ft.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
        validation: "base64",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "base64url" ? Bt.test(e.data) || (a = this._getOrReturnCtx(e, a), u(a, {
        validation: "base64url",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : x.assertNever(n);
    return { status: s.value, value: e.data };
  }
  _regex(e, t, s) {
    return this.refinement((a) => e.test(a), {
      validation: t,
      code: d.invalid_string,
      ...h.errToObj(s)
    });
  }
  _addCheck(e) {
    return new L({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...h.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...h.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...h.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...h.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...h.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...h.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...h.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...h.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...h.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...h.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...h.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...h.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...h.errToObj(e) });
  }
  datetime(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "datetime",
      precision: null,
      offset: !1,
      local: !1,
      message: e
    }) : this._addCheck({
      kind: "datetime",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      offset: (e == null ? void 0 : e.offset) ?? !1,
      local: (e == null ? void 0 : e.local) ?? !1,
      ...h.errToObj(e == null ? void 0 : e.message)
    });
  }
  date(e) {
    return this._addCheck({ kind: "date", message: e });
  }
  time(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "time",
      precision: null,
      message: e
    }) : this._addCheck({
      kind: "time",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      ...h.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...h.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...h.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...h.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...h.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...h.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...h.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...h.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...h.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, h.errToObj(e));
  }
  trim() {
    return new L({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new L({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new L({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((e) => e.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((e) => e.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((e) => e.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((e) => e.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((e) => e.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((e) => e.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((e) => e.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((e) => e.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((e) => e.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((e) => e.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((e) => e.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((e) => e.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((e) => e.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((e) => e.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((e) => e.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((e) => e.kind === "base64url");
  }
  get minLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
}
L.create = (r) => new L({
  checks: [],
  typeName: g.ZodString,
  coerce: (r == null ? void 0 : r.coerce) ?? !1,
  ...v(r)
});
function Yt(r, e) {
  const t = (r.toString().split(".")[1] || "").length, s = (e.toString().split(".")[1] || "").length, a = t > s ? t : s, n = Number.parseInt(r.toFixed(a).replace(".", "")), i = Number.parseInt(e.toFixed(a).replace(".", ""));
  return n % i / 10 ** a;
}
class G extends _ {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== f.number) {
      const n = this._getOrReturnCtx(e);
      return u(n, {
        code: d.invalid_type,
        expected: f.number,
        received: n.parsedType
      }), p;
    }
    let s;
    const a = new I();
    for (const n of this._def.checks)
      n.kind === "int" ? x.isInteger(e.data) || (s = this._getOrReturnCtx(e, s), u(s, {
        code: d.invalid_type,
        expected: "integer",
        received: "float",
        message: n.message
      }), a.dirty()) : n.kind === "min" ? (n.inclusive ? e.data < n.value : e.data <= n.value) && (s = this._getOrReturnCtx(e, s), u(s, {
        code: d.too_small,
        minimum: n.value,
        type: "number",
        inclusive: n.inclusive,
        exact: !1,
        message: n.message
      }), a.dirty()) : n.kind === "max" ? (n.inclusive ? e.data > n.value : e.data >= n.value) && (s = this._getOrReturnCtx(e, s), u(s, {
        code: d.too_big,
        maximum: n.value,
        type: "number",
        inclusive: n.inclusive,
        exact: !1,
        message: n.message
      }), a.dirty()) : n.kind === "multipleOf" ? Yt(e.data, n.value) !== 0 && (s = this._getOrReturnCtx(e, s), u(s, {
        code: d.not_multiple_of,
        multipleOf: n.value,
        message: n.message
      }), a.dirty()) : n.kind === "finite" ? Number.isFinite(e.data) || (s = this._getOrReturnCtx(e, s), u(s, {
        code: d.not_finite,
        message: n.message
      }), a.dirty()) : x.assertNever(n);
    return { status: a.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, h.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, h.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, h.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, h.toString(t));
  }
  setLimit(e, t, s, a) {
    return new G({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: h.toString(a)
        }
      ]
    });
  }
  _addCheck(e) {
    return new G({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: h.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: h.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: h.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: h.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: h.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: h.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: h.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: h.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: h.toString(e)
    });
  }
  get minValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
  get isInt() {
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && x.isInteger(e.value));
  }
  get isFinite() {
    let e = null, t = null;
    for (const s of this._def.checks) {
      if (s.kind === "finite" || s.kind === "int" || s.kind === "multipleOf")
        return !0;
      s.kind === "min" ? (t === null || s.value > t) && (t = s.value) : s.kind === "max" && (e === null || s.value < e) && (e = s.value);
    }
    return Number.isFinite(t) && Number.isFinite(e);
  }
}
G.create = (r) => new G({
  checks: [],
  typeName: g.ZodNumber,
  coerce: (r == null ? void 0 : r.coerce) || !1,
  ...v(r)
});
class te extends _ {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte;
  }
  _parse(e) {
    if (this._def.coerce)
      try {
        e.data = BigInt(e.data);
      } catch {
        return this._getInvalidInput(e);
      }
    if (this._getType(e) !== f.bigint)
      return this._getInvalidInput(e);
    let s;
    const a = new I();
    for (const n of this._def.checks)
      n.kind === "min" ? (n.inclusive ? e.data < n.value : e.data <= n.value) && (s = this._getOrReturnCtx(e, s), u(s, {
        code: d.too_small,
        type: "bigint",
        minimum: n.value,
        inclusive: n.inclusive,
        message: n.message
      }), a.dirty()) : n.kind === "max" ? (n.inclusive ? e.data > n.value : e.data >= n.value) && (s = this._getOrReturnCtx(e, s), u(s, {
        code: d.too_big,
        type: "bigint",
        maximum: n.value,
        inclusive: n.inclusive,
        message: n.message
      }), a.dirty()) : n.kind === "multipleOf" ? e.data % n.value !== BigInt(0) && (s = this._getOrReturnCtx(e, s), u(s, {
        code: d.not_multiple_of,
        multipleOf: n.value,
        message: n.message
      }), a.dirty()) : x.assertNever(n);
    return { status: a.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return u(t, {
      code: d.invalid_type,
      expected: f.bigint,
      received: t.parsedType
    }), p;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, h.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, h.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, h.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, h.toString(t));
  }
  setLimit(e, t, s, a) {
    return new te({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: h.toString(a)
        }
      ]
    });
  }
  _addCheck(e) {
    return new te({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: h.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: h.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: h.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: h.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: h.toString(t)
    });
  }
  get minValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
}
te.create = (r) => new te({
  checks: [],
  typeName: g.ZodBigInt,
  coerce: (r == null ? void 0 : r.coerce) ?? !1,
  ...v(r)
});
class _e extends _ {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== f.boolean) {
      const s = this._getOrReturnCtx(e);
      return u(s, {
        code: d.invalid_type,
        expected: f.boolean,
        received: s.parsedType
      }), p;
    }
    return N(e.data);
  }
}
_e.create = (r) => new _e({
  typeName: g.ZodBoolean,
  coerce: (r == null ? void 0 : r.coerce) || !1,
  ...v(r)
});
class de extends _ {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== f.date) {
      const n = this._getOrReturnCtx(e);
      return u(n, {
        code: d.invalid_type,
        expected: f.date,
        received: n.parsedType
      }), p;
    }
    if (Number.isNaN(e.data.getTime())) {
      const n = this._getOrReturnCtx(e);
      return u(n, {
        code: d.invalid_date
      }), p;
    }
    const s = new I();
    let a;
    for (const n of this._def.checks)
      n.kind === "min" ? e.data.getTime() < n.value && (a = this._getOrReturnCtx(e, a), u(a, {
        code: d.too_small,
        message: n.message,
        inclusive: !0,
        exact: !1,
        minimum: n.value,
        type: "date"
      }), s.dirty()) : n.kind === "max" ? e.data.getTime() > n.value && (a = this._getOrReturnCtx(e, a), u(a, {
        code: d.too_big,
        message: n.message,
        inclusive: !0,
        exact: !1,
        maximum: n.value,
        type: "date"
      }), s.dirty()) : x.assertNever(n);
    return {
      status: s.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new de({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: h.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: h.toString(t)
    });
  }
  get minDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
  get maxDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
}
de.create = (r) => new de({
  checks: [],
  coerce: (r == null ? void 0 : r.coerce) || !1,
  typeName: g.ZodDate,
  ...v(r)
});
class De extends _ {
  _parse(e) {
    if (this._getType(e) !== f.symbol) {
      const s = this._getOrReturnCtx(e);
      return u(s, {
        code: d.invalid_type,
        expected: f.symbol,
        received: s.parsedType
      }), p;
    }
    return N(e.data);
  }
}
De.create = (r) => new De({
  typeName: g.ZodSymbol,
  ...v(r)
});
class Ve extends _ {
  _parse(e) {
    if (this._getType(e) !== f.undefined) {
      const s = this._getOrReturnCtx(e);
      return u(s, {
        code: d.invalid_type,
        expected: f.undefined,
        received: s.parsedType
      }), p;
    }
    return N(e.data);
  }
}
Ve.create = (r) => new Ve({
  typeName: g.ZodUndefined,
  ...v(r)
});
class Le extends _ {
  _parse(e) {
    if (this._getType(e) !== f.null) {
      const s = this._getOrReturnCtx(e);
      return u(s, {
        code: d.invalid_type,
        expected: f.null,
        received: s.parsedType
      }), p;
    }
    return N(e.data);
  }
}
Le.create = (r) => new Le({
  typeName: g.ZodNull,
  ...v(r)
});
class ze extends _ {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return N(e.data);
  }
}
ze.create = (r) => new ze({
  typeName: g.ZodAny,
  ...v(r)
});
class Ue extends _ {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return N(e.data);
  }
}
Ue.create = (r) => new Ue({
  typeName: g.ZodUnknown,
  ...v(r)
});
class B extends _ {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return u(t, {
      code: d.invalid_type,
      expected: f.never,
      received: t.parsedType
    }), p;
  }
}
B.create = (r) => new B({
  typeName: g.ZodNever,
  ...v(r)
});
class Fe extends _ {
  _parse(e) {
    if (this._getType(e) !== f.undefined) {
      const s = this._getOrReturnCtx(e);
      return u(s, {
        code: d.invalid_type,
        expected: f.void,
        received: s.parsedType
      }), p;
    }
    return N(e.data);
  }
}
Fe.create = (r) => new Fe({
  typeName: g.ZodVoid,
  ...v(r)
});
class R extends _ {
  _parse(e) {
    const { ctx: t, status: s } = this._processInputParams(e), a = this._def;
    if (t.parsedType !== f.array)
      return u(t, {
        code: d.invalid_type,
        expected: f.array,
        received: t.parsedType
      }), p;
    if (a.exactLength !== null) {
      const i = t.data.length > a.exactLength.value, o = t.data.length < a.exactLength.value;
      (i || o) && (u(t, {
        code: i ? d.too_big : d.too_small,
        minimum: o ? a.exactLength.value : void 0,
        maximum: i ? a.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: a.exactLength.message
      }), s.dirty());
    }
    if (a.minLength !== null && t.data.length < a.minLength.value && (u(t, {
      code: d.too_small,
      minimum: a.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: a.minLength.message
    }), s.dirty()), a.maxLength !== null && t.data.length > a.maxLength.value && (u(t, {
      code: d.too_big,
      maximum: a.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: a.maxLength.message
    }), s.dirty()), t.common.async)
      return Promise.all([...t.data].map((i, o) => a.type._parseAsync(new F(t, i, t.path, o)))).then((i) => I.mergeArray(s, i));
    const n = [...t.data].map((i, o) => a.type._parseSync(new F(t, i, t.path, o)));
    return I.mergeArray(s, n);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new R({
      ...this._def,
      minLength: { value: e, message: h.toString(t) }
    });
  }
  max(e, t) {
    return new R({
      ...this._def,
      maxLength: { value: e, message: h.toString(t) }
    });
  }
  length(e, t) {
    return new R({
      ...this._def,
      exactLength: { value: e, message: h.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
R.create = (r, e) => new R({
  type: r,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: g.ZodArray,
  ...v(e)
});
function q(r) {
  if (r instanceof k) {
    const e = {};
    for (const t in r.shape) {
      const s = r.shape[t];
      e[t] = z.create(q(s));
    }
    return new k({
      ...r._def,
      shape: () => e
    });
  } else return r instanceof R ? new R({
    ...r._def,
    type: q(r.element)
  }) : r instanceof z ? z.create(q(r.unwrap())) : r instanceof X ? X.create(q(r.unwrap())) : r instanceof W ? W.create(r.items.map((e) => q(e))) : r;
}
class k extends _ {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = x.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== f.object) {
      const l = this._getOrReturnCtx(e);
      return u(l, {
        code: d.invalid_type,
        expected: f.object,
        received: l.parsedType
      }), p;
    }
    const { status: s, ctx: a } = this._processInputParams(e), { shape: n, keys: i } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof B && this._def.unknownKeys === "strip"))
      for (const l in a.data)
        i.includes(l) || o.push(l);
    const c = [];
    for (const l of i) {
      const y = n[l], b = a.data[l];
      c.push({
        key: { status: "valid", value: l },
        value: y._parse(new F(a, b, a.path, l)),
        alwaysSet: l in a.data
      });
    }
    if (this._def.catchall instanceof B) {
      const l = this._def.unknownKeys;
      if (l === "passthrough")
        for (const y of o)
          c.push({
            key: { status: "valid", value: y },
            value: { status: "valid", value: a.data[y] }
          });
      else if (l === "strict")
        o.length > 0 && (u(a, {
          code: d.unrecognized_keys,
          keys: o
        }), s.dirty());
      else if (l !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const l = this._def.catchall;
      for (const y of o) {
        const b = a.data[y];
        c.push({
          key: { status: "valid", value: y },
          value: l._parse(
            new F(a, b, a.path, y)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: y in a.data
        });
      }
    }
    return a.common.async ? Promise.resolve().then(async () => {
      const l = [];
      for (const y of c) {
        const b = await y.key, O = await y.value;
        l.push({
          key: b,
          value: O,
          alwaysSet: y.alwaysSet
        });
      }
      return l;
    }).then((l) => I.mergeObjectSync(s, l)) : I.mergeObjectSync(s, c);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return h.errToObj, new k({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, s) => {
          var n, i;
          const a = ((i = (n = this._def).errorMap) == null ? void 0 : i.call(n, t, s).message) ?? s.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: h.errToObj(e).message ?? a
          } : {
            message: a
          };
        }
      } : {}
    });
  }
  strip() {
    return new k({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new k({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(e) {
    return new k({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...e
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(e) {
    return new k({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: g.ZodObject
    });
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(e, t) {
    return this.augment({ [e]: t });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(e) {
    return new k({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const s of x.objectKeys(e))
      e[s] && this.shape[s] && (t[s] = this.shape[s]);
    return new k({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const s of x.objectKeys(this.shape))
      e[s] || (t[s] = this.shape[s]);
    return new k({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return q(this);
  }
  partial(e) {
    const t = {};
    for (const s of x.objectKeys(this.shape)) {
      const a = this.shape[s];
      e && !e[s] ? t[s] = a : t[s] = a.optional();
    }
    return new k({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const s of x.objectKeys(this.shape))
      if (e && !e[s])
        t[s] = this.shape[s];
      else {
        let n = this.shape[s];
        for (; n instanceof z; )
          n = n._def.innerType;
        t[s] = n;
      }
    return new k({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return ct(x.objectKeys(this.shape));
  }
}
k.create = (r, e) => new k({
  shape: () => r,
  unknownKeys: "strip",
  catchall: B.create(),
  typeName: g.ZodObject,
  ...v(e)
});
k.strictCreate = (r, e) => new k({
  shape: () => r,
  unknownKeys: "strict",
  catchall: B.create(),
  typeName: g.ZodObject,
  ...v(e)
});
k.lazycreate = (r, e) => new k({
  shape: r,
  unknownKeys: "strip",
  catchall: B.create(),
  typeName: g.ZodObject,
  ...v(e)
});
class ce extends _ {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = this._def.options;
    function a(n) {
      for (const o of n)
        if (o.result.status === "valid")
          return o.result;
      for (const o of n)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const i = n.map((o) => new M(o.ctx.common.issues));
      return u(t, {
        code: d.invalid_union,
        unionErrors: i
      }), p;
    }
    if (t.common.async)
      return Promise.all(s.map(async (n) => {
        const i = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await n._parseAsync({
            data: t.data,
            path: t.path,
            parent: i
          }),
          ctx: i
        };
      })).then(a);
    {
      let n;
      const i = [];
      for (const c of s) {
        const l = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, y = c._parseSync({
          data: t.data,
          path: t.path,
          parent: l
        });
        if (y.status === "valid")
          return y;
        y.status === "dirty" && !n && (n = { result: y, ctx: l }), l.common.issues.length && i.push(l.common.issues);
      }
      if (n)
        return t.common.issues.push(...n.ctx.common.issues), n.result;
      const o = i.map((c) => new M(c));
      return u(t, {
        code: d.invalid_union,
        unionErrors: o
      }), p;
    }
  }
  get options() {
    return this._def.options;
  }
}
ce.create = (r, e) => new ce({
  options: r,
  typeName: g.ZodUnion,
  ...v(e)
});
function xe(r, e) {
  const t = V(r), s = V(e);
  if (r === e)
    return { valid: !0, data: r };
  if (t === f.object && s === f.object) {
    const a = x.objectKeys(e), n = x.objectKeys(r).filter((o) => a.indexOf(o) !== -1), i = { ...r, ...e };
    for (const o of n) {
      const c = xe(r[o], e[o]);
      if (!c.valid)
        return { valid: !1 };
      i[o] = c.data;
    }
    return { valid: !0, data: i };
  } else if (t === f.array && s === f.array) {
    if (r.length !== e.length)
      return { valid: !1 };
    const a = [];
    for (let n = 0; n < r.length; n++) {
      const i = r[n], o = e[n], c = xe(i, o);
      if (!c.valid)
        return { valid: !1 };
      a.push(c.data);
    }
    return { valid: !0, data: a };
  } else return t === f.date && s === f.date && +r == +e ? { valid: !0, data: r } : { valid: !1 };
}
class ue extends _ {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), a = (n, i) => {
      if (Ze(n) || Ze(i))
        return p;
      const o = xe(n.value, i.value);
      return o.valid ? ((Pe(n) || Pe(i)) && t.dirty(), { status: t.value, value: o.data }) : (u(s, {
        code: d.invalid_intersection_types
      }), p);
    };
    return s.common.async ? Promise.all([
      this._def.left._parseAsync({
        data: s.data,
        path: s.path,
        parent: s
      }),
      this._def.right._parseAsync({
        data: s.data,
        path: s.path,
        parent: s
      })
    ]).then(([n, i]) => a(n, i)) : a(this._def.left._parseSync({
      data: s.data,
      path: s.path,
      parent: s
    }), this._def.right._parseSync({
      data: s.data,
      path: s.path,
      parent: s
    }));
  }
}
ue.create = (r, e, t) => new ue({
  left: r,
  right: e,
  typeName: g.ZodIntersection,
  ...v(t)
});
class W extends _ {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== f.array)
      return u(s, {
        code: d.invalid_type,
        expected: f.array,
        received: s.parsedType
      }), p;
    if (s.data.length < this._def.items.length)
      return u(s, {
        code: d.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), p;
    !this._def.rest && s.data.length > this._def.items.length && (u(s, {
      code: d.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const n = [...s.data].map((i, o) => {
      const c = this._def.items[o] || this._def.rest;
      return c ? c._parse(new F(s, i, s.path, o)) : null;
    }).filter((i) => !!i);
    return s.common.async ? Promise.all(n).then((i) => I.mergeArray(t, i)) : I.mergeArray(t, n);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new W({
      ...this._def,
      rest: e
    });
  }
}
W.create = (r, e) => {
  if (!Array.isArray(r))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new W({
    items: r,
    typeName: g.ZodTuple,
    rest: null,
    ...v(e)
  });
};
class Be extends _ {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== f.map)
      return u(s, {
        code: d.invalid_type,
        expected: f.map,
        received: s.parsedType
      }), p;
    const a = this._def.keyType, n = this._def.valueType, i = [...s.data.entries()].map(([o, c], l) => ({
      key: a._parse(new F(s, o, s.path, [l, "key"])),
      value: n._parse(new F(s, c, s.path, [l, "value"]))
    }));
    if (s.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const c of i) {
          const l = await c.key, y = await c.value;
          if (l.status === "aborted" || y.status === "aborted")
            return p;
          (l.status === "dirty" || y.status === "dirty") && t.dirty(), o.set(l.value, y.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const c of i) {
        const l = c.key, y = c.value;
        if (l.status === "aborted" || y.status === "aborted")
          return p;
        (l.status === "dirty" || y.status === "dirty") && t.dirty(), o.set(l.value, y.value);
      }
      return { status: t.value, value: o };
    }
  }
}
Be.create = (r, e, t) => new Be({
  valueType: e,
  keyType: r,
  typeName: g.ZodMap,
  ...v(t)
});
class re extends _ {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== f.set)
      return u(s, {
        code: d.invalid_type,
        expected: f.set,
        received: s.parsedType
      }), p;
    const a = this._def;
    a.minSize !== null && s.data.size < a.minSize.value && (u(s, {
      code: d.too_small,
      minimum: a.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: a.minSize.message
    }), t.dirty()), a.maxSize !== null && s.data.size > a.maxSize.value && (u(s, {
      code: d.too_big,
      maximum: a.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: a.maxSize.message
    }), t.dirty());
    const n = this._def.valueType;
    function i(c) {
      const l = /* @__PURE__ */ new Set();
      for (const y of c) {
        if (y.status === "aborted")
          return p;
        y.status === "dirty" && t.dirty(), l.add(y.value);
      }
      return { status: t.value, value: l };
    }
    const o = [...s.data.values()].map((c, l) => n._parse(new F(s, c, s.path, l)));
    return s.common.async ? Promise.all(o).then((c) => i(c)) : i(o);
  }
  min(e, t) {
    return new re({
      ...this._def,
      minSize: { value: e, message: h.toString(t) }
    });
  }
  max(e, t) {
    return new re({
      ...this._def,
      maxSize: { value: e, message: h.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
re.create = (r, e) => new re({
  valueType: r,
  minSize: null,
  maxSize: null,
  typeName: g.ZodSet,
  ...v(e)
});
class We extends _ {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
We.create = (r, e) => new We({
  getter: r,
  typeName: g.ZodLazy,
  ...v(e)
});
class we extends _ {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return u(t, {
        received: t.data,
        code: d.invalid_literal,
        expected: this._def.value
      }), p;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
we.create = (r, e) => new we({
  value: r,
  typeName: g.ZodLiteral,
  ...v(e)
});
function ct(r, e) {
  return new K({
    values: r,
    typeName: g.ZodEnum,
    ...v(e)
  });
}
class K extends _ {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return u(t, {
        expected: x.joinValues(s),
        received: t.parsedType,
        code: d.invalid_type
      }), p;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return u(t, {
        received: t.data,
        code: d.invalid_enum_value,
        options: s
      }), p;
    }
    return N(e.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  get Values() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  get Enum() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  extract(e, t = this._def) {
    return K.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return K.create(this.options.filter((s) => !e.includes(s)), {
      ...this._def,
      ...t
    });
  }
}
K.create = ct;
class qe extends _ {
  _parse(e) {
    const t = x.getValidEnumValues(this._def.values), s = this._getOrReturnCtx(e);
    if (s.parsedType !== f.string && s.parsedType !== f.number) {
      const a = x.objectValues(t);
      return u(s, {
        expected: x.joinValues(a),
        received: s.parsedType,
        code: d.invalid_type
      }), p;
    }
    if (this._cache || (this._cache = new Set(x.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const a = x.objectValues(t);
      return u(s, {
        received: s.data,
        code: d.invalid_enum_value,
        options: a
      }), p;
    }
    return N(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
qe.create = (r, e) => new qe({
  values: r,
  typeName: g.ZodNativeEnum,
  ...v(e)
});
class le extends _ {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== f.promise && t.common.async === !1)
      return u(t, {
        code: d.invalid_type,
        expected: f.promise,
        received: t.parsedType
      }), p;
    const s = t.parsedType === f.promise ? t.data : Promise.resolve(t.data);
    return N(s.then((a) => this._def.type.parseAsync(a, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
le.create = (r, e) => new le({
  type: r,
  typeName: g.ZodPromise,
  ...v(e)
});
class Y extends _ {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === g.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), a = this._def.effect || null, n = {
      addIssue: (i) => {
        u(s, i), i.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return s.path;
      }
    };
    if (n.addIssue = n.addIssue.bind(n), a.type === "preprocess") {
      const i = a.transform(s.data, n);
      if (s.common.async)
        return Promise.resolve(i).then(async (o) => {
          if (t.value === "aborted")
            return p;
          const c = await this._def.schema._parseAsync({
            data: o,
            path: s.path,
            parent: s
          });
          return c.status === "aborted" ? p : c.status === "dirty" || t.value === "dirty" ? ee(c.value) : c;
        });
      {
        if (t.value === "aborted")
          return p;
        const o = this._def.schema._parseSync({
          data: i,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? p : o.status === "dirty" || t.value === "dirty" ? ee(o.value) : o;
      }
    }
    if (a.type === "refinement") {
      const i = (o) => {
        const c = a.refinement(o, n);
        if (s.common.async)
          return Promise.resolve(c);
        if (c instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return o;
      };
      if (s.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? p : (o.status === "dirty" && t.dirty(), i(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((o) => o.status === "aborted" ? p : (o.status === "dirty" && t.dirty(), i(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (a.type === "transform")
      if (s.common.async === !1) {
        const i = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        if (!H(i))
          return p;
        const o = a.transform(i.value, n);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((i) => H(i) ? Promise.resolve(a.transform(i.value, n)).then((o) => ({
          status: t.value,
          value: o
        })) : p);
    x.assertNever(a);
  }
}
Y.create = (r, e, t) => new Y({
  schema: r,
  typeName: g.ZodEffects,
  effect: e,
  ...v(t)
});
Y.createWithPreprocess = (r, e, t) => new Y({
  schema: e,
  effect: { type: "preprocess", transform: r },
  typeName: g.ZodEffects,
  ...v(t)
});
class z extends _ {
  _parse(e) {
    return this._getType(e) === f.undefined ? N(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
z.create = (r, e) => new z({
  innerType: r,
  typeName: g.ZodOptional,
  ...v(e)
});
class X extends _ {
  _parse(e) {
    return this._getType(e) === f.null ? N(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
X.create = (r, e) => new X({
  innerType: r,
  typeName: g.ZodNullable,
  ...v(e)
});
class ke extends _ {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let s = t.data;
    return t.parsedType === f.undefined && (s = this._def.defaultValue()), this._def.innerType._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ke.create = (r, e) => new ke({
  innerType: r,
  typeName: g.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...v(e)
});
class be extends _ {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, a = this._def.innerType._parse({
      data: s.data,
      path: s.path,
      parent: {
        ...s
      }
    });
    return oe(a) ? a.then((n) => ({
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
        get error() {
          return new M(s.common.issues);
        },
        input: s.data
      })
    })) : {
      status: "valid",
      value: a.status === "valid" ? a.value : this._def.catchValue({
        get error() {
          return new M(s.common.issues);
        },
        input: s.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
be.create = (r, e) => new be({
  innerType: r,
  typeName: g.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...v(e)
});
class Je extends _ {
  _parse(e) {
    if (this._getType(e) !== f.nan) {
      const s = this._getOrReturnCtx(e);
      return u(s, {
        code: d.invalid_type,
        expected: f.nan,
        received: s.parsedType
      }), p;
    }
    return { status: "valid", value: e.data };
  }
}
Je.create = (r) => new Je({
  typeName: g.ZodNaN,
  ...v(r)
});
class Xt extends _ {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = t.data;
    return this._def.type._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class Ie extends _ {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.common.async)
      return (async () => {
        const n = await this._def.in._parseAsync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return n.status === "aborted" ? p : n.status === "dirty" ? (t.dirty(), ee(n.value)) : this._def.out._parseAsync({
          data: n.value,
          path: s.path,
          parent: s
        });
      })();
    {
      const a = this._def.in._parseSync({
        data: s.data,
        path: s.path,
        parent: s
      });
      return a.status === "aborted" ? p : a.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: a.value
      }) : this._def.out._parseSync({
        data: a.value,
        path: s.path,
        parent: s
      });
    }
  }
  static create(e, t) {
    return new Ie({
      in: e,
      out: t,
      typeName: g.ZodPipeline
    });
  }
}
class Se extends _ {
  _parse(e) {
    const t = this._def.innerType._parse(e), s = (a) => (H(a) && (a.value = Object.freeze(a.value)), a);
    return oe(t) ? t.then((a) => s(a)) : s(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Se.create = (r, e) => new Se({
  innerType: r,
  typeName: g.ZodReadonly,
  ...v(e)
});
var g;
(function(r) {
  r.ZodString = "ZodString", r.ZodNumber = "ZodNumber", r.ZodNaN = "ZodNaN", r.ZodBigInt = "ZodBigInt", r.ZodBoolean = "ZodBoolean", r.ZodDate = "ZodDate", r.ZodSymbol = "ZodSymbol", r.ZodUndefined = "ZodUndefined", r.ZodNull = "ZodNull", r.ZodAny = "ZodAny", r.ZodUnknown = "ZodUnknown", r.ZodNever = "ZodNever", r.ZodVoid = "ZodVoid", r.ZodArray = "ZodArray", r.ZodObject = "ZodObject", r.ZodUnion = "ZodUnion", r.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", r.ZodIntersection = "ZodIntersection", r.ZodTuple = "ZodTuple", r.ZodRecord = "ZodRecord", r.ZodMap = "ZodMap", r.ZodSet = "ZodSet", r.ZodFunction = "ZodFunction", r.ZodLazy = "ZodLazy", r.ZodLiteral = "ZodLiteral", r.ZodEnum = "ZodEnum", r.ZodEffects = "ZodEffects", r.ZodNativeEnum = "ZodNativeEnum", r.ZodOptional = "ZodOptional", r.ZodNullable = "ZodNullable", r.ZodDefault = "ZodDefault", r.ZodCatch = "ZodCatch", r.ZodPromise = "ZodPromise", r.ZodBranded = "ZodBranded", r.ZodPipeline = "ZodPipeline", r.ZodReadonly = "ZodReadonly";
})(g || (g = {}));
const m = L.create, U = G.create, T = _e.create;
B.create;
const Ae = R.create, A = k.create;
ce.create;
ue.create;
W.create;
const se = we.create, ne = K.create;
le.create;
z.create;
X.create;
const Ne = ne(Tt), Qt = ne(["public", "private"]), er = ne(["nginx", "apache", "none"]), tr = ne(["dark", "light"]), rr = ne(["sqlite", "postgres"]), sr = A({
  name: m().min(1, "Project name is required").max(120),
  gameId: Ne,
  serverName: m().min(1, "Server name is required").max(120),
  description: m().max(2e3).default(""),
  version: m().min(1).default("1.0.0"),
  owner: m().min(1, "Owner is required").max(120)
}), ar = A({
  serverIp: m().min(1, "Server IP or hostname is required"),
  /** API/web port. */
  port: U().int().min(1).max(65535).default(443),
  /** Game traffic port. */
  gamePort: U().int().min(1).max(65535).default(26900),
  queryPort: U().int().min(1).max(65535).default(26900),
  region: m().default("NA"),
  serverPassword: m().default(""),
  adminPassword: m().default(""),
  visibility: Qt.default("public"),
  website: m().url().or(se("")).default(""),
  discord: m().url().or(se("")).default(""),
  rules: Ae(m()).default([])
}), nr = A({
  ownsDomain: T().default(!1),
  domain: m().default(""),
  subdomain: m().default(""),
  useHttps: T().default(!0),
  reverseProxy: er.default("nginx"),
  /** Email used by Certbot for Let's Encrypt registration. */
  certbotEmail: m().email().or(se("")).default("")
}), Oe = A({
  launcherIcon: m().default(""),
  backgroundImage: m().default(""),
  banner: m().default(""),
  serverLogo: m().default(""),
  splashScreen: m().default(""),
  primaryColor: m().regex(/^#([0-9a-fA-F]{6})$/).default("#6d28d9"),
  accentColor: m().regex(/^#([0-9a-fA-F]{6})$/).default("#22d3ee"),
  fontFamily: m().default("Inter"),
  themeMode: tr.default("dark"),
  customCss: m().default("")
}), ir = A({
  enforceHttps: T().default(!0),
  jwtEnabled: T().default(!0),
  apiKeyEnabled: T().default(!0),
  rateLimitPerMinute: U().int().min(1).max(1e5).default(120),
  verifyChecksums: T().default(!0),
  verifySignatures: T().default(!0),
  encryptConfig: T().default(!0)
}), or = A({
  path: m().min(1, "Server folder path is required"),
  detectedVersion: m().default(""),
  /** Relative sub-path to the mods directory within the installation. */
  modsPath: m().default("Mods"),
  valid: T().default(!1)
}), dr = A({
  id: m(),
  title: m().min(1).max(200),
  body: m().max(1e4),
  author: m().default(""),
  publishedAt: m(),
  // ISO-8601
  pinned: T().default(!1)
});
A({
  schemaVersion: se(1).default(1),
  id: m(),
  createdAt: m(),
  updatedAt: m(),
  meta: sr,
  installation: or,
  server: ar,
  domain: nr,
  branding: Oe,
  security: ir,
  database: rr.default("sqlite"),
  news: Ae(dr).default([])
});
const cr = A({
  /** POSIX-style path relative to the mods root. */
  path: m(),
  sha256: m().length(64),
  size: U().int().nonnegative()
});
A({
  schemaVersion: se(1).default(1),
  gameId: Ne,
  /** Manifest version, bumped whenever any file changes. */
  version: m(),
  generatedAt: m(),
  /** Total byte size of all files. */
  totalSize: U().int().nonnegative(),
  files: Ae(cr),
  /** Optional detached signature over the canonicalized file list. */
  signature: m().optional()
});
A({
  version: m(),
  releasedAt: m(),
  url: m().url(),
  sha256: m().length(64),
  size: U().int().nonnegative(),
  mandatory: T().default(!1),
  notes: m().default(""),
  signature: m().optional()
});
function je(r) {
  return new Promise((e, t) => {
    const s = yt("sha256"), a = xt(r);
    a.on("error", t), a.on("data", (n) => s.update(n)), a.on("end", () => e(s.digest("hex")));
  });
}
function ut(r, e, t) {
  try {
    const s = vt("RSA-SHA256");
    return s.update(r), s.end(), s.verify(t, e, "base64");
  } catch {
    return !1;
  }
}
function ur(r) {
  const e = [...r.files].sort((s, a) => s.path.localeCompare(a.path)), t = {
    schemaVersion: r.schemaVersion,
    gameId: r.gameId,
    version: r.version,
    generatedAt: r.generatedAt,
    totalSize: r.totalSize,
    files: e
  };
  return JSON.stringify(t);
}
function lr(r, e) {
  return r.signature ? ut(ur(r), r.signature, e) : !1;
}
function fr(r, e) {
  const t = [], s = [], a = /* @__PURE__ */ new Set();
  for (const o of r.files) {
    a.add(o.path);
    const c = e.get(o.path);
    c && c === o.sha256 ? s.push(o) : t.push(o);
  }
  const n = [];
  for (const o of e.keys())
    a.has(o) || n.push(o);
  const i = t.reduce((o, c) => o + c.size, 0);
  return { toDownload: t, toDelete: n, unchanged: s, downloadSize: i };
}
const pe = { debug: 10, info: 20, warn: 30, error: 40 };
class Ee {
  constructor(e) {
    j(this, "scope");
    j(this, "minWeight");
    j(this, "sink");
    this.scope = e.scope, this.minWeight = pe[e.minLevel ?? "info"], this.sink = e.sink;
  }
  /** Attach or replace the persistent sink (e.g. a rotating file writer). */
  setSink(e) {
    this.sink = e;
  }
  setMinLevel(e) {
    this.minWeight = pe[e];
  }
  /** Create a child logger that shares the sink but narrows the scope. */
  child(e) {
    const t = new Ee({ scope: `${this.scope}:${e}`, sink: this.sink });
    return t.minWeight = this.minWeight, t;
  }
  debug(e, t) {
    this.emit("debug", e, t);
  }
  info(e, t) {
    this.emit("info", e, t);
  }
  warn(e, t) {
    this.emit("warn", e, t);
  }
  error(e, t) {
    this.emit("error", e, t);
  }
  emit(e, t, s) {
    var o;
    if (pe[e] < this.minWeight)
      return;
    const a = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: e,
      scope: this.scope,
      message: t,
      data: s
    }, n = `${a.timestamp} [${e.toUpperCase()}] (${this.scope}) ${t}`, i = s ? [n, s] : [n];
    e === "error" ? console.error(...i) : e === "warn" ? console.warn(...i) : console.log(...i), (o = this.sink) == null || o.call(this, a);
  }
}
function he(r, e) {
  return new Ee({ scope: r, ...e });
}
const He = A({
  apiBase: m().url(),
  serverId: m(),
  serverName: m(),
  gameId: Ne,
  verifySignatures: T().default(!0),
  verifyChecksums: T().default(!0),
  publicKey: m().default(""),
  website: m().default(""),
  discord: m().default(""),
  branding: Oe,
  autoJoin: A({
    serverIp: m(),
    gamePort: U().int(),
    password: m().default("")
  })
});
function hr(r) {
  const e = [
    w.join(r, "launcher-config.json"),
    w.join(r, "..", "launcher-config.json"),
    w.join(process.cwd(), "launcher-config.dev.json")
  ];
  for (const t of e)
    if ($(t))
      return He.parse(JSON.parse(rt(t, "utf8")));
  return He.parse({
    apiBase: "http://localhost:8080",
    serverId: "dev-server",
    serverName: "Dev Server",
    gameId: "seven-days-to-die",
    verifySignatures: !1,
    verifyChecksums: !0,
    publicKey: "",
    branding: Oe.parse({}),
    autoJoin: { serverIp: "127.0.0.1", gamePort: 26900, password: "" }
  });
}
class mr {
  constructor(e, t) {
    this.apiBase = e, this.clientId = t;
  }
  url(e) {
    return `${this.apiBase}${e}`;
  }
  async getStatus() {
    try {
      const e = await fetch(this.url("/api/status"));
      return e.ok ? await e.json() : null;
    } catch {
      return null;
    }
  }
  async getNews() {
    try {
      const e = await fetch(this.url("/api/news"));
      return e.ok ? (await e.json()).news ?? [] : [];
    } catch {
      return [];
    }
  }
  async getManifest() {
    const e = await fetch(this.url("/api/mods"));
    if (!e.ok) throw new Error(`Failed to fetch manifest: ${e.status}`);
    return await e.json();
  }
  async getLatestVersion() {
    try {
      const e = await fetch(this.url("/api/version"));
      return e.ok ? await e.json() : null;
    } catch {
      return null;
    }
  }
  /** Build a resumable download URL for a mod file. */
  modDownloadUrl(e) {
    return this.url(`/api/download?type=mod&path=${encodeURIComponent(e)}`);
  }
  /** Fire-and-forget analytics event. Never throws. */
  async track(e, t, s = {}) {
    try {
      await fetch(this.url("/api/analytics/event"), {
        method: "POST",
        headers: { "content-type": "application/json", "x-client-id": this.clientId },
        body: JSON.stringify({ serverId: e, eventType: t, clientId: this.clientId, ...s })
      });
    } catch {
    }
  }
}
class pr {
  constructor() {
    j(this, "adapters", /* @__PURE__ */ new Map());
  }
  /** Register an adapter. Throws if one is already registered for the game. */
  register(e) {
    if (this.adapters.has(e.id))
      throw new Error(`An adapter for "${e.id}" is already registered.`);
    this.adapters.set(e.id, e);
  }
  /** Register or replace an adapter (used in tests and hot-reload scenarios). */
  registerOrReplace(e) {
    this.adapters.set(e.id, e);
  }
  has(e) {
    return this.adapters.has(e);
  }
  /** Get an adapter or throw a descriptive error if none is registered. */
  get(e) {
    const t = this.adapters.get(e);
    if (!t)
      throw new Error(`No game adapter registered for "${e}". Implemented games: ${this.list().map((s) => s.id).join(", ") || "(none)"}.`);
    return t;
  }
  /** Non-throwing lookup. */
  tryGet(e) {
    return this.adapters.get(e);
  }
  /** All registered adapters. */
  list() {
    return [...this.adapters.values()];
  }
  /** All GameIds that currently have a working adapter. */
  supportedGames() {
    return [...this.adapters.keys()];
  }
}
const fe = new pr();
async function ae(r) {
  try {
    return (await Ce(r)).isDirectory();
  } catch {
    return !1;
  }
}
function lt(r, e) {
  return e.some((t) => $(w.join(r, t)));
}
async function gr(r) {
  const e = [];
  async function t(s) {
    let a;
    try {
      a = await bt(s, { withFileTypes: !0 });
    } catch {
      return;
    }
    for (const n of a) {
      const i = w.join(s, n.name);
      n.isDirectory() ? await t(i) : n.isFile() && e.push(i);
    }
  }
  return await t(r), e;
}
async function $e(r) {
  if (!await ae(r))
    return [];
  const e = await gr(r), t = [];
  for (const s of e) {
    const [a, n] = await Promise.all([je(s), Ce(s)]), i = w.relative(r, s).split(w.sep).join("/");
    t.push({ path: i, sha256: a, size: n.size });
  }
  return t.sort((s, a) => s.path.localeCompare(a.path)), t;
}
const yr = "251570", Ge = [
  "serverconfig.xml",
  "7DaysToDieServer.exe",
  "7DaysToDieServer.x86_64",
  "startdedicated.bat"
];
function vr(r) {
  const e = {}, t = /<property\s+name="([^"]+)"\s+value="([^"]*)"\s*\/>/g;
  let s;
  for (; (s = t.exec(r)) !== null; )
    e[s[1]] = s[2];
  return e;
}
function _r(r, e, t = 3e3) {
  return new Promise((s) => {
    const a = new it.Socket(), n = Date.now();
    let i = !1;
    const o = (c) => {
      i || (i = !0, a.destroy(), s(c));
    };
    a.setTimeout(t), a.once("connect", () => o(Date.now() - n)), a.once("timeout", () => o(null)), a.once("error", () => o(null)), a.connect(e, r);
  });
}
class xr {
  constructor() {
    j(this, "id", "seven-days-to-die");
    j(this, "displayName", "7 Days To Die");
    j(this, "signatureFiles", Ge);
  }
  async detect(e) {
    const t = [], s = [];
    if (!await ae(e))
      return {
        valid: !1,
        detectedVersion: null,
        modsPath: null,
        notes: t,
        errors: [`Path does not exist or is not a directory: ${e}`]
      };
    lt(e, Ge) || s.push("No 7 Days To Die dedicated-server signature files found (expected serverconfig.xml or 7DaysToDieServer executable).");
    const a = w.join(e, "serverconfig.xml");
    let n = null;
    if ($(a)) {
      t.push("Found serverconfig.xml.");
      const c = w.join(e, "version.txt");
      if ($(c))
        try {
          n = (await ye(c, "utf8")).trim() || null;
        } catch {
        }
    } else
      s.push("serverconfig.xml not found in the selected folder.");
    const i = await this.resolveModsPath(e);
    i ? t.push(`Mods directory detected at ${i}.`) : t.push("No Mods directory present (vanilla server).");
    const o = w.join(e, "Saves");
    return $(o) && t.push("Found Saves directory."), {
      valid: s.length === 0,
      detectedVersion: n,
      modsPath: i,
      notes: t,
      errors: s
    };
  }
  async resolveModsPath(e) {
    const t = w.join(e, "Mods");
    return await ae(t) ? t : null;
  }
  async scanMods(e) {
    const t = await this.resolveModsPath(e);
    return t ? $e(t) : [];
  }
  buildLaunchPlan(e) {
    const { server: t } = e, s = `${t.serverIp}:${t.gamePort}`, a = t.serverPassword ? `/${encodeURIComponent(t.serverPassword)}` : "";
    return {
      target: `steam://run/${yr}//+connect_to_ip ${s}${a}`,
      args: [],
      useShell: !0,
      description: `Launch 7 Days To Die via Steam and connect to ${s}.`
    };
  }
  async queryStatus(e) {
    const { server: t, installPath: s } = e, a = t.serverIp, n = t.queryPort || t.gamePort, i = await _r(a, n), o = i !== null;
    let c = 0;
    try {
      const l = await this.readServerConfig(s);
      c = Number.parseInt(l.ServerMaxPlayerCount ?? "0", 10) || 0;
    } catch {
    }
    return {
      online: o,
      playersOnline: 0,
      // Requires web/telnet API; extend here when enabled.
      playersMax: c,
      pingMs: i,
      version: null,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async readServerConfig(e) {
    const t = w.join(e, "serverconfig.xml");
    if (!$(t))
      return {};
    try {
      const s = await ye(t, "utf8");
      return vr(s);
    } catch {
      return {};
    }
  }
}
const wr = new xr(), Ke = ["server.properties", "server.jar", "eula.txt"];
function kr(r) {
  const e = {};
  for (const t of r.split(/\r?\n/)) {
    const s = t.trim();
    if (!s || s.startsWith("#"))
      continue;
    const a = s.indexOf("=");
    a !== -1 && (e[s.slice(0, a).trim()] = s.slice(a + 1).trim());
  }
  return e;
}
function br(r, e, t = 3e3) {
  return new Promise((s) => {
    const a = new it.Socket(), n = Date.now();
    let i = !1;
    const o = (c) => {
      i || (i = !0, a.destroy(), s(c));
    };
    a.setTimeout(t), a.once("connect", () => o(Date.now() - n)), a.once("timeout", () => o(null)), a.once("error", () => o(null)), a.connect(e, r);
  });
}
class Sr {
  constructor() {
    j(this, "id", "minecraft");
    j(this, "displayName", "Minecraft");
    j(this, "signatureFiles", Ke);
  }
  async detect(e) {
    const t = [], s = [];
    if (!await ae(e))
      return {
        valid: !1,
        detectedVersion: null,
        modsPath: null,
        notes: t,
        errors: [`Path does not exist or is not a directory: ${e}`]
      };
    lt(e, Ke) ? t.push("Found Minecraft server files.") : s.push("No Minecraft server signature files found (expected server.properties or server.jar).");
    const a = await this.resolveModsPath(e);
    return a && t.push(`Mods directory detected at ${a}.`), { valid: s.length === 0, detectedVersion: null, modsPath: a, notes: t, errors: s };
  }
  async resolveModsPath(e) {
    const t = w.join(e, "mods");
    return await ae(t) ? t : null;
  }
  async scanMods(e) {
    const t = await this.resolveModsPath(e);
    return t ? $e(t) : [];
  }
  buildLaunchPlan(e) {
    const { server: t } = e, s = `${t.serverIp}:${t.gamePort}`;
    return {
      target: `minecraft://connect/${s}`,
      args: [],
      useShell: !0,
      description: `Open Minecraft and connect to ${s}.`
    };
  }
  async queryStatus(e) {
    const { server: t, installPath: s } = e, a = t.gamePort || 25565, n = await br(t.serverIp, a);
    let i = 0;
    try {
      const o = await this.readServerConfig(s);
      i = Number.parseInt(o["max-players"] ?? "0", 10) || 0;
    } catch {
    }
    return {
      online: n !== null,
      playersOnline: 0,
      playersMax: i,
      pingMs: n,
      version: null,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async readServerConfig(e) {
    const t = w.join(e, "server.properties");
    if (!$(t))
      return {};
    try {
      return kr(await ye(t, "utf8"));
    } catch {
      return {};
    }
  }
}
const Cr = new Sr();
fe.register(wr);
fe.register(Cr);
const Ye = he("launcher:mod-sync");
async function Tr(r) {
  const e = /* @__PURE__ */ new Map();
  if (!$(r)) return e;
  const t = await $e(r);
  for (const s of t) e.set(s.path, s.sha256);
  return e;
}
async function Ir(r, e, t, s) {
  const a = w.join(e, t.path), n = `${a}.part`;
  await Te(w.dirname(a), { recursive: !0 });
  let i = 0;
  $(n) && (i = (await Ce(n)).size, i > t.size && (await J(n, { force: !0 }), i = 0));
  const o = {};
  i > 0 && (o.Range = `bytes=${i}-`);
  const c = await fetch(r.modDownloadUrl(t.path), { headers: o });
  if (!(c.ok || c.status === 206))
    throw new Error(`Download failed for ${t.path}: ${c.status}`);
  if (!c.body) throw new Error(`Empty body for ${t.path}`);
  const l = c.status === 206 && i > 0, y = st(n, { flags: l ? "a" : "w" }), b = at.fromWeb(c.body);
  b.on("data", (Q) => s(Q.length)), await nt(b, y);
  const O = await je(n);
  if (O !== t.sha256)
    throw await J(n, { force: !0 }), new Error(`Checksum mismatch for ${t.path} (expected ${t.sha256}, got ${O})`);
  await J(a, { force: !0 }), await St(n, a);
}
async function Ar(r) {
  const { modsDir: e, manifest: t, api: s, publicKeyPem: a, onProgress: n } = r;
  if (a) {
    if (!lr(t, a))
      throw new Error("Manifest signature verification failed — refusing to sync.");
    Ye.info("Manifest signature verified");
  }
  await Te(e, { recursive: !0 }), n == null || n({ phase: "diff", filesCompleted: 0, filesTotal: 0, bytesCompleted: 0, bytesTotal: 0 });
  const i = await Tr(e), o = fr(t, i), c = o.toDownload.length, l = o.downloadSize;
  let y = 0, b = 0;
  for (const O of o.toDownload) {
    n == null || n({
      phase: "download",
      file: O.path,
      filesCompleted: y,
      filesTotal: c,
      bytesCompleted: b,
      bytesTotal: l
    });
    let Q = 0;
    const ht = 3;
    for (; ; )
      try {
        await Ir(s, e, O, (ie) => {
          b += ie, n == null || n({
            phase: "download",
            file: O.path,
            filesCompleted: y,
            filesTotal: c,
            bytesCompleted: b,
            bytesTotal: l
          });
        });
        break;
      } catch (ie) {
        if (Q += 1, Ye.warn("Download attempt failed", { file: O.path, attempt: Q, error: String(ie) }), Q >= ht) throw ie;
      }
    y += 1;
  }
  n == null || n({ phase: "cleanup", filesCompleted: y, filesTotal: c, bytesCompleted: b, bytesTotal: l });
  for (const O of o.toDelete)
    await J(w.join(e, O), { force: !0 });
  return n == null || n({ phase: "done", filesCompleted: y, filesTotal: c, bytesCompleted: b, bytesTotal: l }), await s.track(t.gameId, "mod_download", {
    bytes: b,
    metadata: { downloaded: o.toDownload.length, deleted: o.toDelete.length }
  }), {
    downloaded: o.toDownload.length,
    deleted: o.toDelete.length,
    unchanged: o.unchanged.length,
    bytes: b
  };
}
const Nr = he("launcher:updater");
function Or(r, e) {
  const t = (i) => i.split(/[.\-+]/).map((o) => parseInt(o, 10) || 0), s = t(r), a = t(e), n = Math.max(s.length, a.length);
  for (let i = 0; i < n; i++) {
    const o = s[i] ?? 0, c = a[i] ?? 0;
    if (o > c) return !0;
    if (o < c) return !1;
  }
  return !1;
}
function jr(r, e) {
  return r ? { updateAvailable: Or(r.version, e), descriptor: r } : { updateAvailable: !1, descriptor: null };
}
async function Er(r, e, t, s) {
  await Te(e, { recursive: !0 });
  const a = `update-${r.version}.exe`, n = w.join(e, a), i = await fetch(r.url);
  if (!i.ok || !i.body) throw new Error(`Update download failed: ${i.status}`);
  let o = 0;
  const c = at.fromWeb(i.body);
  if (c.on("data", (y) => {
    o += y.length, s == null || s(o, r.size);
  }), await nt(c, st(n)), await je(n) !== r.sha256)
    throw await J(n, { force: !0 }), new Error("Update checksum mismatch — aborting.");
  if (t && r.signature) {
    const y = `${r.version}:${r.sha256}:${r.size}`;
    if (!ut(y, r.signature, t))
      throw await J(n, { force: !0 }), new Error("Update signature verification failed — aborting.");
  }
  return Nr.info("Update downloaded and verified", { version: r.version, path: n }), n;
}
const $r = he("launcher:game");
async function Rr(r) {
  const e = r.gameId;
  if (!fe.has(e))
    throw new Error(`No adapter available for game "${e}"`);
  const t = fe.get(e), s = {
    serverIp: r.autoJoin.serverIp,
    port: 443,
    gamePort: r.autoJoin.gamePort,
    queryPort: r.autoJoin.gamePort,
    region: "NA",
    serverPassword: r.autoJoin.password,
    adminPassword: "",
    visibility: "public",
    website: "",
    discord: "",
    rules: []
  }, a = t.buildLaunchPlan({ installPath: "", server: s });
  return $r.info("Launching game", { description: a.description, target: a.target }), a.useShell ? await ge.openExternal(a.target) : Ct(a.target, a.args, { detached: !0, stdio: "ignore" }).unref(), { started: !0, description: a.description };
}
const E = {
  getConfig: "launcher:getConfig",
  getStatus: "launcher:getStatus",
  getNews: "launcher:getNews",
  sync: "launcher:sync",
  checkUpdate: "launcher:checkUpdate",
  applyUpdate: "launcher:applyUpdate",
  play: "launcher:play",
  openExternal: "launcher:openExternal",
  syncProgress: "launcher:syncProgress",
  updateProgress: "launcher:updateProgress"
}, Xe = w.dirname(kt(import.meta.url)), ft = he("launcher:main");
let Z = null, S, C, Qe;
function Zr() {
  const r = w.join(P.getPath("userData"), "client-id");
  if ($(r)) return rt(r, "utf8").trim();
  const e = _t();
  return wt(r, e), e;
}
function Pr() {
  return w.join(P.getPath("userData"), "mods");
}
function et() {
  Z = new tt({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: "#0b0b12",
    frame: !0,
    webPreferences: {
      preload: w.join(Xe, "preload.js"),
      contextIsolation: !0,
      nodeIntegration: !1,
      sandbox: !1
    }
  });
  const r = process.env.VITE_DEV_SERVER_URL;
  r ? Z.loadURL(r) : Z.loadFile(w.join(Xe, "..", "dist", "index.html"));
}
function Mr() {
  D.handle(E.getConfig, () => S), D.handle(E.getStatus, () => C.getStatus()), D.handle(E.getNews, () => C.getNews()), D.handle(E.sync, async (r, e) => {
    const t = await C.getManifest(), s = await Ar({
      modsDir: Pr(),
      manifest: t,
      api: C,
      publicKeyPem: S.verifySignatures ? S.publicKey : void 0,
      onProgress: (a) => Z == null ? void 0 : Z.webContents.send(E.syncProgress, a)
    });
    return await C.track(S.serverId, "update_success", { metadata: { downloaded: s.downloaded } }), { downloaded: s.downloaded, deleted: s.deleted, unchanged: s.unchanged };
  }), D.handle(E.checkUpdate, async () => {
    const r = await C.getLatestVersion(), { updateAvailable: e } = jr(r, P.getVersion());
    return { updateAvailable: e, version: (r == null ? void 0 : r.version) ?? null };
  }), D.handle(E.applyUpdate, async () => {
    const r = await C.getLatestVersion();
    if (!r) return { ok: !1 };
    const e = await Er(
      r,
      w.join(gt.tmpdir(), "forgelink-update"),
      S.verifySignatures ? S.publicKey : void 0,
      (t, s) => Z == null ? void 0 : Z.webContents.send(E.updateProgress, t, s)
    );
    return await ge.openPath(e), setTimeout(() => P.quit(), 1500), { ok: !0 };
  }), D.handle(E.play, async () => (await C.track(S.serverId, "launch"), Rr(S))), D.handle(E.openExternal, (r, e) => ge.openExternal(e));
}
P.whenReady().then(() => {
  Qe = Zr(), S = hr(w.dirname(P.getPath("exe"))), C = new mr(S.apiBase.replace(/\/$/, ""), Qe), ft.info("Launcher starting", { server: S.serverName, apiBase: S.apiBase }), C.track(S.serverId, "download"), Mr(), et(), P.on("activate", () => {
    tt.getAllWindows().length === 0 && et();
  });
});
P.on("window-all-closed", () => {
  process.platform !== "darwin" && P.quit();
});
process.on("uncaughtException", (r) => {
  ft.error("Uncaught exception", { error: r.message }), C == null || C.track(S.serverId, "crash", { metadata: { message: r.message } });
});
