var vt = Object.defineProperty;
var _t = (r, e, t) => e in r ? vt(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var k = (r, e, t) => _t(r, typeof e != "symbol" ? e + "" : e, t);
import { app as se, BrowserWindow as tt, ipcMain as I, dialog as Te, shell as xt } from "electron";
import b from "node:path";
import { fileURLToPath as bt } from "node:url";
import { createHash as wt, generateKeyPairSync as kt, createSign as St, randomBytes as Oe, createCipheriv as $t, scryptSync as It, randomUUID as Pt } from "node:crypto";
import { createReadStream as Nt, existsSync as R, mkdirSync as re, writeFileSync as le, readFileSync as ee, readdirSync as Ct, rmSync as Rt } from "node:fs";
import { stat as rt, readdir as At, readFile as _e } from "node:fs/promises";
import st from "node:net";
const nt = [
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
function Ee(r) {
  return typeof r == "string" && nt.includes(r);
}
var x;
(function(r) {
  r.assertEqual = (n) => {
  };
  function e(n) {
  }
  r.assertIs = e;
  function t(n) {
    throw new Error();
  }
  r.assertNever = t, r.arrayToEnum = (n) => {
    const a = {};
    for (const i of n)
      a[i] = i;
    return a;
  }, r.getValidEnumValues = (n) => {
    const a = r.objectKeys(n).filter((o) => typeof n[n[o]] != "number"), i = {};
    for (const o of a)
      i[o] = n[o];
    return r.objectValues(i);
  }, r.objectValues = (n) => r.objectKeys(n).map(function(a) {
    return n[a];
  }), r.objectKeys = typeof Object.keys == "function" ? (n) => Object.keys(n) : (n) => {
    const a = [];
    for (const i in n)
      Object.prototype.hasOwnProperty.call(n, i) && a.push(i);
    return a;
  }, r.find = (n, a) => {
    for (const i of n)
      if (a(i))
        return i;
  }, r.isInteger = typeof Number.isInteger == "function" ? (n) => Number.isInteger(n) : (n) => typeof n == "number" && Number.isFinite(n) && Math.floor(n) === n;
  function s(n, a = " | ") {
    return n.map((i) => typeof i == "string" ? `'${i}'` : i).join(a);
  }
  r.joinValues = s, r.jsonStringifyReplacer = (n, a) => typeof a == "bigint" ? a.toString() : a;
})(x || (x = {}));
var De;
(function(r) {
  r.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(De || (De = {}));
const u = x.arrayToEnum([
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
]), L = (r) => {
  switch (typeof r) {
    case "undefined":
      return u.undefined;
    case "string":
      return u.string;
    case "number":
      return Number.isNaN(r) ? u.nan : u.number;
    case "boolean":
      return u.boolean;
    case "function":
      return u.function;
    case "bigint":
      return u.bigint;
    case "symbol":
      return u.symbol;
    case "object":
      return Array.isArray(r) ? u.array : r === null ? u.null : r.then && typeof r.then == "function" && r.catch && typeof r.catch == "function" ? u.promise : typeof Map < "u" && r instanceof Map ? u.map : typeof Set < "u" && r instanceof Set ? u.set : typeof Date < "u" && r instanceof Date ? u.date : u.object;
    default:
      return u.unknown;
  }
}, c = x.arrayToEnum([
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
class D extends Error {
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
    const t = e || function(a) {
      return a.message;
    }, s = { _errors: [] }, n = (a) => {
      for (const i of a.issues)
        if (i.code === "invalid_union")
          i.unionErrors.map(n);
        else if (i.code === "invalid_return_type")
          n(i.returnTypeError);
        else if (i.code === "invalid_arguments")
          n(i.argumentsError);
        else if (i.path.length === 0)
          s._errors.push(t(i));
        else {
          let o = s, l = 0;
          for (; l < i.path.length; ) {
            const f = i.path[l];
            l === i.path.length - 1 ? (o[f] = o[f] || { _errors: [] }, o[f]._errors.push(t(i))) : o[f] = o[f] || { _errors: [] }, o = o[f], l++;
          }
        }
    };
    return n(this), s;
  }
  static assert(e) {
    if (!(e instanceof D))
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
    for (const n of this.issues)
      if (n.path.length > 0) {
        const a = n.path[0];
        t[a] = t[a] || [], t[a].push(e(n));
      } else
        s.push(e(n));
    return { formErrors: s, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
D.create = (r) => new D(r);
const xe = (r, e) => {
  let t;
  switch (r.code) {
    case c.invalid_type:
      r.received === u.undefined ? t = "Required" : t = `Expected ${r.expected}, received ${r.received}`;
      break;
    case c.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(r.expected, x.jsonStringifyReplacer)}`;
      break;
    case c.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${x.joinValues(r.keys, ", ")}`;
      break;
    case c.invalid_union:
      t = "Invalid input";
      break;
    case c.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${x.joinValues(r.options)}`;
      break;
    case c.invalid_enum_value:
      t = `Invalid enum value. Expected ${x.joinValues(r.options)}, received '${r.received}'`;
      break;
    case c.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case c.invalid_return_type:
      t = "Invalid function return type";
      break;
    case c.invalid_date:
      t = "Invalid date";
      break;
    case c.invalid_string:
      typeof r.validation == "object" ? "includes" in r.validation ? (t = `Invalid input: must include "${r.validation.includes}"`, typeof r.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${r.validation.position}`)) : "startsWith" in r.validation ? t = `Invalid input: must start with "${r.validation.startsWith}"` : "endsWith" in r.validation ? t = `Invalid input: must end with "${r.validation.endsWith}"` : x.assertNever(r.validation) : r.validation !== "regex" ? t = `Invalid ${r.validation}` : t = "Invalid";
      break;
    case c.too_small:
      r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "more than"} ${r.minimum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at least" : "over"} ${r.minimum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "bigint" ? t = `Number must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${r.minimum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly equal to " : r.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(r.minimum))}` : t = "Invalid input";
      break;
    case c.too_big:
      r.type === "array" ? t = `Array must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "less than"} ${r.maximum} element(s)` : r.type === "string" ? t = `String must contain ${r.exact ? "exactly" : r.inclusive ? "at most" : "under"} ${r.maximum} character(s)` : r.type === "number" ? t = `Number must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "bigint" ? t = `BigInt must be ${r.exact ? "exactly" : r.inclusive ? "less than or equal to" : "less than"} ${r.maximum}` : r.type === "date" ? t = `Date must be ${r.exact ? "exactly" : r.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(r.maximum))}` : t = "Invalid input";
      break;
    case c.custom:
      t = "Invalid input";
      break;
    case c.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case c.not_multiple_of:
      t = `Number must be a multiple of ${r.multipleOf}`;
      break;
    case c.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, x.assertNever(r);
  }
  return { message: t };
};
let Tt = xe;
function Ot() {
  return Tt;
}
const Et = (r) => {
  const { data: e, path: t, errorMaps: s, issueData: n } = r, a = [...t, ...n.path || []], i = {
    ...n,
    path: a
  };
  if (n.message !== void 0)
    return {
      ...n,
      path: a,
      message: n.message
    };
  let o = "";
  const l = s.filter((f) => !!f).slice().reverse();
  for (const f of l)
    o = f(i, { data: e, defaultError: o }).message;
  return {
    ...n,
    path: a,
    message: o
  };
};
function d(r, e) {
  const t = Ot(), s = Et({
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
      t === xe ? void 0 : xe
      // then global default map
    ].filter((n) => !!n)
  });
  r.common.issues.push(s);
}
class $ {
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
    for (const n of t) {
      if (n.status === "aborted")
        return p;
      n.status === "dirty" && e.dirty(), s.push(n.value);
    }
    return { status: e.value, value: s };
  }
  static async mergeObjectAsync(e, t) {
    const s = [];
    for (const n of t) {
      const a = await n.key, i = await n.value;
      s.push({
        key: a,
        value: i
      });
    }
    return $.mergeObjectSync(e, s);
  }
  static mergeObjectSync(e, t) {
    const s = {};
    for (const n of t) {
      const { key: a, value: i } = n;
      if (a.status === "aborted" || i.status === "aborted")
        return p;
      a.status === "dirty" && e.dirty(), i.status === "dirty" && e.dirty(), a.value !== "__proto__" && (typeof i.value < "u" || n.alwaysSet) && (s[a.value] = i.value);
    }
    return { status: e.value, value: s };
  }
}
const p = Object.freeze({
  status: "aborted"
}), te = (r) => ({ status: "dirty", value: r }), P = (r) => ({ status: "valid", value: r }), Le = (r) => r.status === "aborted", Me = (r) => r.status === "dirty", K = (r) => r.status === "valid", ue = (r) => typeof Promise < "u" && r instanceof Promise;
var h;
(function(r) {
  r.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, r.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(h || (h = {}));
class j {
  constructor(e, t, s, n) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = s, this._key = n;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const Ze = (r, e) => {
  if (K(e))
    return { success: !0, data: e.value };
  if (!r.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new D(r.common.issues);
      return this._error = t, this._error;
    }
  };
};
function y(r) {
  if (!r)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: s, description: n } = r;
  if (e && (t || s))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: n } : { errorMap: (i, o) => {
    const { message: l } = r;
    return i.code === "invalid_enum_value" ? { message: l ?? o.defaultError } : typeof o.data > "u" ? { message: l ?? s ?? o.defaultError } : i.code !== "invalid_type" ? { message: o.defaultError } : { message: l ?? t ?? o.defaultError };
  }, description: n };
}
class _ {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return L(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: L(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new $(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: L(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (ue(t))
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
      parsedType: L(e)
    }, n = this._parseSync({ data: e, path: s.path, parent: s });
    return Ze(s, n);
  }
  "~validate"(e) {
    var s, n;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: L(e)
    };
    if (!this["~standard"].async)
      try {
        const a = this._parseSync({ data: e, path: [], parent: t });
        return K(a) ? {
          value: a.value
        } : {
          issues: t.common.issues
        };
      } catch (a) {
        (n = (s = a == null ? void 0 : a.message) == null ? void 0 : s.toLowerCase()) != null && n.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((a) => K(a) ? {
      value: a.value
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
      parsedType: L(e)
    }, n = this._parse({ data: e, path: s.path, parent: s }), a = await (ue(n) ? n : Promise.resolve(n));
    return Ze(s, a);
  }
  refine(e, t) {
    const s = (n) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(n) : t;
    return this._refinement((n, a) => {
      const i = e(n), o = () => a.addIssue({
        code: c.custom,
        ...s(n)
      });
      return typeof Promise < "u" && i instanceof Promise ? i.then((l) => l ? !0 : (o(), !1)) : i ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((s, n) => e(s) ? !0 : (n.addIssue(typeof t == "function" ? t(s, n) : t), !1));
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
    return F.create(this, this._def);
  }
  nullable() {
    return X.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return A.create(this);
  }
  promise() {
    return pe.create(this, this._def);
  }
  or(e) {
    return he.create([this, e], this._def);
  }
  and(e) {
    return me.create(this, e, this._def);
  }
  transform(e) {
    return new Y({
      ...y(this._def),
      schema: this,
      typeName: g.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new Se({
      ...y(this._def),
      innerType: this,
      defaultValue: t,
      typeName: g.ZodDefault
    });
  }
  brand() {
    return new sr({
      typeName: g.ZodBranded,
      type: this,
      ...y(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new $e({
      ...y(this._def),
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
    return Pe.create(this, e);
  }
  readonly() {
    return Ie.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Dt = /^c[^\s-]{8,}$/i, Lt = /^[0-9a-z]+$/, Mt = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Zt = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Ft = /^[a-z0-9_-]{21}$/i, jt = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Vt = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Ut = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, zt = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let ye;
const Ht = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Bt = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Wt = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Gt = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Kt = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, qt = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, at = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Jt = new RegExp(`^${at}$`);
function it(r) {
  let e = "[0-5]\\d";
  r.precision ? e = `${e}\\.\\d{${r.precision}}` : r.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = r.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function Yt(r) {
  return new RegExp(`^${it(r)}$`);
}
function Xt(r) {
  let e = `${at}T${it(r)}`;
  const t = [];
  return t.push(r.local ? "Z?" : "Z"), r.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function Qt(r, e) {
  return !!((e === "v4" || !e) && Ht.test(r) || (e === "v6" || !e) && Wt.test(r));
}
function er(r, e) {
  if (!jt.test(r))
    return !1;
  try {
    const [t] = r.split(".");
    if (!t)
      return !1;
    const s = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), n = JSON.parse(atob(s));
    return !(typeof n != "object" || n === null || "typ" in n && (n == null ? void 0 : n.typ) !== "JWT" || !n.alg || e && n.alg !== e);
  } catch {
    return !1;
  }
}
function tr(r, e) {
  return !!((e === "v4" || !e) && Bt.test(r) || (e === "v6" || !e) && Gt.test(r));
}
class Z extends _ {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== u.string) {
      const a = this._getOrReturnCtx(e);
      return d(a, {
        code: c.invalid_type,
        expected: u.string,
        received: a.parsedType
      }), p;
    }
    const s = new $();
    let n;
    for (const a of this._def.checks)
      if (a.kind === "min")
        e.data.length < a.value && (n = this._getOrReturnCtx(e, n), d(n, {
          code: c.too_small,
          minimum: a.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: a.message
        }), s.dirty());
      else if (a.kind === "max")
        e.data.length > a.value && (n = this._getOrReturnCtx(e, n), d(n, {
          code: c.too_big,
          maximum: a.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: a.message
        }), s.dirty());
      else if (a.kind === "length") {
        const i = e.data.length > a.value, o = e.data.length < a.value;
        (i || o) && (n = this._getOrReturnCtx(e, n), i ? d(n, {
          code: c.too_big,
          maximum: a.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: a.message
        }) : o && d(n, {
          code: c.too_small,
          minimum: a.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: a.message
        }), s.dirty());
      } else if (a.kind === "email")
        Ut.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
          validation: "email",
          code: c.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "emoji")
        ye || (ye = new RegExp(zt, "u")), ye.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
          validation: "emoji",
          code: c.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "uuid")
        Zt.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
          validation: "uuid",
          code: c.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "nanoid")
        Ft.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
          validation: "nanoid",
          code: c.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "cuid")
        Dt.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
          validation: "cuid",
          code: c.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "cuid2")
        Lt.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
          validation: "cuid2",
          code: c.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "ulid")
        Mt.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
          validation: "ulid",
          code: c.invalid_string,
          message: a.message
        }), s.dirty());
      else if (a.kind === "url")
        try {
          new URL(e.data);
        } catch {
          n = this._getOrReturnCtx(e, n), d(n, {
            validation: "url",
            code: c.invalid_string,
            message: a.message
          }), s.dirty();
        }
      else a.kind === "regex" ? (a.regex.lastIndex = 0, a.regex.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
        validation: "regex",
        code: c.invalid_string,
        message: a.message
      }), s.dirty())) : a.kind === "trim" ? e.data = e.data.trim() : a.kind === "includes" ? e.data.includes(a.value, a.position) || (n = this._getOrReturnCtx(e, n), d(n, {
        code: c.invalid_string,
        validation: { includes: a.value, position: a.position },
        message: a.message
      }), s.dirty()) : a.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : a.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : a.kind === "startsWith" ? e.data.startsWith(a.value) || (n = this._getOrReturnCtx(e, n), d(n, {
        code: c.invalid_string,
        validation: { startsWith: a.value },
        message: a.message
      }), s.dirty()) : a.kind === "endsWith" ? e.data.endsWith(a.value) || (n = this._getOrReturnCtx(e, n), d(n, {
        code: c.invalid_string,
        validation: { endsWith: a.value },
        message: a.message
      }), s.dirty()) : a.kind === "datetime" ? Xt(a).test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
        code: c.invalid_string,
        validation: "datetime",
        message: a.message
      }), s.dirty()) : a.kind === "date" ? Jt.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
        code: c.invalid_string,
        validation: "date",
        message: a.message
      }), s.dirty()) : a.kind === "time" ? Yt(a).test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
        code: c.invalid_string,
        validation: "time",
        message: a.message
      }), s.dirty()) : a.kind === "duration" ? Vt.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
        validation: "duration",
        code: c.invalid_string,
        message: a.message
      }), s.dirty()) : a.kind === "ip" ? Qt(e.data, a.version) || (n = this._getOrReturnCtx(e, n), d(n, {
        validation: "ip",
        code: c.invalid_string,
        message: a.message
      }), s.dirty()) : a.kind === "jwt" ? er(e.data, a.alg) || (n = this._getOrReturnCtx(e, n), d(n, {
        validation: "jwt",
        code: c.invalid_string,
        message: a.message
      }), s.dirty()) : a.kind === "cidr" ? tr(e.data, a.version) || (n = this._getOrReturnCtx(e, n), d(n, {
        validation: "cidr",
        code: c.invalid_string,
        message: a.message
      }), s.dirty()) : a.kind === "base64" ? Kt.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
        validation: "base64",
        code: c.invalid_string,
        message: a.message
      }), s.dirty()) : a.kind === "base64url" ? qt.test(e.data) || (n = this._getOrReturnCtx(e, n), d(n, {
        validation: "base64url",
        code: c.invalid_string,
        message: a.message
      }), s.dirty()) : x.assertNever(a);
    return { status: s.value, value: e.data };
  }
  _regex(e, t, s) {
    return this.refinement((n) => e.test(n), {
      validation: t,
      code: c.invalid_string,
      ...h.errToObj(s)
    });
  }
  _addCheck(e) {
    return new Z({
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
    return new Z({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new Z({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new Z({
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
Z.create = (r) => new Z({
  checks: [],
  typeName: g.ZodString,
  coerce: (r == null ? void 0 : r.coerce) ?? !1,
  ...y(r)
});
function rr(r, e) {
  const t = (r.toString().split(".")[1] || "").length, s = (e.toString().split(".")[1] || "").length, n = t > s ? t : s, a = Number.parseInt(r.toFixed(n).replace(".", "")), i = Number.parseInt(e.toFixed(n).replace(".", ""));
  return a % i / 10 ** n;
}
class q extends _ {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== u.number) {
      const a = this._getOrReturnCtx(e);
      return d(a, {
        code: c.invalid_type,
        expected: u.number,
        received: a.parsedType
      }), p;
    }
    let s;
    const n = new $();
    for (const a of this._def.checks)
      a.kind === "int" ? x.isInteger(e.data) || (s = this._getOrReturnCtx(e, s), d(s, {
        code: c.invalid_type,
        expected: "integer",
        received: "float",
        message: a.message
      }), n.dirty()) : a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (s = this._getOrReturnCtx(e, s), d(s, {
        code: c.too_small,
        minimum: a.value,
        type: "number",
        inclusive: a.inclusive,
        exact: !1,
        message: a.message
      }), n.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (s = this._getOrReturnCtx(e, s), d(s, {
        code: c.too_big,
        maximum: a.value,
        type: "number",
        inclusive: a.inclusive,
        exact: !1,
        message: a.message
      }), n.dirty()) : a.kind === "multipleOf" ? rr(e.data, a.value) !== 0 && (s = this._getOrReturnCtx(e, s), d(s, {
        code: c.not_multiple_of,
        multipleOf: a.value,
        message: a.message
      }), n.dirty()) : a.kind === "finite" ? Number.isFinite(e.data) || (s = this._getOrReturnCtx(e, s), d(s, {
        code: c.not_finite,
        message: a.message
      }), n.dirty()) : x.assertNever(a);
    return { status: n.value, value: e.data };
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
  setLimit(e, t, s, n) {
    return new q({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: h.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new q({
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
q.create = (r) => new q({
  checks: [],
  typeName: g.ZodNumber,
  coerce: (r == null ? void 0 : r.coerce) || !1,
  ...y(r)
});
class ne extends _ {
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
    if (this._getType(e) !== u.bigint)
      return this._getInvalidInput(e);
    let s;
    const n = new $();
    for (const a of this._def.checks)
      a.kind === "min" ? (a.inclusive ? e.data < a.value : e.data <= a.value) && (s = this._getOrReturnCtx(e, s), d(s, {
        code: c.too_small,
        type: "bigint",
        minimum: a.value,
        inclusive: a.inclusive,
        message: a.message
      }), n.dirty()) : a.kind === "max" ? (a.inclusive ? e.data > a.value : e.data >= a.value) && (s = this._getOrReturnCtx(e, s), d(s, {
        code: c.too_big,
        type: "bigint",
        maximum: a.value,
        inclusive: a.inclusive,
        message: a.message
      }), n.dirty()) : a.kind === "multipleOf" ? e.data % a.value !== BigInt(0) && (s = this._getOrReturnCtx(e, s), d(s, {
        code: c.not_multiple_of,
        multipleOf: a.value,
        message: a.message
      }), n.dirty()) : x.assertNever(a);
    return { status: n.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return d(t, {
      code: c.invalid_type,
      expected: u.bigint,
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
  setLimit(e, t, s, n) {
    return new ne({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: h.toString(n)
        }
      ]
    });
  }
  _addCheck(e) {
    return new ne({
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
ne.create = (r) => new ne({
  checks: [],
  typeName: g.ZodBigInt,
  coerce: (r == null ? void 0 : r.coerce) ?? !1,
  ...y(r)
});
class be extends _ {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== u.boolean) {
      const s = this._getOrReturnCtx(e);
      return d(s, {
        code: c.invalid_type,
        expected: u.boolean,
        received: s.parsedType
      }), p;
    }
    return P(e.data);
  }
}
be.create = (r) => new be({
  typeName: g.ZodBoolean,
  coerce: (r == null ? void 0 : r.coerce) || !1,
  ...y(r)
});
class fe extends _ {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== u.date) {
      const a = this._getOrReturnCtx(e);
      return d(a, {
        code: c.invalid_type,
        expected: u.date,
        received: a.parsedType
      }), p;
    }
    if (Number.isNaN(e.data.getTime())) {
      const a = this._getOrReturnCtx(e);
      return d(a, {
        code: c.invalid_date
      }), p;
    }
    const s = new $();
    let n;
    for (const a of this._def.checks)
      a.kind === "min" ? e.data.getTime() < a.value && (n = this._getOrReturnCtx(e, n), d(n, {
        code: c.too_small,
        message: a.message,
        inclusive: !0,
        exact: !1,
        minimum: a.value,
        type: "date"
      }), s.dirty()) : a.kind === "max" ? e.data.getTime() > a.value && (n = this._getOrReturnCtx(e, n), d(n, {
        code: c.too_big,
        message: a.message,
        inclusive: !0,
        exact: !1,
        maximum: a.value,
        type: "date"
      }), s.dirty()) : x.assertNever(a);
    return {
      status: s.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new fe({
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
fe.create = (r) => new fe({
  checks: [],
  coerce: (r == null ? void 0 : r.coerce) || !1,
  typeName: g.ZodDate,
  ...y(r)
});
class Fe extends _ {
  _parse(e) {
    if (this._getType(e) !== u.symbol) {
      const s = this._getOrReturnCtx(e);
      return d(s, {
        code: c.invalid_type,
        expected: u.symbol,
        received: s.parsedType
      }), p;
    }
    return P(e.data);
  }
}
Fe.create = (r) => new Fe({
  typeName: g.ZodSymbol,
  ...y(r)
});
class je extends _ {
  _parse(e) {
    if (this._getType(e) !== u.undefined) {
      const s = this._getOrReturnCtx(e);
      return d(s, {
        code: c.invalid_type,
        expected: u.undefined,
        received: s.parsedType
      }), p;
    }
    return P(e.data);
  }
}
je.create = (r) => new je({
  typeName: g.ZodUndefined,
  ...y(r)
});
class Ve extends _ {
  _parse(e) {
    if (this._getType(e) !== u.null) {
      const s = this._getOrReturnCtx(e);
      return d(s, {
        code: c.invalid_type,
        expected: u.null,
        received: s.parsedType
      }), p;
    }
    return P(e.data);
  }
}
Ve.create = (r) => new Ve({
  typeName: g.ZodNull,
  ...y(r)
});
class Ue extends _ {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return P(e.data);
  }
}
Ue.create = (r) => new Ue({
  typeName: g.ZodAny,
  ...y(r)
});
class ze extends _ {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return P(e.data);
  }
}
ze.create = (r) => new ze({
  typeName: g.ZodUnknown,
  ...y(r)
});
class V extends _ {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return d(t, {
      code: c.invalid_type,
      expected: u.never,
      received: t.parsedType
    }), p;
  }
}
V.create = (r) => new V({
  typeName: g.ZodNever,
  ...y(r)
});
class He extends _ {
  _parse(e) {
    if (this._getType(e) !== u.undefined) {
      const s = this._getOrReturnCtx(e);
      return d(s, {
        code: c.invalid_type,
        expected: u.void,
        received: s.parsedType
      }), p;
    }
    return P(e.data);
  }
}
He.create = (r) => new He({
  typeName: g.ZodVoid,
  ...y(r)
});
class A extends _ {
  _parse(e) {
    const { ctx: t, status: s } = this._processInputParams(e), n = this._def;
    if (t.parsedType !== u.array)
      return d(t, {
        code: c.invalid_type,
        expected: u.array,
        received: t.parsedType
      }), p;
    if (n.exactLength !== null) {
      const i = t.data.length > n.exactLength.value, o = t.data.length < n.exactLength.value;
      (i || o) && (d(t, {
        code: i ? c.too_big : c.too_small,
        minimum: o ? n.exactLength.value : void 0,
        maximum: i ? n.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: n.exactLength.message
      }), s.dirty());
    }
    if (n.minLength !== null && t.data.length < n.minLength.value && (d(t, {
      code: c.too_small,
      minimum: n.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.minLength.message
    }), s.dirty()), n.maxLength !== null && t.data.length > n.maxLength.value && (d(t, {
      code: c.too_big,
      maximum: n.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: n.maxLength.message
    }), s.dirty()), t.common.async)
      return Promise.all([...t.data].map((i, o) => n.type._parseAsync(new j(t, i, t.path, o)))).then((i) => $.mergeArray(s, i));
    const a = [...t.data].map((i, o) => n.type._parseSync(new j(t, i, t.path, o)));
    return $.mergeArray(s, a);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new A({
      ...this._def,
      minLength: { value: e, message: h.toString(t) }
    });
  }
  max(e, t) {
    return new A({
      ...this._def,
      maxLength: { value: e, message: h.toString(t) }
    });
  }
  length(e, t) {
    return new A({
      ...this._def,
      exactLength: { value: e, message: h.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
A.create = (r, e) => new A({
  type: r,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: g.ZodArray,
  ...y(e)
});
function G(r) {
  if (r instanceof w) {
    const e = {};
    for (const t in r.shape) {
      const s = r.shape[t];
      e[t] = F.create(G(s));
    }
    return new w({
      ...r._def,
      shape: () => e
    });
  } else return r instanceof A ? new A({
    ...r._def,
    type: G(r.element)
  }) : r instanceof F ? F.create(G(r.unwrap())) : r instanceof X ? X.create(G(r.unwrap())) : r instanceof H ? H.create(r.items.map((e) => G(e))) : r;
}
class w extends _ {
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
    if (this._getType(e) !== u.object) {
      const f = this._getOrReturnCtx(e);
      return d(f, {
        code: c.invalid_type,
        expected: u.object,
        received: f.parsedType
      }), p;
    }
    const { status: s, ctx: n } = this._processInputParams(e), { shape: a, keys: i } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof V && this._def.unknownKeys === "strip"))
      for (const f in n.data)
        i.includes(f) || o.push(f);
    const l = [];
    for (const f of i) {
      const v = a[f], U = n.data[f];
      l.push({
        key: { status: "valid", value: f },
        value: v._parse(new j(n, U, n.path, f)),
        alwaysSet: f in n.data
      });
    }
    if (this._def.catchall instanceof V) {
      const f = this._def.unknownKeys;
      if (f === "passthrough")
        for (const v of o)
          l.push({
            key: { status: "valid", value: v },
            value: { status: "valid", value: n.data[v] }
          });
      else if (f === "strict")
        o.length > 0 && (d(n, {
          code: c.unrecognized_keys,
          keys: o
        }), s.dirty());
      else if (f !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const f = this._def.catchall;
      for (const v of o) {
        const U = n.data[v];
        l.push({
          key: { status: "valid", value: v },
          value: f._parse(
            new j(n, U, n.path, v)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: v in n.data
        });
      }
    }
    return n.common.async ? Promise.resolve().then(async () => {
      const f = [];
      for (const v of l) {
        const U = await v.key, ge = await v.value;
        f.push({
          key: U,
          value: ge,
          alwaysSet: v.alwaysSet
        });
      }
      return f;
    }).then((f) => $.mergeObjectSync(s, f)) : $.mergeObjectSync(s, l);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return h.errToObj, new w({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, s) => {
          var a, i;
          const n = ((i = (a = this._def).errorMap) == null ? void 0 : i.call(a, t, s).message) ?? s.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: h.errToObj(e).message ?? n
          } : {
            message: n
          };
        }
      } : {}
    });
  }
  strip() {
    return new w({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new w({
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
    return new w({
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
    return new w({
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
    return new w({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const s of x.objectKeys(e))
      e[s] && this.shape[s] && (t[s] = this.shape[s]);
    return new w({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const s of x.objectKeys(this.shape))
      e[s] || (t[s] = this.shape[s]);
    return new w({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return G(this);
  }
  partial(e) {
    const t = {};
    for (const s of x.objectKeys(this.shape)) {
      const n = this.shape[s];
      e && !e[s] ? t[s] = n : t[s] = n.optional();
    }
    return new w({
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
        let a = this.shape[s];
        for (; a instanceof F; )
          a = a._def.innerType;
        t[s] = a;
      }
    return new w({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return ot(x.objectKeys(this.shape));
  }
}
w.create = (r, e) => new w({
  shape: () => r,
  unknownKeys: "strip",
  catchall: V.create(),
  typeName: g.ZodObject,
  ...y(e)
});
w.strictCreate = (r, e) => new w({
  shape: () => r,
  unknownKeys: "strict",
  catchall: V.create(),
  typeName: g.ZodObject,
  ...y(e)
});
w.lazycreate = (r, e) => new w({
  shape: r,
  unknownKeys: "strip",
  catchall: V.create(),
  typeName: g.ZodObject,
  ...y(e)
});
class he extends _ {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = this._def.options;
    function n(a) {
      for (const o of a)
        if (o.result.status === "valid")
          return o.result;
      for (const o of a)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const i = a.map((o) => new D(o.ctx.common.issues));
      return d(t, {
        code: c.invalid_union,
        unionErrors: i
      }), p;
    }
    if (t.common.async)
      return Promise.all(s.map(async (a) => {
        const i = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await a._parseAsync({
            data: t.data,
            path: t.path,
            parent: i
          }),
          ctx: i
        };
      })).then(n);
    {
      let a;
      const i = [];
      for (const l of s) {
        const f = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, v = l._parseSync({
          data: t.data,
          path: t.path,
          parent: f
        });
        if (v.status === "valid")
          return v;
        v.status === "dirty" && !a && (a = { result: v, ctx: f }), f.common.issues.length && i.push(f.common.issues);
      }
      if (a)
        return t.common.issues.push(...a.ctx.common.issues), a.result;
      const o = i.map((l) => new D(l));
      return d(t, {
        code: c.invalid_union,
        unionErrors: o
      }), p;
    }
  }
  get options() {
    return this._def.options;
  }
}
he.create = (r, e) => new he({
  options: r,
  typeName: g.ZodUnion,
  ...y(e)
});
function we(r, e) {
  const t = L(r), s = L(e);
  if (r === e)
    return { valid: !0, data: r };
  if (t === u.object && s === u.object) {
    const n = x.objectKeys(e), a = x.objectKeys(r).filter((o) => n.indexOf(o) !== -1), i = { ...r, ...e };
    for (const o of a) {
      const l = we(r[o], e[o]);
      if (!l.valid)
        return { valid: !1 };
      i[o] = l.data;
    }
    return { valid: !0, data: i };
  } else if (t === u.array && s === u.array) {
    if (r.length !== e.length)
      return { valid: !1 };
    const n = [];
    for (let a = 0; a < r.length; a++) {
      const i = r[a], o = e[a], l = we(i, o);
      if (!l.valid)
        return { valid: !1 };
      n.push(l.data);
    }
    return { valid: !0, data: n };
  } else return t === u.date && s === u.date && +r == +e ? { valid: !0, data: r } : { valid: !1 };
}
class me extends _ {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), n = (a, i) => {
      if (Le(a) || Le(i))
        return p;
      const o = we(a.value, i.value);
      return o.valid ? ((Me(a) || Me(i)) && t.dirty(), { status: t.value, value: o.data }) : (d(s, {
        code: c.invalid_intersection_types
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
    ]).then(([a, i]) => n(a, i)) : n(this._def.left._parseSync({
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
me.create = (r, e, t) => new me({
  left: r,
  right: e,
  typeName: g.ZodIntersection,
  ...y(t)
});
class H extends _ {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== u.array)
      return d(s, {
        code: c.invalid_type,
        expected: u.array,
        received: s.parsedType
      }), p;
    if (s.data.length < this._def.items.length)
      return d(s, {
        code: c.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), p;
    !this._def.rest && s.data.length > this._def.items.length && (d(s, {
      code: c.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const a = [...s.data].map((i, o) => {
      const l = this._def.items[o] || this._def.rest;
      return l ? l._parse(new j(s, i, s.path, o)) : null;
    }).filter((i) => !!i);
    return s.common.async ? Promise.all(a).then((i) => $.mergeArray(t, i)) : $.mergeArray(t, a);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new H({
      ...this._def,
      rest: e
    });
  }
}
H.create = (r, e) => {
  if (!Array.isArray(r))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new H({
    items: r,
    typeName: g.ZodTuple,
    rest: null,
    ...y(e)
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
    if (s.parsedType !== u.map)
      return d(s, {
        code: c.invalid_type,
        expected: u.map,
        received: s.parsedType
      }), p;
    const n = this._def.keyType, a = this._def.valueType, i = [...s.data.entries()].map(([o, l], f) => ({
      key: n._parse(new j(s, o, s.path, [f, "key"])),
      value: a._parse(new j(s, l, s.path, [f, "value"]))
    }));
    if (s.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const l of i) {
          const f = await l.key, v = await l.value;
          if (f.status === "aborted" || v.status === "aborted")
            return p;
          (f.status === "dirty" || v.status === "dirty") && t.dirty(), o.set(f.value, v.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const l of i) {
        const f = l.key, v = l.value;
        if (f.status === "aborted" || v.status === "aborted")
          return p;
        (f.status === "dirty" || v.status === "dirty") && t.dirty(), o.set(f.value, v.value);
      }
      return { status: t.value, value: o };
    }
  }
}
Be.create = (r, e, t) => new Be({
  valueType: e,
  keyType: r,
  typeName: g.ZodMap,
  ...y(t)
});
class ae extends _ {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== u.set)
      return d(s, {
        code: c.invalid_type,
        expected: u.set,
        received: s.parsedType
      }), p;
    const n = this._def;
    n.minSize !== null && s.data.size < n.minSize.value && (d(s, {
      code: c.too_small,
      minimum: n.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.minSize.message
    }), t.dirty()), n.maxSize !== null && s.data.size > n.maxSize.value && (d(s, {
      code: c.too_big,
      maximum: n.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: n.maxSize.message
    }), t.dirty());
    const a = this._def.valueType;
    function i(l) {
      const f = /* @__PURE__ */ new Set();
      for (const v of l) {
        if (v.status === "aborted")
          return p;
        v.status === "dirty" && t.dirty(), f.add(v.value);
      }
      return { status: t.value, value: f };
    }
    const o = [...s.data.values()].map((l, f) => a._parse(new j(s, l, s.path, f)));
    return s.common.async ? Promise.all(o).then((l) => i(l)) : i(o);
  }
  min(e, t) {
    return new ae({
      ...this._def,
      minSize: { value: e, message: h.toString(t) }
    });
  }
  max(e, t) {
    return new ae({
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
ae.create = (r, e) => new ae({
  valueType: r,
  minSize: null,
  maxSize: null,
  typeName: g.ZodSet,
  ...y(e)
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
  ...y(e)
});
class ke extends _ {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return d(t, {
        received: t.data,
        code: c.invalid_literal,
        expected: this._def.value
      }), p;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
ke.create = (r, e) => new ke({
  value: r,
  typeName: g.ZodLiteral,
  ...y(e)
});
function ot(r, e) {
  return new J({
    values: r,
    typeName: g.ZodEnum,
    ...y(e)
  });
}
class J extends _ {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return d(t, {
        expected: x.joinValues(s),
        received: t.parsedType,
        code: c.invalid_type
      }), p;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return d(t, {
        received: t.data,
        code: c.invalid_enum_value,
        options: s
      }), p;
    }
    return P(e.data);
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
    return J.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return J.create(this.options.filter((s) => !e.includes(s)), {
      ...this._def,
      ...t
    });
  }
}
J.create = ot;
class Ge extends _ {
  _parse(e) {
    const t = x.getValidEnumValues(this._def.values), s = this._getOrReturnCtx(e);
    if (s.parsedType !== u.string && s.parsedType !== u.number) {
      const n = x.objectValues(t);
      return d(s, {
        expected: x.joinValues(n),
        received: s.parsedType,
        code: c.invalid_type
      }), p;
    }
    if (this._cache || (this._cache = new Set(x.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const n = x.objectValues(t);
      return d(s, {
        received: s.data,
        code: c.invalid_enum_value,
        options: n
      }), p;
    }
    return P(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Ge.create = (r, e) => new Ge({
  values: r,
  typeName: g.ZodNativeEnum,
  ...y(e)
});
class pe extends _ {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== u.promise && t.common.async === !1)
      return d(t, {
        code: c.invalid_type,
        expected: u.promise,
        received: t.parsedType
      }), p;
    const s = t.parsedType === u.promise ? t.data : Promise.resolve(t.data);
    return P(s.then((n) => this._def.type.parseAsync(n, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
pe.create = (r, e) => new pe({
  type: r,
  typeName: g.ZodPromise,
  ...y(e)
});
class Y extends _ {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === g.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), n = this._def.effect || null, a = {
      addIssue: (i) => {
        d(s, i), i.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return s.path;
      }
    };
    if (a.addIssue = a.addIssue.bind(a), n.type === "preprocess") {
      const i = n.transform(s.data, a);
      if (s.common.async)
        return Promise.resolve(i).then(async (o) => {
          if (t.value === "aborted")
            return p;
          const l = await this._def.schema._parseAsync({
            data: o,
            path: s.path,
            parent: s
          });
          return l.status === "aborted" ? p : l.status === "dirty" || t.value === "dirty" ? te(l.value) : l;
        });
      {
        if (t.value === "aborted")
          return p;
        const o = this._def.schema._parseSync({
          data: i,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? p : o.status === "dirty" || t.value === "dirty" ? te(o.value) : o;
      }
    }
    if (n.type === "refinement") {
      const i = (o) => {
        const l = n.refinement(o, a);
        if (s.common.async)
          return Promise.resolve(l);
        if (l instanceof Promise)
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
    if (n.type === "transform")
      if (s.common.async === !1) {
        const i = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        if (!K(i))
          return p;
        const o = n.transform(i.value, a);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((i) => K(i) ? Promise.resolve(n.transform(i.value, a)).then((o) => ({
          status: t.value,
          value: o
        })) : p);
    x.assertNever(n);
  }
}
Y.create = (r, e, t) => new Y({
  schema: r,
  typeName: g.ZodEffects,
  effect: e,
  ...y(t)
});
Y.createWithPreprocess = (r, e, t) => new Y({
  schema: e,
  effect: { type: "preprocess", transform: r },
  typeName: g.ZodEffects,
  ...y(t)
});
class F extends _ {
  _parse(e) {
    return this._getType(e) === u.undefined ? P(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
F.create = (r, e) => new F({
  innerType: r,
  typeName: g.ZodOptional,
  ...y(e)
});
class X extends _ {
  _parse(e) {
    return this._getType(e) === u.null ? P(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
X.create = (r, e) => new X({
  innerType: r,
  typeName: g.ZodNullable,
  ...y(e)
});
class Se extends _ {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let s = t.data;
    return t.parsedType === u.undefined && (s = this._def.defaultValue()), this._def.innerType._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
Se.create = (r, e) => new Se({
  innerType: r,
  typeName: g.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...y(e)
});
class $e extends _ {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, n = this._def.innerType._parse({
      data: s.data,
      path: s.path,
      parent: {
        ...s
      }
    });
    return ue(n) ? n.then((a) => ({
      status: "valid",
      value: a.status === "valid" ? a.value : this._def.catchValue({
        get error() {
          return new D(s.common.issues);
        },
        input: s.data
      })
    })) : {
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
        get error() {
          return new D(s.common.issues);
        },
        input: s.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
$e.create = (r, e) => new $e({
  innerType: r,
  typeName: g.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...y(e)
});
class Ke extends _ {
  _parse(e) {
    if (this._getType(e) !== u.nan) {
      const s = this._getOrReturnCtx(e);
      return d(s, {
        code: c.invalid_type,
        expected: u.nan,
        received: s.parsedType
      }), p;
    }
    return { status: "valid", value: e.data };
  }
}
Ke.create = (r) => new Ke({
  typeName: g.ZodNaN,
  ...y(r)
});
class sr extends _ {
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
class Pe extends _ {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.common.async)
      return (async () => {
        const a = await this._def.in._parseAsync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return a.status === "aborted" ? p : a.status === "dirty" ? (t.dirty(), te(a.value)) : this._def.out._parseAsync({
          data: a.value,
          path: s.path,
          parent: s
        });
      })();
    {
      const n = this._def.in._parseSync({
        data: s.data,
        path: s.path,
        parent: s
      });
      return n.status === "aborted" ? p : n.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: n.value
      }) : this._def.out._parseSync({
        data: n.value,
        path: s.path,
        parent: s
      });
    }
  }
  static create(e, t) {
    return new Pe({
      in: e,
      out: t,
      typeName: g.ZodPipeline
    });
  }
}
class Ie extends _ {
  _parse(e) {
    const t = this._def.innerType._parse(e), s = (n) => (K(n) && (n.value = Object.freeze(n.value)), n);
    return ue(t) ? t.then((n) => s(n)) : s(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Ie.create = (r, e) => new Ie({
  innerType: r,
  typeName: g.ZodReadonly,
  ...y(e)
});
var g;
(function(r) {
  r.ZodString = "ZodString", r.ZodNumber = "ZodNumber", r.ZodNaN = "ZodNaN", r.ZodBigInt = "ZodBigInt", r.ZodBoolean = "ZodBoolean", r.ZodDate = "ZodDate", r.ZodSymbol = "ZodSymbol", r.ZodUndefined = "ZodUndefined", r.ZodNull = "ZodNull", r.ZodAny = "ZodAny", r.ZodUnknown = "ZodUnknown", r.ZodNever = "ZodNever", r.ZodVoid = "ZodVoid", r.ZodArray = "ZodArray", r.ZodObject = "ZodObject", r.ZodUnion = "ZodUnion", r.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", r.ZodIntersection = "ZodIntersection", r.ZodTuple = "ZodTuple", r.ZodRecord = "ZodRecord", r.ZodMap = "ZodMap", r.ZodSet = "ZodSet", r.ZodFunction = "ZodFunction", r.ZodLazy = "ZodLazy", r.ZodLiteral = "ZodLiteral", r.ZodEnum = "ZodEnum", r.ZodEffects = "ZodEffects", r.ZodNativeEnum = "ZodNativeEnum", r.ZodOptional = "ZodOptional", r.ZodNullable = "ZodNullable", r.ZodDefault = "ZodDefault", r.ZodCatch = "ZodCatch", r.ZodPromise = "ZodPromise", r.ZodBranded = "ZodBranded", r.ZodPipeline = "ZodPipeline", r.ZodReadonly = "ZodReadonly";
})(g || (g = {}));
const m = Z.create, z = q.create, N = be.create;
V.create;
const Ne = A.create, C = w.create;
he.create;
me.create;
H.create;
const ie = ke.create, ce = J.create;
pe.create;
F.create;
X.create;
const ct = ce(nt), nr = ce(["public", "private"]), ar = ce(["nginx", "apache", "none"]), ir = ce(["dark", "light"]), or = ce(["sqlite", "postgres"]), cr = C({
  name: m().min(1, "Project name is required").max(120),
  gameId: ct,
  serverName: m().min(1, "Server name is required").max(120),
  description: m().max(2e3).default(""),
  version: m().min(1).default("1.0.0"),
  owner: m().min(1, "Owner is required").max(120)
}), dt = C({
  serverIp: m().min(1, "Server IP or hostname is required"),
  /** API/web port. */
  port: z().int().min(1).max(65535).default(443),
  /** Game traffic port. */
  gamePort: z().int().min(1).max(65535).default(26900),
  queryPort: z().int().min(1).max(65535).default(26900),
  region: m().default("NA"),
  serverPassword: m().default(""),
  adminPassword: m().default(""),
  visibility: nr.default("public"),
  website: m().url().or(ie("")).default(""),
  discord: m().url().or(ie("")).default(""),
  rules: Ne(m()).default([])
}), lt = C({
  ownsDomain: N().default(!1),
  domain: m().default(""),
  subdomain: m().default(""),
  useHttps: N().default(!0),
  reverseProxy: ar.default("nginx"),
  /** Email used by Certbot for Let's Encrypt registration. */
  certbotEmail: m().email().or(ie("")).default("")
}), ut = C({
  launcherIcon: m().default(""),
  backgroundImage: m().default(""),
  banner: m().default(""),
  serverLogo: m().default(""),
  splashScreen: m().default(""),
  primaryColor: m().regex(/^#([0-9a-fA-F]{6})$/).default("#6d28d9"),
  accentColor: m().regex(/^#([0-9a-fA-F]{6})$/).default("#22d3ee"),
  fontFamily: m().default("Inter"),
  themeMode: ir.default("dark"),
  customCss: m().default("")
}), ft = C({
  enforceHttps: N().default(!0),
  jwtEnabled: N().default(!0),
  apiKeyEnabled: N().default(!0),
  rateLimitPerMinute: z().int().min(1).max(1e5).default(120),
  verifyChecksums: N().default(!0),
  verifySignatures: N().default(!0),
  encryptConfig: N().default(!0)
}), ht = C({
  path: m().min(1, "Server folder path is required"),
  detectedVersion: m().default(""),
  /** Relative sub-path to the mods directory within the installation. */
  modsPath: m().default("Mods"),
  valid: N().default(!1)
}), dr = C({
  id: m(),
  title: m().min(1).max(200),
  body: m().max(1e4),
  author: m().default(""),
  publishedAt: m(),
  // ISO-8601
  pinned: N().default(!1)
}), de = C({
  schemaVersion: ie(1).default(1),
  id: m(),
  createdAt: m(),
  updatedAt: m(),
  meta: cr,
  installation: ht,
  server: dt,
  domain: lt,
  branding: ut,
  security: ft,
  database: or.default("sqlite"),
  news: Ne(dr).default([])
}), lr = C({
  /** POSIX-style path relative to the mods root. */
  path: m(),
  sha256: m().length(64),
  size: z().int().nonnegative()
}), ur = C({
  schemaVersion: ie(1).default(1),
  gameId: ct,
  /** Manifest version, bumped whenever any file changes. */
  version: m(),
  generatedAt: m(),
  /** Total byte size of all files. */
  totalSize: z().int().nonnegative(),
  files: Ne(lr),
  /** Optional detached signature over the canonicalized file list. */
  signature: m().optional()
});
C({
  version: m(),
  releasedAt: m(),
  url: m().url(),
  sha256: m().length(64),
  size: z().int().nonnegative(),
  mandatory: N().default(!1),
  notes: m().default(""),
  signature: m().optional()
});
function fr(r) {
  return new Promise((e, t) => {
    const s = wt("sha256"), n = Nt(r);
    n.on("error", t), n.on("data", (a) => s.update(a)), n.on("end", () => e(s.digest("hex")));
  });
}
function hr() {
  const { publicKey: r, privateKey: e } = kt("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });
  return { publicKey: r, privateKey: e };
}
function mr(r, e) {
  const t = St("RSA-SHA256");
  return t.update(r), t.end(), t.sign(e, "base64");
}
function pr(r) {
  const e = [...r.files].sort((s, n) => s.path.localeCompare(n.path)), t = {
    schemaVersion: r.schemaVersion,
    gameId: r.gameId,
    version: r.version,
    generatedAt: r.generatedAt,
    totalSize: r.totalSize,
    files: e
  };
  return JSON.stringify(t);
}
function gr(r) {
  const e = [...r.files].sort((n, a) => n.path.localeCompare(a.path)), t = e.reduce((n, a) => n + a.size, 0), s = ur.parse({
    schemaVersion: 1,
    gameId: r.gameId,
    version: r.version,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    totalSize: t,
    files: e
  });
  return r.privateKeyPem && (s.signature = mr(pr(s), r.privateKeyPem)), s;
}
const qe = "aes-256-gcm", yr = 16, vr = 12, _r = 32;
function xr(r, e) {
  return It(r, e, _r);
}
function br(r, e) {
  const t = Oe(yr), s = Oe(vr), n = xr(e, t), a = $t(qe, n, s), i = Buffer.concat([a.update(r, "utf8"), a.final()]), o = a.getAuthTag();
  return {
    v: 1,
    alg: qe,
    salt: t.toString("base64"),
    iv: s.toString("base64"),
    tag: o.toString("base64"),
    data: i.toString("base64")
  };
}
const ve = { debug: 10, info: 20, warn: 30, error: 40 };
class Ce {
  constructor(e) {
    k(this, "scope");
    k(this, "minWeight");
    k(this, "sink");
    this.scope = e.scope, this.minWeight = ve[e.minLevel ?? "info"], this.sink = e.sink;
  }
  /** Attach or replace the persistent sink (e.g. a rotating file writer). */
  setSink(e) {
    this.sink = e;
  }
  setMinLevel(e) {
    this.minWeight = ve[e];
  }
  /** Create a child logger that shares the sink but narrows the scope. */
  child(e) {
    const t = new Ce({ scope: `${this.scope}:${e}`, sink: this.sink });
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
    if (ve[e] < this.minWeight)
      return;
    const n = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: e,
      scope: this.scope,
      message: t,
      data: s
    }, a = `${n.timestamp} [${e.toUpperCase()}] (${this.scope}) ${t}`, i = s ? [a, s] : [a];
    e === "error" ? console.error(...i) : e === "warn" ? console.warn(...i) : console.log(...i), (o = this.sink) == null || o.call(this, n);
  }
}
function Re(r, e) {
  return new Ce({ scope: r, ...e });
}
class wr {
  constructor() {
    k(this, "adapters", /* @__PURE__ */ new Map());
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
const M = new wr();
async function oe(r) {
  try {
    return (await rt(r)).isDirectory();
  } catch {
    return !1;
  }
}
function mt(r, e) {
  return e.some((t) => R(b.join(r, t)));
}
async function kr(r) {
  const e = [];
  async function t(s) {
    let n;
    try {
      n = await At(s, { withFileTypes: !0 });
    } catch {
      return;
    }
    for (const a of n) {
      const i = b.join(s, a.name);
      a.isDirectory() ? await t(i) : a.isFile() && e.push(i);
    }
  }
  return await t(r), e;
}
async function pt(r) {
  if (!await oe(r))
    return [];
  const e = await kr(r), t = [];
  for (const s of e) {
    const [n, a] = await Promise.all([fr(s), rt(s)]), i = b.relative(r, s).split(b.sep).join("/");
    t.push({ path: i, sha256: n, size: a.size });
  }
  return t.sort((s, n) => s.path.localeCompare(n.path)), t;
}
const Sr = "251570", Je = [
  "serverconfig.xml",
  "7DaysToDieServer.exe",
  "7DaysToDieServer.x86_64",
  "startdedicated.bat"
];
function $r(r) {
  const e = {}, t = /<property\s+name="([^"]+)"\s+value="([^"]*)"\s*\/>/g;
  let s;
  for (; (s = t.exec(r)) !== null; )
    e[s[1]] = s[2];
  return e;
}
function Ir(r, e, t = 3e3) {
  return new Promise((s) => {
    const n = new st.Socket(), a = Date.now();
    let i = !1;
    const o = (l) => {
      i || (i = !0, n.destroy(), s(l));
    };
    n.setTimeout(t), n.once("connect", () => o(Date.now() - a)), n.once("timeout", () => o(null)), n.once("error", () => o(null)), n.connect(e, r);
  });
}
class Pr {
  constructor() {
    k(this, "id", "seven-days-to-die");
    k(this, "displayName", "7 Days To Die");
    k(this, "signatureFiles", Je);
  }
  async detect(e) {
    const t = [], s = [];
    if (!await oe(e))
      return {
        valid: !1,
        detectedVersion: null,
        modsPath: null,
        notes: t,
        errors: [`Path does not exist or is not a directory: ${e}`]
      };
    mt(e, Je) || s.push("No 7 Days To Die dedicated-server signature files found (expected serverconfig.xml or 7DaysToDieServer executable).");
    const n = b.join(e, "serverconfig.xml");
    let a = null;
    if (R(n)) {
      t.push("Found serverconfig.xml.");
      const l = b.join(e, "version.txt");
      if (R(l))
        try {
          a = (await _e(l, "utf8")).trim() || null;
        } catch {
        }
    } else
      s.push("serverconfig.xml not found in the selected folder.");
    const i = await this.resolveModsPath(e);
    i ? t.push(`Mods directory detected at ${i}.`) : t.push("No Mods directory present (vanilla server).");
    const o = b.join(e, "Saves");
    return R(o) && t.push("Found Saves directory."), {
      valid: s.length === 0,
      detectedVersion: a,
      modsPath: i,
      notes: t,
      errors: s
    };
  }
  async resolveModsPath(e) {
    const t = b.join(e, "Mods");
    return await oe(t) ? t : null;
  }
  async scanMods(e) {
    const t = await this.resolveModsPath(e);
    return t ? pt(t) : [];
  }
  buildLaunchPlan(e) {
    const { server: t } = e, s = `${t.serverIp}:${t.gamePort}`, n = t.serverPassword ? `/${encodeURIComponent(t.serverPassword)}` : "";
    return {
      target: `steam://run/${Sr}//+connect_to_ip ${s}${n}`,
      args: [],
      useShell: !0,
      description: `Launch 7 Days To Die via Steam and connect to ${s}.`
    };
  }
  async queryStatus(e) {
    const { server: t, installPath: s } = e, n = t.serverIp, a = t.queryPort || t.gamePort, i = await Ir(n, a), o = i !== null;
    let l = 0;
    try {
      const f = await this.readServerConfig(s);
      l = Number.parseInt(f.ServerMaxPlayerCount ?? "0", 10) || 0;
    } catch {
    }
    return {
      online: o,
      playersOnline: 0,
      // Requires web/telnet API; extend here when enabled.
      playersMax: l,
      pingMs: i,
      version: null,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async readServerConfig(e) {
    const t = b.join(e, "serverconfig.xml");
    if (!R(t))
      return {};
    try {
      const s = await _e(t, "utf8");
      return $r(s);
    } catch {
      return {};
    }
  }
}
const Nr = new Pr(), Ye = ["server.properties", "server.jar", "eula.txt"];
function Cr(r) {
  const e = {};
  for (const t of r.split(/\r?\n/)) {
    const s = t.trim();
    if (!s || s.startsWith("#"))
      continue;
    const n = s.indexOf("=");
    n !== -1 && (e[s.slice(0, n).trim()] = s.slice(n + 1).trim());
  }
  return e;
}
function Rr(r, e, t = 3e3) {
  return new Promise((s) => {
    const n = new st.Socket(), a = Date.now();
    let i = !1;
    const o = (l) => {
      i || (i = !0, n.destroy(), s(l));
    };
    n.setTimeout(t), n.once("connect", () => o(Date.now() - a)), n.once("timeout", () => o(null)), n.once("error", () => o(null)), n.connect(e, r);
  });
}
class Ar {
  constructor() {
    k(this, "id", "minecraft");
    k(this, "displayName", "Minecraft");
    k(this, "signatureFiles", Ye);
  }
  async detect(e) {
    const t = [], s = [];
    if (!await oe(e))
      return {
        valid: !1,
        detectedVersion: null,
        modsPath: null,
        notes: t,
        errors: [`Path does not exist or is not a directory: ${e}`]
      };
    mt(e, Ye) ? t.push("Found Minecraft server files.") : s.push("No Minecraft server signature files found (expected server.properties or server.jar).");
    const n = await this.resolveModsPath(e);
    return n && t.push(`Mods directory detected at ${n}.`), { valid: s.length === 0, detectedVersion: null, modsPath: n, notes: t, errors: s };
  }
  async resolveModsPath(e) {
    const t = b.join(e, "mods");
    return await oe(t) ? t : null;
  }
  async scanMods(e) {
    const t = await this.resolveModsPath(e);
    return t ? pt(t) : [];
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
    const { server: t, installPath: s } = e, n = t.gamePort || 25565, a = await Rr(t.serverIp, n);
    let i = 0;
    try {
      const o = await this.readServerConfig(s);
      i = Number.parseInt(o["max-players"] ?? "0", 10) || 0;
    } catch {
    }
    return {
      online: a !== null,
      playersOnline: 0,
      playersMax: i,
      pingMs: a,
      version: null,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async readServerConfig(e) {
    const t = b.join(e, "server.properties");
    if (!R(t))
      return {};
    try {
      return Cr(await _e(t, "utf8"));
    } catch {
      return {};
    }
  }
}
const Tr = new Ar();
M.register(Nr);
M.register(Tr);
class Or {
  constructor(e) {
    this.workspaceDir = e, re(e, { recursive: !0 });
  }
  projectDir(e) {
    return b.join(this.workspaceDir, e);
  }
  projectFile(e) {
    return b.join(this.projectDir(e), "project.json");
  }
  /** Create a new project with sane defaults derived from the provided meta. */
  create(e) {
    const t = Pt(), s = (/* @__PURE__ */ new Date()).toISOString(), n = de.parse({
      schemaVersion: 1,
      id: t,
      createdAt: s,
      updatedAt: s,
      meta: e,
      installation: ht.parse({ path: "", valid: !1 }),
      server: dt.parse({ serverIp: "" }),
      domain: lt.parse({}),
      branding: ut.parse({}),
      security: ft.parse({}),
      database: "sqlite",
      news: []
    }), a = this.projectDir(t);
    re(a, { recursive: !0 });
    const i = hr();
    return le(b.join(a, "signing-private.pem"), i.privateKey, { mode: 384 }), le(b.join(a, "signing-public.pem"), i.publicKey), this.save(n), n;
  }
  save(e) {
    const t = de.parse({ ...e, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    return re(this.projectDir(t.id), { recursive: !0 }), le(this.projectFile(t.id), JSON.stringify(t, null, 2)), t;
  }
  get(e) {
    const t = this.projectFile(e);
    return R(t) ? de.parse(JSON.parse(ee(t, "utf8"))) : null;
  }
  list() {
    if (!R(this.workspaceDir)) return [];
    const e = [];
    for (const t of Ct(this.workspaceDir, { withFileTypes: !0 })) {
      if (!t.isDirectory()) continue;
      const s = this.projectFile(t.name);
      if (R(s))
        try {
          e.push(de.parse(JSON.parse(ee(s, "utf8"))));
        } catch {
        }
    }
    return e.sort((t, s) => s.updatedAt.localeCompare(t.updatedAt));
  }
  getPrivateKey(e) {
    return ee(b.join(this.projectDir(e), "signing-private.pem"), "utf8");
  }
  getPublicKey(e) {
    return ee(b.join(this.projectDir(e), "signing-public.pem"), "utf8");
  }
  outputDir(e) {
    return b.join(this.projectDir(e), "output");
  }
}
function B(r) {
  const { domain: e } = r;
  return e.ownsDomain && e.domain ? e.subdomain ? `${e.subdomain}.${e.domain}` : e.domain : r.server.serverIp;
}
function E(r) {
  return r.meta.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "forgelink";
}
function Er(r) {
  const e = E(r);
  return `// PM2 ecosystem file for ${r.meta.name}
// Start:   pm2 start ecosystem.config.cjs
// Save:    pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: '${e}-api',
      script: 'dist/index.js',
      cwd: '/opt/forgelink/${e}',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        FORGELINK_PORT: '8080',
        FORGELINK_HOST: '127.0.0.1',
        FORGELINK_DATA_DIR: '/opt/forgelink/${e}/data',
        FORGELINK_STORAGE_DIR: '/opt/forgelink/${e}/storage',
        FORGELINK_PUBLIC_URL: '${r.domain.useHttps ? "https" : "http"}://${B(r)}',
        FORGELINK_RATE_LIMIT_PER_MIN: '${r.security.rateLimitPerMinute}'
      }
    }
  ]
};
`;
}
function Dr(r) {
  const e = E(r);
  return `[Unit]
Description=ForgeLink Server API (${r.meta.name})
After=network.target

[Service]
Type=simple
User=forgelink
WorkingDirectory=/opt/forgelink/${e}
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=FORGELINK_PORT=8080
Environment=FORGELINK_HOST=127.0.0.1
Environment=FORGELINK_DATA_DIR=/opt/forgelink/${e}/data
Environment=FORGELINK_STORAGE_DIR=/opt/forgelink/${e}/storage
Environment=FORGELINK_PUBLIC_URL=${r.domain.useHttps ? "https" : "http"}://${B(r)}
Environment=FORGELINK_RATE_LIMIT_PER_MIN=${r.security.rateLimitPerMinute}

[Install]
WantedBy=multi-user.target
`;
}
function Lr(r) {
  const e = B(r), t = r.domain.useHttps, s = t ? `
server {
    listen 443 ssl http2;
    server_name ${e};

    ssl_certificate     /etc/letsencrypt/live/${e}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${e}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 512M;

    # Website / web panel (static export).
    root /opt/forgelink/${E(r)}/website;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Allow large, resumable downloads to stream.
        proxy_buffering off;
        proxy_request_buffering off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
` : "", n = t ? `# Redirect all HTTP to HTTPS.
server {
    listen 80;
    server_name ${e};
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}` : `server {
    listen 80;
    server_name ${e};
    root /opt/forgelink/${E(r)}/website;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering off;
    }
    location / { try_files $uri $uri/ /index.html; }
}`;
  return `# Nginx site for ${r.meta.name}
# Install: copy to /etc/nginx/sites-available/${E(r)}.conf
#          ln -s to sites-enabled, then: nginx -t && systemctl reload nginx
${n}
${s}`;
}
function Mr(r) {
  const e = B(r), t = E(r), s = r.domain.useHttps, n = s ? `
<VirtualHost *:443>
    ServerName ${e}
    DocumentRoot /opt/forgelink/${t}/website

    SSLEngine on
    SSLCertificateFile      /etc/letsencrypt/live/${e}/fullchain.pem
    SSLCertificateKeyFile   /etc/letsencrypt/live/${e}/privkey.pem

    ProxyPreserveHost On
    ProxyPass        /api/ http://127.0.0.1:8080/api/
    ProxyPassReverse /api/ http://127.0.0.1:8080/api/

    <Directory /opt/forgelink/${t}/website>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>
</VirtualHost>
` : "";
  return `# Apache vhost for ${r.meta.name}
# Requires: a2enmod proxy proxy_http ssl rewrite
<VirtualHost *:80>
    ServerName ${e}
    ${s ? `Redirect permanent / https://${e}/` : `DocumentRoot /opt/forgelink/${t}/website
    ProxyPreserveHost On
    ProxyPass        /api/ http://127.0.0.1:8080/api/
    ProxyPassReverse /api/ http://127.0.0.1:8080/api/`}
</VirtualHost>
${n}`;
}
function Zr(r) {
  const e = B(r), t = r.domain.certbotEmail || "admin@" + (r.domain.domain || "example.com"), s = r.domain.reverseProxy;
  return `#!/usr/bin/env bash
# Obtain and install a Let's Encrypt certificate for ${e}.
set -euo pipefail

if ! command -v certbot >/dev/null 2>&1; then
  echo "Installing certbot..."
  sudo apt-get update
  sudo apt-get install -y certbot ${s === "apache" ? "python3-certbot-apache" : "python3-certbot-nginx"}
fi

sudo certbot ${s === "apache" ? "--apache" : "--nginx"} \\
  --non-interactive --agree-tos \\
  -m "${t}" \\
  -d "${e}"

# Auto-renewal is handled by the certbot systemd timer. Verify with:
#   systemctl list-timers | grep certbot
echo "Certificate installed for ${e}."
`;
}
function Fr(r) {
  const { gamePort: e, queryPort: t } = r.server;
  return `#!/usr/bin/env bash
# UFW firewall rules for ${r.meta.name}.
set -euo pipefail

sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS
sudo ufw allow ${e}/tcp   # Game port
sudo ufw allow ${e}/udp   # Game port (UDP)
sudo ufw allow ${t}/udp  # Query port
sudo ufw --force enable
sudo ufw status verbose
`;
}
function jr(r) {
  const e = E(r), t = r.domain.reverseProxy;
  return `#!/usr/bin/env bash
# One-shot deploy script for ${r.meta.name}.
# Run on a fresh Ubuntu/Debian host as a sudo-capable user.
set -euo pipefail

APP_DIR=/opt/forgelink/${e}

echo "==> Installing prerequisites"
sudo apt-get update
sudo apt-get install -y curl git ${t === "apache" ? "apache2" : t === "nginx" ? "nginx" : ""} ufw

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Creating service user and directories"
sudo id forgelink >/dev/null 2>&1 || sudo useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin forgelink
sudo mkdir -p "$APP_DIR"/{data,storage,website}
sudo chown -R forgelink:forgelink "$APP_DIR"

echo "==> Deploying API (expects ./server-api to be uploaded alongside this script)"
sudo cp -r ./server-api/* "$APP_DIR"/
sudo chown -R forgelink:forgelink "$APP_DIR"

echo "==> Installing production dependencies"
( cd "$APP_DIR" && sudo -u forgelink npm ci --omit=dev )

echo "==> Configuring reverse proxy (${t})"
${t === "nginx" ? `sudo cp ./nginx.conf /etc/nginx/sites-available/${e}.conf
sudo ln -sf /etc/nginx/sites-available/${e}.conf /etc/nginx/sites-enabled/${e}.conf
sudo nginx -t && sudo systemctl reload nginx` : t === "apache" ? `sudo a2enmod proxy proxy_http ssl rewrite
sudo cp ./apache.conf /etc/apache2/sites-available/${e}.conf
sudo a2ensite ${e}.conf
sudo apache2ctl configtest && sudo systemctl reload apache2` : 'echo "No reverse proxy selected; API is exposed directly on port 8080."'}

echo "==> Installing systemd service"
sudo cp ./forgelink-${e}.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now forgelink-${e}

echo "==> Applying firewall rules"
sudo bash ./firewall.sh || true

${r.domain.useHttps ? `echo "==> Requesting TLS certificate"
sudo bash ./certbot.sh || echo "Certbot step failed; run ./certbot.sh manually once DNS is set."` : ""}

echo "==> Deploy complete. API health:"
curl -fsS http://127.0.0.1:8080/healthz || true
echo ""
`;
}
function Vr(r) {
  const e = E(r), t = {
    "ecosystem.config.cjs": Er(r),
    [`forgelink-${e}.service`]: Dr(r),
    "firewall.sh": Fr(r),
    "deploy.sh": jr(r)
  };
  return r.domain.reverseProxy === "nginx" && (t["nginx.conf"] = Lr(r)), r.domain.reverseProxy === "apache" && (t["apache.conf"] = Mr(r)), r.domain.useHttps && (t["certbot.sh"] = Zr(r)), t;
}
function Ur(r) {
  const e = B(r), s = `${r.domain.useHttps ? "https" : "http"}://${e}`, { branding: n, meta: a, server: i } = r, o = (l) => l.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return `<!DOCTYPE html>
<html lang="en" data-theme="${n.themeMode}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${o(a.serverName)} — Play Now</title>
<meta name="description" content="${o(a.description)}" />
<style>
  :root {
    --primary: ${n.primaryColor};
    --accent: ${n.accentColor};
    --bg: ${n.themeMode === "dark" ? "#0b0b12" : "#f5f5fb"};
    --fg: ${n.themeMode === "dark" ? "#e8e8f0" : "#12121a"};
    --card: ${n.themeMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"};
    --font: '${n.fontFamily}', system-ui, sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--fg); font-family: var(--font); min-height: 100vh; }
  .hero {
    min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 3rem 1rem;
    background: ${n.backgroundImage ? `url('${o(n.backgroundImage)}') center/cover` : "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 35%, transparent), transparent 60%)"};
  }
  .logo { max-width: 180px; margin-bottom: 1.5rem; }
  h1 { font-size: clamp(2rem, 6vw, 4rem); letter-spacing: -0.02em; }
  .tagline { opacity: 0.8; margin-top: 0.75rem; max-width: 40rem; }
  .cta {
    display: inline-flex; gap: 0.6rem; align-items: center; margin-top: 2rem; padding: 0.9rem 2rem;
    border-radius: 999px; background: linear-gradient(135deg, var(--primary), var(--accent));
    color: #fff; font-weight: 700; text-decoration: none; box-shadow: 0 10px 30px -10px var(--primary);
    transition: transform .15s ease;
  }
  .cta:hover { transform: translateY(-2px); }
  .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
  .card { background: var(--card); border-radius: 18px; padding: 1.5rem; backdrop-filter: blur(12px); border: 1px solid color-mix(in srgb, var(--fg) 10%, transparent); }
  .stat { font-size: 2rem; font-weight: 800; color: var(--accent); }
  .news { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
  .news h2 { margin-bottom: 1rem; }
  .news article { background: var(--card); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem; }
  .news time { opacity: 0.6; font-size: 0.85rem; }
  footer { text-align: center; padding: 2rem; opacity: 0.6; font-size: 0.85rem; }
  .links { display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; }
  .links a { color: var(--accent); text-decoration: none; }
</style>
</head>
<body>
  <section class="hero">
    ${n.serverLogo ? `<img class="logo" src="${o(n.serverLogo)}" alt="${o(a.serverName)} logo" />` : ""}
    <h1>${o(a.serverName)}</h1>
    <p class="tagline">${o(a.description)}</p>
    <a class="cta" href="${s}/api/launcher">⬇ Download Launcher</a>
    <div class="links">
      ${i.website ? `<a href="${o(i.website)}">Website</a>` : ""}
      ${i.discord ? `<a href="${o(i.discord)}">Discord</a>` : ""}
    </div>
  </section>

  <div class="grid">
    <div class="card"><div class="stat" id="status">—</div><div>Server Status</div></div>
    <div class="card"><div class="stat" id="players">—</div><div>Players Online</div></div>
    <div class="card"><div class="stat" id="ping">—</div><div>Ping</div></div>
    <div class="card"><div class="stat" id="version">${o(a.version)}</div><div>Version</div></div>
  </div>

  <div class="news"><h2>Latest News</h2><div id="news"></div></div>

  <footer>Powered by ForgeLink · © ${(/* @__PURE__ */ new Date()).getFullYear()} ${o(a.owner)}</footer>

<script>
  const API = ${JSON.stringify(s)};
  async function refreshStatus() {
    try {
      const r = await fetch(API + '/api/status');
      const s = await r.json();
      document.getElementById('status').textContent = s.online ? 'Online' : 'Offline';
      document.getElementById('players').textContent = (s.playersOnline ?? 0) + ' / ' + (s.playersMax ?? 0);
      document.getElementById('ping').textContent = s.pingMs != null ? s.pingMs + ' ms' : '—';
    } catch (e) { /* API unreachable — leave placeholders */ }
  }
  async function loadNews() {
    try {
      const r = await fetch(API + '/api/news');
      const { news } = await r.json();
      const el = document.getElementById('news');
      el.innerHTML = (news || []).map(n =>
        '<article><h3>' + escapeHtml(n.title) + '</h3><time>' +
        new Date(n.publishedAt).toLocaleDateString() + '</time><p>' +
        escapeHtml(n.body) + '</p></article>').join('');
    } catch (e) { /* ignore */ }
  }
  function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  refreshStatus(); loadNews();
  setInterval(refreshStatus, 30000);
<\/script>
</body>
</html>
`;
}
function zr(r) {
  const t = `${r.domain.useHttps ? "https" : "http"}://${B(r)}`, s = r.meta.serverName || r.meta.name, n = s.replace(/[^A-Za-z0-9 ]/g, "");
  return `; NSIS installer for ${s} launcher — generated by ForgeLink.
!include "MUI2.nsh"

Name "${n} Launcher"
OutFile "${n}-Setup.exe"
InstallDir "$PROGRAMFILES64\\${n}"
InstallDirRegKey HKCU "Software\\${n}" ""
RequestExecutionLevel admin

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"

  ; Launcher binaries are staged next to this script under \\launcher.
  File /r "launcher\\*.*"

  ; Drop the server configuration the launcher reads on first run.
  FileOpen $0 "$INSTDIR\\launcher-config.json" w
  FileWrite $0 '{"apiBase":"${t}","serverId":"${r.id}","serverName":"${Xe(s)}"}'
  FileClose $0

  ; Shortcuts.
  CreateDirectory "$SMPROGRAMS\\${n}"
  CreateShortcut  "$SMPROGRAMS\\${n}\\${n} Launcher.lnk" "$INSTDIR\\${n}.exe"
  CreateShortcut  "$DESKTOP\\${n} Launcher.lnk" "$INSTDIR\\${n}.exe"

  ; Uninstaller + Add/Remove Programs registration.
  WriteUninstaller "$INSTDIR\\Uninstall.exe"
  WriteRegStr HKCU "Software\\${n}" "" $INSTDIR
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${n}" \\
    "DisplayName" "${n} Launcher"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${n}" \\
    "UninstallString" "$INSTDIR\\Uninstall.exe"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${n}" \\
    "DisplayVersion" "${r.meta.version}"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${n}" \\
    "Publisher" "${Xe(r.meta.owner)}"
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\\${n} Launcher.lnk"
  RMDir /r "$SMPROGRAMS\\${n}"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "Software\\${n}"
  DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${n}"
SectionEnd
`;
}
function Xe(r) {
  return r.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function Hr(r) {
  const e = (r.meta.serverName || r.meta.name).replace(/[^A-Za-z0-9 ]/g, ""), t = `com.forgelink.${r.id.replace(/[^a-z0-9]/gi, "").slice(0, 24)}`;
  return JSON.stringify(
    {
      appId: t,
      productName: `${e} Launcher`,
      copyright: `© ${(/* @__PURE__ */ new Date()).getFullYear()} ${r.meta.owner}`,
      directories: { output: "release" },
      files: ["dist/**/*", "dist-electron/**/*", "launcher-config.json"],
      win: {
        target: [{ target: "nsis", arch: ["x64"] }],
        icon: r.branding.launcherIcon || void 0
      },
      nsis: {
        oneClick: !1,
        allowToChangeInstallationDirectory: !0,
        createDesktopShortcut: !0,
        createStartMenuShortcut: !0,
        shortcutName: `${e} Launcher`
      }
    },
    null,
    2
  );
}
class Br {
  constructor(e) {
    k(this, "logger", Re("builder:build"));
    this.store = e;
  }
  async run(e, t) {
    const s = this.store.outputDir(e.id), n = [];
    R(s) && Rt(s, { recursive: !0, force: !0 }), re(s, { recursive: !0 });
    const a = (W, Q) => {
      const Ae = b.join(s, W);
      re(b.dirname(Ae), { recursive: !0 }), le(Ae, Q), n.push(W);
    };
    t({ step: "Scanning mods", percent: 10 });
    const i = M.get(e.meta.gameId), o = e.installation.valid ? await i.scanMods(e.installation.path) : [], l = e.security.verifySignatures ? this.store.getPrivateKey(e.id) : void 0, f = gr({
      gameId: e.meta.gameId,
      version: e.meta.version,
      files: o,
      privateKeyPem: l
    });
    a("manifest.json", JSON.stringify(f, null, 2)), this.logger.info("Manifest built", { files: o.length, totalSize: f.totalSize }), t({ step: "Generating deployment package", percent: 35 });
    const v = Vr(e);
    for (const [W, Q] of Object.entries(v))
      a(b.join("deployment", W), Q);
    t({ step: "Generating website", percent: 55 }), a(b.join("website", "index.html"), Ur(e)), t({ step: "Generating installer", percent: 70 }), a(b.join("installer", "installer.nsi"), zr(e)), a(b.join("installer", "electron-builder.json"), Hr(e)), t({ step: "Writing launcher config", percent: 82 });
    const U = e.domain.useHttps ? "https" : "http", ge = e.domain.ownsDomain && e.domain.domain ? e.domain.subdomain ? `${e.domain.subdomain}.${e.domain.domain}` : e.domain.domain : e.server.serverIp, yt = {
      apiBase: `${U}://${ge}`,
      serverId: e.id,
      serverName: e.meta.serverName,
      gameId: e.meta.gameId,
      verifySignatures: e.security.verifySignatures,
      verifyChecksums: e.security.verifyChecksums,
      publicKey: e.security.verifySignatures ? this.store.getPublicKey(e.id) : "",
      website: e.server.website,
      discord: e.server.discord,
      branding: e.branding,
      autoJoin: {
        serverIp: e.server.serverIp,
        gamePort: e.server.gamePort,
        password: e.server.serverPassword
      }
    };
    if (a(b.join("launcher", "launcher-config.json"), JSON.stringify(yt, null, 2)), t({ step: "Encrypting sensitive config", percent: 90 }), e.security.encryptConfig && e.server.adminPassword) {
      const W = e.id, Q = br(
        JSON.stringify({ adminPassword: e.server.adminPassword }),
        W
      );
      a(b.join("deployment", "secrets.enc.json"), JSON.stringify(Q, null, 2));
    }
    return a("branding.json", JSON.stringify(e.branding, null, 2)), a("README.txt", this.buildReadme(e)), t({ step: "Build complete", percent: 100, detail: `${n.length} artifacts` }), { outputDir: s, manifest: f, artifacts: n };
  }
  buildReadme(e) {
    const t = E(e);
    return `ForgeLink build output for "${e.meta.name}"
Generated: ${(/* @__PURE__ */ new Date()).toISOString()}
Game: ${e.meta.gameId}

Contents:
  manifest.json            Signed mod manifest (SHA-256 per file).
  branding.json            Theme + asset references.
  launcher/                Launcher runtime config (+ embedded public key).
  installer/               NSIS script + electron-builder config for the installer.
  website/                 Static web panel (index.html) — deploy to the server.
  deployment/              Linux deployment package:
    deploy.sh              One-shot deploy script (run on the Linux host).
    ecosystem.config.cjs   PM2 process definition.
    forgelink-${t}.service  systemd unit.
    ${e.domain.reverseProxy === "nginx" ? "nginx.conf              Nginx reverse-proxy site." : e.domain.reverseProxy === "apache" ? "apache.conf             Apache vhost." : ""}
    ${e.domain.useHttps ? "certbot.sh              Let's Encrypt certificate script." : ""}
    firewall.sh            UFW firewall rules.

Deploy:
  1. Upload the server-api build and the deployment/ folder to your Linux host.
  2. Run: sudo bash deployment/deploy.sh
  3. Publish content from the Builder (Publish button) once the API is live.
`;
  }
}
class Wr {
  constructor(e, t) {
    k(this, "logger", Re("builder:publish"));
    this.apiBase = e, this.apiKey = t;
  }
  async post(e, t) {
    const s = await fetch(`${this.apiBase}${e}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": this.apiKey },
      body: JSON.stringify(t)
    });
    if (!s.ok) {
      const n = await s.text().catch(() => "");
      throw new Error(`Publish ${e} failed: ${s.status} ${n}`);
    }
  }
  /** Publish server identity, manifest and news in one flow. */
  async publishAll(e, t) {
    this.logger.info("Publishing server identity", { server: e.id }), await this.post("/api/admin/publish/server", {
      id: e.id,
      gameId: e.meta.gameId,
      name: e.meta.serverName,
      description: e.meta.description,
      server: e.server
    });
    const s = b.join(t, "manifest.json"), n = JSON.parse(ee(s, "utf8"));
    this.logger.info("Publishing manifest", { version: n.version }), await this.post("/api/admin/publish/manifest", { serverId: e.id, manifest: n }), this.logger.info("Publishing news", { count: e.news.length }), await this.post("/api/admin/publish/news", { serverId: e.id, news: e.news });
  }
}
const S = {
  listProjects: "projects:list",
  getProject: "projects:get",
  createProject: "projects:create",
  saveProject: "projects:save",
  pickFolder: "dialog:pickFolder",
  pickImage: "dialog:pickImage",
  detectServer: "server:detect",
  readServerConfig: "server:readConfig",
  build: "build:run",
  publish: "publish:run",
  openOutput: "output:open",
  buildProgress: "build:progress",
  supportedGames: "games:supported"
}, Qe = b.dirname(bt(import.meta.url)), Gr = Re("builder:main"), gt = b.join(se.getPath("userData"), "projects"), T = new Or(gt), Kr = new Br(T);
let O = null;
function et() {
  O = new tt({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#0b0b12",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: b.join(Qe, "preload.js"),
      contextIsolation: !0,
      nodeIntegration: !1,
      sandbox: !1
    }
  });
  const r = process.env.VITE_DEV_SERVER_URL;
  r ? (O.loadURL(r), O.webContents.openDevTools({ mode: "detach" })) : O.loadFile(b.join(Qe, "..", "dist", "index.html"));
}
function qr() {
  I.handle(S.listProjects, () => T.list()), I.handle(S.getProject, (r, e) => T.get(e)), I.handle(S.createProject, (r, e) => T.create(e)), I.handle(S.saveProject, (r, e) => T.save(e)), I.handle(S.pickFolder, async () => {
    const r = await Te.showOpenDialog(O, { properties: ["openDirectory"] });
    return r.canceled ? null : r.filePaths[0];
  }), I.handle(S.pickImage, async () => {
    const r = await Te.showOpenDialog(O, {
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "svg", "ico", "webp"] }]
    });
    return r.canceled ? null : r.filePaths[0];
  }), I.handle(S.detectServer, async (r, e, t) => !Ee(e) || !M.has(e) ? { valid: !1, detectedVersion: null, modsPath: null, notes: [], errors: [`No adapter for ${e}`] } : M.get(e).detect(t)), I.handle(S.readServerConfig, async (r, e, t) => !Ee(e) || !M.has(e) ? {} : M.get(e).readServerConfig(t)), I.handle(S.build, async (r, e) => {
    const t = T.get(e);
    if (!t) throw new Error("Project not found");
    const s = await Kr.run(t, (n) => {
      O == null || O.webContents.send(S.buildProgress, n);
    });
    return { outputDir: s.outputDir, artifacts: s.artifacts };
  }), I.handle(S.publish, async (r, e, t, s) => {
    const n = T.get(e);
    if (!n) throw new Error("Project not found");
    return await new Wr(t.replace(/\/$/, ""), s).publishAll(n, T.outputDir(e)), { ok: !0 };
  }), I.handle(S.openOutput, async (r, e) => {
    await xt.openPath(T.outputDir(e));
  }), I.handle(S.supportedGames, () => M.supportedGames());
}
se.whenReady().then(() => {
  Gr.info("Builder starting", { workspaceDir: gt }), qr(), et(), se.on("activate", () => {
    tt.getAllWindows().length === 0 && et();
  });
});
se.on("window-all-closed", () => {
  process.platform !== "darwin" && se.quit();
});
