import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { hasInjectionContext, getCurrentInstance, ref, reactive, useSSRContext, createApp, defineComponent, mergeProps, unref, computed, watch, provide, onErrorCaptured, onServerPrefetch, createVNode, resolveDynamicComponent, shallowReactive, effectScope, inject, defineAsyncComponent, getCurrentScope, toRef, h, isReadonly, isRef, isShallow, isReactive, toRaw } from 'vue';
import { p as parseURL, e as encodePath, l as decodePath, m as hasProtocol, n as isScriptProtocol, o as joinURL, w as withQuery, q as sanitizeStatusCode, r as getContext, $ as $fetch, v as createHooks, f as createError$1, x as isEqual, y as stringifyParsedURL, z as stringifyQuery, A as parseQuery, B as defu } from '../_/nitro.mjs';
import { b as baseURL } from '../routes/renderer.mjs';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderList, ssrLooseContain, ssrLooseEqual, ssrRenderComponent, ssrRenderSuspense, ssrRenderVNode } from 'vue/server-renderer';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.21.11";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin) {
  if (plugin.hooks) {
    nuxtApp.hooks.addHooks(plugin.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin) {
    const unresolvedPluginsForThisPlugin = plugin.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin).then(async () => {
        if (plugin._name) {
          resolvedPlugins.add(plugin._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin._name)) {
              dependsOn.delete(plugin._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin);
  }
  for (const plugin of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin) {
  if (typeof plugin === "function") {
    return plugin;
  }
  const _name = plugin._name || plugin.name;
  delete plugin.name;
  return Object.assign(plugin.setup || (() => {
  }), plugin, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const PageRouteSymbol = /* @__PURE__ */ Symbol("route");
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
function isScopeWithinInstance(instance) {
  const instanceScope = instance.scope;
  let scope = getCurrentScope();
  while (scope) {
    if (scope === instanceScope) {
      return true;
    }
    scope = scope.parent;
  }
  return false;
}
const useRoute = () => {
  if (hasInjectionContext()) {
    const instance = getCurrentInstance();
    if (!instance || isScopeWithinInstance(instance)) {
      return inject(PageRouteSymbol, useNuxtApp()._route);
    }
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
const HTML_ATTR_ENCODE_MAP = {
  "&": "%26",
  '"': "%22",
  "'": "%27",
  "<": "%3C",
  ">": "%3E"
};
function encodeForHtmlAttr(value) {
  return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedHeader = encodeURL(location2, isExternalHost);
        const encodedLoc = encodeForHtmlAttr(encodedHeader);
        nuxtApp.ssrContext["~renderResponse"] = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    const pathname = url.pathname.replace(/^\/{2,}/, "/");
    return pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  if (typeof error !== "string" && error.statusText) {
    error.message ??= error.statusText;
  }
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};
function freezeHead(head) {
  const realPush = head.push;
  head.push = () => ({ dispose: () => {
  }, patch: () => {
  }, _poll: () => {
  } });
  return () => {
    head.push = realPush;
  };
}
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    if (nuxtApp.ssrContext.islandContext) {
      const unfreeze = freezeHead(head);
      nuxtApp.hooks.hookOnce("app:created", unfreeze);
    }
    nuxtApp.vueApp.use(head);
  }
});
const routerOptions = {};
const sensitiveMatcher = (m, p) => {
  return [];
};
const foldedMatcher = sensitiveMatcher;
const decodeRoutePath = function decodeRoutePath2(path) {
  if (!path.includes("%")) return path;
  const queryIndex = path.indexOf("?");
  const pathname = queryIndex === -1 ? path : path.slice(0, queryIndex);
  try {
    return queryIndex === -1 ? decodeURI(pathname) : decodeURI(pathname) + path.slice(queryIndex);
  } catch {
    return path;
  }
};
const normalizePath = (path, fold) => {
  if (typeof path !== "string") {
    return path;
  }
  const decoded = decodeRoutePath(path);
  return fold ? decoded.toLowerCase() : decoded;
};
const _routeRulesMatcher = (path) => routerOptions.sensitive ? defu({}, ...sensitiveMatcher("", normalizePath(path, false)).map((r) => r.data).reverse()) : defu({}, ...foldedMatcher("", normalizePath(path, true)).map((r) => r.data).reverse());
const routeRulesMatcher = _routeRulesMatcher;
function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  try {
    return routeRulesMatcher(path);
  } catch (e) {
    console.error("[nuxt] Error matching route rules.", e);
    return {};
  }
}
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  {
    return;
  }
});
const globalMiddleware = [
  manifest_45route_45rule
];
function getRouteFromPath(fullPath) {
  const route = fullPath && typeof fullPath === "object" ? fullPath : {};
  if (typeof fullPath === "object") {
    fullPath = stringifyParsedURL({
      pathname: fullPath.path || "",
      search: stringifyQuery(fullPath.query || {}),
      hash: fullPath.hash || ""
    });
  }
  const url = new URL(fullPath.toString(), "http://localhost");
  return {
    path: url.pathname,
    fullPath,
    query: parseQuery(url.search),
    hash: url.hash,
    // stub properties for compat with vue-router
    params: route.params || {},
    name: void 0,
    matched: route.matched || [],
    redirectedFrom: void 0,
    meta: route.meta || {},
    href: fullPath
  };
}
const router_DclsWNDeVV7SyG4lslgLnjbQUK1ws8wgf2FHaAbo7Cw = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  setup(nuxtApp) {
    const initialURL = nuxtApp.ssrContext.url;
    const routes = [];
    const hooks = {
      "navigate:before": [],
      "resolve:before": [],
      "navigate:after": [],
      "error": []
    };
    const registerHook = (hook, guard) => {
      hooks[hook].push(guard);
      return () => {
        const index = hooks[hook].indexOf(guard);
        if (index !== -1) {
          hooks[hook].splice(index, 1);
        }
      };
    };
    (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const route = reactive(getRouteFromPath(initialURL));
    let navigationCounter = 0;
    async function handleNavigation(url, replace) {
      const navigationId = ++navigationCounter;
      try {
        const to = getRouteFromPath(url);
        for (const middleware of hooks["navigate:before"]) {
          const result = await middleware(to, route);
          if (navigationId !== navigationCounter) {
            return;
          }
          if (result === false || result instanceof Error) {
            return;
          }
          if (typeof result === "string" && result.length) {
            return await handleNavigation(result, true);
          }
        }
        for (const handler of hooks["resolve:before"]) {
          await handler(to, route);
          if (navigationId !== navigationCounter) {
            return;
          }
        }
        Object.assign(route, to);
        if (false) ;
        for (const middleware of hooks["navigate:after"]) {
          await middleware(to, route);
        }
      } catch (err) {
        for (const handler of hooks.error) {
          await handler(err);
        }
      }
    }
    const currentRoute = computed(() => route);
    const router = {
      currentRoute,
      isReady: () => Promise.resolve(),
      // These options provide a similar API to vue-router but have no effect
      options: {},
      install: () => Promise.resolve(),
      // Navigation
      push: (url) => handleNavigation(url),
      replace: (url) => handleNavigation(url),
      back: () => (void 0).history.go(-1),
      go: (delta) => (void 0).history.go(delta),
      forward: () => (void 0).history.go(1),
      // Guards
      beforeResolve: (guard) => registerHook("resolve:before", guard),
      beforeEach: (guard) => registerHook("navigate:before", guard),
      afterEach: (guard) => registerHook("navigate:after", guard),
      onError: (handler) => registerHook("error", handler),
      // Routes
      resolve: getRouteFromPath,
      addRoute: (parentName, route2) => {
        routes.push(route2);
      },
      getRoutes: () => routes,
      hasRoute: (name) => routes.some((route2) => route2.name === name),
      removeRoute: (name) => {
        const index = routes.findIndex((route2) => route2.name === name);
        if (index !== -1) {
          routes.splice(index, 1);
        }
      }
    };
    nuxtApp.vueApp.component("RouterLink", defineComponent({
      functional: true,
      props: {
        to: {
          type: String,
          required: true
        },
        custom: Boolean,
        replace: Boolean,
        // Not implemented
        activeClass: String,
        exactActiveClass: String,
        ariaCurrentValue: String
      },
      setup: (props, { slots }) => {
        const navigate = () => handleNavigation(props.to, props.replace);
        return () => {
          const route2 = router.resolve(props.to);
          return props.custom ? slots.default?.({ href: props.to, navigate, route: route2 }) : h("a", { href: props.to, onClick: (e) => {
            e.preventDefault();
            return navigate();
          } }, slots);
        };
      }
    }));
    nuxtApp._route = route;
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const initialLayout = nuxtApp.payload.state._layout;
    const initialLayoutProps = nuxtApp.payload.state._layoutProps;
    nuxtApp.hooks.hookOnce("app:created", async () => {
      router.beforeEach(async (to, from) => {
        to.meta = reactive(to.meta || {});
        if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
          to.meta.layout = initialLayout;
          to.meta.layoutProps = initialLayoutProps;
        }
        nuxtApp._processingMiddleware = true;
        {
          nuxtApp._middlewareTo = to;
        }
        if (!nuxtApp.ssrContext?.islandContext) {
          const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
          const routeRules = getRouteRules({ path: to.path });
          if (routeRules.appMiddleware) {
            for (const key in routeRules.appMiddleware) {
              const guard = nuxtApp._middleware.named[key];
              if (!guard) {
                continue;
              }
              if (routeRules.appMiddleware[key]) {
                middlewareEntries.add(guard);
              } else {
                middlewareEntries.delete(guard);
              }
            }
          }
          for (const middleware of middlewareEntries) {
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            {
              if (result === false || result instanceof Error) {
                const error = result || createError$1({
                  status: 404,
                  statusText: `Page Not Found: ${initialURL}`,
                  data: {
                    path: initialURL
                  }
                });
                delete nuxtApp._processingMiddleware;
                delete nuxtApp._middlewareTo;
                return nuxtApp.runWithContext(() => showError(error));
              }
            }
            if (result === true) {
              continue;
            }
            if (result || result === false) {
              return result;
            }
          }
        }
      });
      router.afterEach(() => {
        delete nuxtApp._processingMiddleware;
        {
          delete nuxtApp._middlewareTo;
        }
      });
      await router.replace(initialURL);
      if (!isEqual(route.fullPath, initialURL)) {
        await nuxtApp.runWithContext(() => navigateTo(route.fullPath));
      }
    });
    return {
      provide: {
        route,
        router
      }
    };
  }
});
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
  }
}
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const plugins = [
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  router_DclsWNDeVV7SyG4lslgLnjbQUK1ws8wgf2FHaAbo7Cw,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4
];
const currentUser = ref(null);
const isLoadingAuth = ref(true);
const isFirebaseConfigured = ref(false);
const authError = ref(null);
const isSyncing = ref(false);
const lastSyncTime = ref(null);
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAzx0mMk_4Z0SWFin6ex5eawyOVVwZQVaE",
  authDomain: "gerencimento3d-project.firebaseapp.com",
  projectId: "gerencimento3d-project",
  storageBucket: "gerencimento3d-project.firebasestorage.app",
  messagingSenderId: "647763861999",
  appId: "1:647763861999:web:27e745eb4868dd6401d61a"
};
const firebaseConfig = reactive({ ...DEFAULT_FIREBASE_CONFIG });
const useFirebase = () => {
  const initFirebase = () => {
    return;
  };
  const saveFirebaseConfig = (newConfig) => {
    Object.assign(firebaseConfig, newConfig);
  };
  const resetFirebaseConfig = () => {
    firebaseConfig.apiKey = "";
    firebaseConfig.authDomain = "";
    firebaseConfig.projectId = "";
    firebaseConfig.storageBucket = "";
    firebaseConfig.messagingSenderId = "";
    firebaseConfig.appId = "";
    isFirebaseConfigured.value = false;
    currentUser.value = null;
  };
  const loginWithEmail = async (email, pass) => {
    authError.value = null;
    {
      authError.value = "Firebase ainda não foi configurado.";
      return false;
    }
  };
  const registerWithEmail = async (email, pass, displayName) => {
    authError.value = null;
    {
      authError.value = "Firebase ainda não foi configurado.";
      return false;
    }
  };
  const loginWithGoogle = async () => {
    authError.value = null;
    {
      authError.value = "Firebase ainda não foi configurado.";
      return false;
    }
  };
  const logout = async () => {
    authError.value = null;
    currentUser.value = null;
  };
  const saveUserCloudData = async (data) => {
    return false;
  };
  const loadUserCloudData = async (uid) => {
    return null;
  };
  return {
    currentUser,
    isLoadingAuth,
    isFirebaseConfigured,
    authError,
    firebaseConfig,
    isSyncing,
    lastSyncTime,
    initFirebase,
    saveFirebaseConfig,
    resetFirebaseConfig,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    saveUserCloudData,
    loadUserCloudData
  };
};
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "AuthScreen",
  __ssrInlineRender: true,
  emits: ["logged-in", "continue-as-guest"],
  setup(__props, { emit: __emit }) {
    const {
      isLoadingAuth: isLoadingAuth2,
      authError: authError2
    } = useFirebase();
    const mode = ref("login");
    const loginForm = reactive({
      email: "",
      password: ""
    });
    const registerForm = reactive({
      displayName: "",
      email: "",
      password: ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "auth-screen-wrapper" }, _attrs))} data-v-054561a4><div class="auth-ambient-glow-1" data-v-054561a4></div><div class="auth-ambient-glow-2" data-v-054561a4></div><div class="container-custom auth-container" data-v-054561a4><div class="auth-hero-section" data-v-054561a4><div class="auth-brand-badge" data-v-054561a4><div class="logo-icon-box" style="${ssrRenderStyle({ "width": "48px", "height": "48px" })}" data-v-054561a4><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" data-v-054561a4><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" data-v-054561a4></path><polyline points="3.27 6.96 12 12.01 20.73 6.96" data-v-054561a4></polyline><line x1="12" y1="22.08" x2="12" y2="12" data-v-054561a4></line></svg></div><div data-v-054561a4><div style="${ssrRenderStyle({ "font-size": "1.6rem", "font-weight": "800", "line-height": "1" })}" data-v-054561a4><span class="text-gradient" data-v-054561a4>Print3D</span> <span style="${ssrRenderStyle({ "font-weight": "400", "color": "#94a3b8" })}" data-v-054561a4>Pro</span></div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "font-weight": "700", "color": "var(--brand-cyan)", "letter-spacing": "0.08em", "text-transform": "uppercase" })}" data-v-054561a4> Gestão de Impressão 3D &amp; Marketplaces </span></div></div><h1 style="${ssrRenderStyle({ "font-size": "2.4rem", "font-weight": "800", "line-height": "1.15", "margin-bottom": "1.25rem" })}" data-v-054561a4> Precificação profissional e controle total do seu negócio 3D. </h1><p style="${ssrRenderStyle({ "font-size": "1.05rem", "color": "var(--text-muted)", "line-height": "1.6", "margin-bottom": "2rem" })}" data-v-054561a4> Pare de perder dinheiro em taxas ocultas de marketplaces. Calcule o custo real do filamento, energia, depreciação e saiba exatamente quanto cobrar no Mercado Livre, Shopee e vendas diretas. </p><div style="${ssrRenderStyle({ "display": "flex", "flex-direction": "column", "gap": "1rem", "margin-bottom": "2rem" })}" data-v-054561a4><div class="auth-benefit-item" data-v-054561a4><div class="benefit-icon-box" data-v-054561a4>🧵</div><div data-v-054561a4><strong data-v-054561a4>Calculadora Real de Filamentos</strong><div style="${ssrRenderStyle({ "font-size": "0.8rem", "color": "var(--text-dim)" })}" data-v-054561a4>Custo preciso por grama, controle de estoque do carretel e suporte AMS multicolor.</div></div></div><div class="auth-benefit-item" data-v-054561a4><div class="benefit-icon-box" data-v-054561a4>🏷️</div><div data-v-054561a4><strong data-v-054561a4>Simulador Reverso de Marketplaces</strong><div style="${ssrRenderStyle({ "font-size": "0.8rem", "color": "var(--text-dim)" })}" data-v-054561a4>Mercado Livre Clássico/Premium, Shopee, Elo7 e PIX com taxas e frete grátis calculados.</div></div></div><div class="auth-benefit-item" data-v-054561a4><div class="benefit-icon-box" data-v-054561a4>☁️</div><div data-v-054561a4><strong data-v-054561a4>Seus Dados Separados e Seguros na Nuvem</strong><div style="${ssrRenderStyle({ "font-size": "0.8rem", "color": "var(--text-dim)" })}" data-v-054561a4>Acesse seus orçamentos e impressoras de qualquer celular, tablet ou computador.</div></div></div></div></div><div class="auth-card-section" data-v-054561a4><div class="card card-glass auth-glass-card" data-v-054561a4><div class="auth-tab-nav" data-v-054561a4><button id="btn-tab-login" type="button" class="${ssrRenderClass([{ active: mode.value === "login" }, "auth-tab-btn"])}" data-v-054561a4> Acessar Conta </button><button id="btn-tab-register" type="button" class="${ssrRenderClass([{ active: mode.value === "register" }, "auth-tab-btn"])}" data-v-054561a4> Criar Nova Conta </button></div>`);
      if (unref(authError2)) {
        _push(`<div class="auth-alert-error" data-v-054561a4><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${ssrRenderStyle({ "flex-shrink": "0" })}" data-v-054561a4><circle cx="12" cy="12" r="10" data-v-054561a4></circle><line x1="12" y1="8" x2="12" y2="12" data-v-054561a4></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-054561a4></line></svg><span data-v-054561a4>${ssrInterpolate(unref(authError2))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (mode.value === "login") {
        _push(`<form data-v-054561a4><div class="form-group" data-v-054561a4><label class="form-label" for="auth-login-email" data-v-054561a4>Seu E-mail</label><div class="input-prefix-box" data-v-054561a4><span class="input-prefix-tag" data-v-054561a4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-054561a4><rect x="2" y="4" width="20" height="16" rx="2" data-v-054561a4></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" data-v-054561a4></path></svg></span><input id="auth-login-email"${ssrRenderAttr("value", loginForm.email)} type="email" class="input-control" required placeholder="exemplo@gmail.com"${ssrIncludeBooleanAttr(unref(isLoadingAuth2)) ? " disabled" : ""} data-v-054561a4></div></div><div class="form-group" data-v-054561a4><label class="form-label" for="auth-login-pass" data-v-054561a4>Sua Senha</label><div class="input-prefix-box" data-v-054561a4><span class="input-prefix-tag" data-v-054561a4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-054561a4><rect x="3" y="11" width="18" height="11" rx="2" ry="2" data-v-054561a4></rect><path d="M7 11V7a5 5 0 0 1 10 0v4" data-v-054561a4></path></svg></span><input id="auth-login-pass"${ssrRenderAttr("value", loginForm.password)} type="password" class="input-control" required placeholder="••••••••"${ssrIncludeBooleanAttr(unref(isLoadingAuth2)) ? " disabled" : ""} data-v-054561a4></div></div><button id="btn-auth-submit-login" type="submit" class="btn btn-primary" style="${ssrRenderStyle({ "width": "100%", "padding": "0.85rem", "font-size": "1rem", "margin-top": "0.5rem" })}"${ssrIncludeBooleanAttr(unref(isLoadingAuth2)) ? " disabled" : ""} data-v-054561a4>${ssrInterpolate(unref(isLoadingAuth2) ? "Entrando..." : "Entrar no Sistema")}</button></form>`);
      } else {
        _push(`<!---->`);
      }
      if (mode.value === "register") {
        _push(`<form data-v-054561a4><div class="form-group" data-v-054561a4><label class="form-label" for="auth-reg-name" data-v-054561a4>Nome da sua Oficina ou Perfil</label><div class="input-prefix-box" data-v-054561a4><span class="input-prefix-tag" data-v-054561a4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-054561a4><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" data-v-054561a4></path><circle cx="12" cy="7" r="4" data-v-054561a4></circle></svg></span><input id="auth-reg-name"${ssrRenderAttr("value", registerForm.displayName)} type="text" class="input-control" required placeholder="Ex: Studio 3D Criativo"${ssrIncludeBooleanAttr(unref(isLoadingAuth2)) ? " disabled" : ""} data-v-054561a4></div></div><div class="form-group" data-v-054561a4><label class="form-label" for="auth-reg-email" data-v-054561a4>Seu E-mail</label><div class="input-prefix-box" data-v-054561a4><span class="input-prefix-tag" data-v-054561a4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-054561a4><rect x="2" y="4" width="20" height="16" rx="2" data-v-054561a4></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" data-v-054561a4></path></svg></span><input id="auth-reg-email"${ssrRenderAttr("value", registerForm.email)} type="email" class="input-control" required placeholder="seuemail@exemplo.com"${ssrIncludeBooleanAttr(unref(isLoadingAuth2)) ? " disabled" : ""} data-v-054561a4></div></div><div class="form-group" data-v-054561a4><label class="form-label" for="auth-reg-pass" data-v-054561a4>Criar Senha (mínimo 6 dígitos)</label><div class="input-prefix-box" data-v-054561a4><span class="input-prefix-tag" data-v-054561a4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-054561a4><rect x="3" y="11" width="18" height="11" rx="2" ry="2" data-v-054561a4></rect><path d="M7 11V7a5 5 0 0 1 10 0v4" data-v-054561a4></path></svg></span><input id="auth-reg-pass"${ssrRenderAttr("value", registerForm.password)} type="password" class="input-control" required minlength="6" placeholder="••••••••"${ssrIncludeBooleanAttr(unref(isLoadingAuth2)) ? " disabled" : ""} data-v-054561a4></div></div><button id="btn-auth-submit-register" type="submit" class="btn btn-primary" style="${ssrRenderStyle({ "width": "100%", "padding": "0.85rem", "font-size": "1rem", "margin-top": "0.5rem" })}"${ssrIncludeBooleanAttr(unref(isLoadingAuth2)) ? " disabled" : ""} data-v-054561a4>${ssrInterpolate(unref(isLoadingAuth2) ? "Criando Conta..." : "Cadastrar e Começar")}</button></form>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "0.75rem", "margin": "1.5rem 0", "color": "var(--text-dim)", "font-size": "0.75rem" })}" data-v-054561a4><div style="${ssrRenderStyle({ "flex": "1", "height": "1px", "background": "var(--border-subtle)" })}" data-v-054561a4></div><span data-v-054561a4>OU</span><div style="${ssrRenderStyle({ "flex": "1", "height": "1px", "background": "var(--border-subtle)" })}" data-v-054561a4></div></div><button id="btn-auth-google" type="button" class="btn btn-secondary" style="${ssrRenderStyle({ "width": "100%", "padding": "0.75rem" })}"${ssrIncludeBooleanAttr(unref(isLoadingAuth2)) ? " disabled" : ""} data-v-054561a4><svg width="18" height="18" viewBox="0 0 24 24" data-v-054561a4><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" data-v-054561a4></path><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" data-v-054561a4></path><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" data-v-054561a4></path><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" data-v-054561a4></path></svg><span data-v-054561a4>Continuar com o Google</span></button><div style="${ssrRenderStyle({ "text-align": "center", "margin-top": "1.5rem", "padding-top": "1rem", "border-top": "1px solid var(--border-subtle)" })}" data-v-054561a4><button id="btn-guest-mode" type="button" class="btn-text-link" data-v-054561a4> Testar no modo local offline sem login → </button></div></div></div></div></div>`);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AuthScreen.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-054561a4"]]);
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "AppHeader",
  __ssrInlineRender: true,
  props: {
    currentTab: {},
    filamentCount: {},
    platformCount: {},
    quoteCount: {},
    currentUser: {},
    isFirebaseConfigured: { type: Boolean },
    isSyncing: { type: Boolean }
  },
  emits: ["change-tab", "new-job", "open-auth", "logout"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "navbar-header" }, _attrs))}><div class="container-custom nav-container"><a href="#" class="logo-brand"><div class="logo-icon-box"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div><div><div style="${ssrRenderStyle({ "line-height": "1.1" })}"><span class="text-gradient">Print3D</span> <span style="${ssrRenderStyle({ "font-weight": "400", "color": "#94a3b8" })}">Pro</span></div><span style="${ssrRenderStyle({ "font-size": "0.68rem", "font-weight": "600", "color": "var(--brand-cyan)", "letter-spacing": "0.08em", "text-transform": "uppercase" })}"> Gerenciador &amp; Simulador de Vendas </span></div></a><nav class="nav-tabs" role="tablist"><button id="tab-calculator" type="button" class="${ssrRenderClass([{ active: __props.currentTab === "calculator" }, "nav-tab-btn"])}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg><span>Calculadora &amp; Simulador</span></button><button id="tab-filaments" type="button" class="${ssrRenderClass([{ active: __props.currentTab === "filaments" }, "nav-tab-btn"])}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="3" x2="12" y2="9"></line><line x1="12" y1="15" x2="12" y2="21"></line></svg><span>Filamentos (${ssrInterpolate(__props.filamentCount)})</span></button><button id="tab-platforms" type="button" class="${ssrRenderClass([{ active: __props.currentTab === "platforms" }, "nav-tab-btn"])}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg><span>Taxas Plataformas (${ssrInterpolate(__props.platformCount)})</span></button><button id="tab-printers" type="button" class="${ssrRenderClass([{ active: __props.currentTab === "printers" }, "nav-tab-btn"])}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg><span>Impressoras &amp; Custos</span></button><button id="tab-quotes" type="button" class="${ssrRenderClass([{ active: __props.currentTab === "quotes" }, "nav-tab-btn"])}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg><span>Orçamentos Salvos (${ssrInterpolate(__props.quoteCount)})</span></button></nav><div class="nav-right-actions"><button id="btn-quick-new" class="btn btn-secondary btn-sm" title="Limpar formulário e criar novo orçamento"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span>Novo Cálculo</span></button>`);
      if (__props.currentUser) {
        _push(`<div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "0.5rem", "background": "rgba(0, 0, 0, 0.3)", "border": "1px solid var(--border-subtle)", "padding": "0.25rem 0.5rem", "border-radius": "var(--radius-md)" })}"><div style="${ssrRenderStyle({ "width": "26px", "height": "26px", "border-radius": "50%", "background": "linear-gradient(135deg, var(--brand-cyan), var(--brand-blue))", "color": "#050b14", "font-weight": "800", "font-size": "0.75rem", "display": "flex", "align-items": "center", "justify-content": "center" })}">${ssrInterpolate((__props.currentUser.displayName || __props.currentUser.email || "U")[0].toUpperCase())}</div><div style="${ssrRenderStyle({ "line-height": "1.1", "max-width": "120px", "overflow": "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" })}"><div style="${ssrRenderStyle({ "font-size": "0.75rem", "font-weight": "700", "color": "var(--text-main)" })}">${ssrInterpolate(__props.currentUser.displayName)}</div><div style="${ssrRenderStyle({ "font-size": "0.65rem", "color": "var(--brand-emerald)", "display": "flex", "align-items": "center", "gap": "0.25rem" })}">`);
        if (__props.isSyncing) {
          _push(`<span>Sincronizando...</span>`);
        } else {
          _push(`<span>☁️ Nuvem Ativa</span>`);
        }
        _push(`</div></div><button id="btn-header-logout" class="btn btn-secondary btn-sm btn-icon" style="${ssrRenderStyle({ "width": "26px", "height": "26px" })}" title="Sair da conta"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg></button></div>`);
      } else {
        _push(`<button id="btn-header-login" class="btn btn-secondary btn-sm" style="${ssrRenderStyle({ "border-color": "rgba(0, 240, 255, 0.3)" })}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg><span>${ssrInterpolate(__props.isFirebaseConfigured ? "Entrar / Sincronizar" : "Conectar Firebase")}</span></button>`);
      }
      _push(`</div></div></header>`);
    };
  }
});
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppHeader.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const DEFAULT_FILAMENTS = [
  {
    id: "f-1",
    name: "PLA Branco Puro",
    brand: "Voolt3D",
    material: "PLA",
    color: "#ffffff",
    colorName: "Branco Neve",
    diameter: 1.75,
    spoolWeightG: 1e3,
    pricePaid: 104.9,
    shippingCost: 12,
    remainingG: 820,
    density: 1.24,
    notes: "Ótima adesão na mesa texturizada, 210°C / mesa 60°C"
  },
  {
    id: "f-2",
    name: "PLA Preto Fosco",
    brand: "PrintaLot",
    material: "PLA",
    color: "#1e293b",
    colorName: "Preto Fosco",
    diameter: 1.75,
    spoolWeightG: 1e3,
    pricePaid: 119,
    shippingCost: 0,
    remainingG: 950,
    density: 1.24,
    notes: "Excelente acabamento e esconde as linhas de camada"
  },
  {
    id: "f-3",
    name: "PETG Cristal Translúcido",
    brand: "3D Fila",
    material: "PETG",
    color: "#94a3b8",
    colorName: "Transparente",
    diameter: 1.75,
    spoolWeightG: 1e3,
    pricePaid: 124.9,
    shippingCost: 15,
    remainingG: 640,
    density: 1.27,
    notes: "Resistente a UV e umidade, 240°C / mesa 75°C"
  },
  {
    id: "f-4",
    name: "PLA Silk Dourado Nobre",
    brand: "Creality",
    material: "PLA Silk",
    color: "#f59e0b",
    colorName: "Dourado Brilhante",
    diameter: 1.75,
    spoolWeightG: 1e3,
    pricePaid: 149,
    shippingCost: 10,
    remainingG: 480,
    density: 1.25,
    notes: "Brilho metálico para troféus e estatuetas decorativas"
  },
  {
    id: "f-5",
    name: "ABS Vermelho Carmim",
    brand: "Voolt3D",
    material: "ABS",
    color: "#ef4444",
    colorName: "Vermelho Intenso",
    diameter: 1.75,
    spoolWeightG: 1e3,
    pricePaid: 92,
    shippingCost: 10,
    remainingG: 700,
    density: 1.04,
    notes: "Ideal para peças mecânicas e automotivas, câmara fechada"
  },
  {
    id: "f-6",
    name: "TPU Flexível 95A Azul",
    brand: "eSun",
    material: "TPU",
    color: "#3b82f6",
    colorName: "Azul Elétrico",
    diameter: 1.75,
    spoolWeightG: 1e3,
    pricePaid: 165,
    shippingCost: 15,
    remainingG: 390,
    density: 1.21,
    notes: "Para protetores, capas, vedações e amortecedores"
  }
];
const DEFAULT_PRINTERS = [
  {
    id: "p-1",
    name: "Bambu Lab P1S Combo",
    brand: "Bambu Lab",
    model: "P1S",
    powerWatts: 180,
    purchaseCost: 5600,
    lifespanHours: 5e3,
    maintenancePerHour: 1.5,
    isDefault: true
  },
  {
    id: "p-2",
    name: "Creality Ender 3 V3 KE",
    brand: "Creality",
    model: "Ender 3 V3 KE",
    powerWatts: 150,
    purchaseCost: 2100,
    lifespanHours: 3e3,
    maintenancePerHour: 1.2,
    isDefault: false
  },
  {
    id: "p-3",
    name: "Creality K1 Max High Speed",
    brand: "Creality",
    model: "K1 Max",
    powerWatts: 320,
    purchaseCost: 4800,
    lifespanHours: 4500,
    maintenancePerHour: 1.8,
    isDefault: false
  }
];
const DEFAULT_SETTINGS = {
  electricityCostPerKwh: 0.92,
  // R$ por kWh
  hourlyLaborRate: 35,
  // R$ por hora de trabalho
  defaultFailureRate: 8,
  // 8% margem de falha
  defaultProfitMargin: 65,
  // 65% de lucro líquido alvo
  taxRatePercent: 5,
  // 5% imposto MEI / Simples
  currency: "BRL"
};
const DEFAULT_PLATFORMS = [
  {
    id: "plat-ml-classico",
    name: "Mercado Livre Clássico",
    category: "marketplace",
    badgeColor: "#FFE600",
    commissionPercent: 13.5,
    fixedFee: 6.75,
    fixedFeeThreshold: 79,
    freeShippingCost: 18.5,
    freeShippingThreshold: 79,
    paymentProcessingPercent: 0,
    enabled: true,
    description: "Anúncio padrão com comissão de 13.5%. Abaixo de R$79 incide taxa fixa de R$6,75. Acima de R$79 frete grátis obrigatório coparticipado."
  },
  {
    id: "plat-ml-premium",
    name: "Mercado Livre Premium",
    category: "marketplace",
    badgeColor: "#FFA500",
    commissionPercent: 18.5,
    fixedFee: 6.75,
    fixedFeeThreshold: 79,
    freeShippingCost: 18.5,
    freeShippingThreshold: 79,
    paymentProcessingPercent: 0,
    enabled: true,
    description: "Anúncio com parcelamento em até 12x sem juros para o comprador. Maior conversão de vendas."
  },
  {
    id: "plat-shopee-padrao",
    name: "Shopee Padrão",
    category: "marketplace",
    badgeColor: "#EE4D2D",
    commissionPercent: 14,
    fixedFee: 4,
    fixedFeeThreshold: 99999,
    freeShippingCost: 0,
    freeShippingThreshold: 99999,
    paymentProcessingPercent: 0,
    enabled: true,
    description: "14% de comissão + taxa de transação fixa de R$4,00 por item vendido."
  },
  {
    id: "plat-shopee-frete-gratis",
    name: "Shopee Programa Frete Grátis",
    category: "marketplace",
    badgeColor: "#FF6433",
    commissionPercent: 20,
    fixedFee: 4,
    fixedFeeThreshold: 99999,
    freeShippingCost: 0,
    freeShippingThreshold: 99999,
    paymentProcessingPercent: 0,
    enabled: true,
    description: "20% de comissão (com teto máximo por item de ~R$105) + R$4,00 de transação. Selo de cupom de frete grátis oficial."
  },
  {
    id: "plat-elo7",
    name: "Elo7 Artesanato & 3D",
    category: "marketplace",
    badgeColor: "#E9573F",
    commissionPercent: 18,
    fixedFee: 0,
    fixedFeeThreshold: 0,
    freeShippingCost: 0,
    freeShippingThreshold: 99999,
    paymentProcessingPercent: 0,
    enabled: true,
    description: "Excelente para peças decorativas, cosplay, action figures e presentes personalizados."
  },
  {
    id: "plat-amazon-br",
    name: "Amazon Brasil",
    category: "marketplace",
    badgeColor: "#FF9900",
    commissionPercent: 15,
    fixedFee: 2,
    fixedFeeThreshold: 99999,
    freeShippingCost: 0,
    freeShippingThreshold: 99999,
    paymentProcessingPercent: 0,
    enabled: true,
    description: "15% de comissão da categoria + taxa por fechamento de pedido de R$ 2,00."
  },
  {
    id: "plat-direto",
    name: "Venda Direta / WhatsApp / PIX",
    category: "direct",
    badgeColor: "#10B981",
    commissionPercent: 0,
    fixedFee: 0,
    fixedFeeThreshold: 0,
    freeShippingCost: 0,
    freeShippingThreshold: 99999,
    paymentProcessingPercent: 0,
    enabled: true,
    description: "100% livre de comissões de marketplace. Máxima rentabilidade direta para o seu negócio."
  },
  {
    id: "plat-site-cartao",
    name: "Loja Própria (Cartão 3x)",
    category: "ecommerce",
    badgeColor: "#6366F1",
    commissionPercent: 4.2,
    fixedFee: 0.6,
    fixedFeeThreshold: 99999,
    freeShippingCost: 0,
    freeShippingThreshold: 99999,
    paymentProcessingPercent: 1.5,
    enabled: true,
    description: "Site próprio (Nuvemshop/Shopify/WooCommerce) com taxa de gateway de cartão e antifraude."
  }
];
const filaments = reactive(JSON.parse(JSON.stringify(DEFAULT_FILAMENTS)));
const printers = reactive(JSON.parse(JSON.stringify(DEFAULT_PRINTERS)));
const settings = reactive({ ...DEFAULT_SETTINGS });
const platforms = reactive(JSON.parse(JSON.stringify(DEFAULT_PLATFORMS)));
const savedQuotes = reactive([]);
const manualSalePrice = reactive({});
const activeJob = reactive({
  id: "job-active",
  title: "Suporte Articulado para Fone & Celular",
  clientName: "Cliente Balcão / Exemplo",
  printerId: "p-1",
  filaments: [
    { filamentId: "f-1", grams: 95 }
  ],
  printTimeHours: 4,
  printTimeMinutes: 30,
  prepTimeMinutes: 20,
  customFailureRate: void 0,
  customProfitMargin: void 0,
  packagingCost: 4.5,
  hardwareCost: 2,
  notes: "Preenchimento 20% Gyroid, 3 paredes, suporte orgânico.",
  createdAt: (/* @__PURE__ */ new Date()).toISOString()
});
const initStore = () => {
  return;
};
const triggerCloudSync = () => {
  return;
};
const saveSettings = () => {
};
const loadUserSpecificData = async (uid) => {
  try {
    const { loadUserCloudData, saveUserCloudData } = useFirebase();
    const cloudData = await loadUserCloudData(uid);
    if (cloudData) {
      if (Array.isArray(cloudData.filaments)) {
        filaments.splice(0, filaments.length, ...cloudData.filaments);
      }
      if (Array.isArray(cloudData.printers)) {
        printers.splice(0, printers.length, ...cloudData.printers);
      }
      if (Array.isArray(cloudData.platforms)) {
        platforms.splice(0, platforms.length, ...cloudData.platforms);
      }
      if (cloudData.settings) {
        Object.assign(settings, cloudData.settings);
      }
      if (Array.isArray(cloudData.quotes)) {
        savedQuotes.splice(0, savedQuotes.length, ...cloudData.quotes);
      }
    } else {
      await saveUserCloudData({
        filaments,
        printers,
        platforms,
        settings,
        quotes: savedQuotes
      });
    }
    if (!printers.some((p) => p.id === activeJob.printerId) && printers.length > 0) {
      activeJob.printerId = printers[0].id;
    }
    if (activeJob.filaments.length > 0 && !filaments.some((f) => f.id === activeJob.filaments[0].filamentId) && filaments.length > 0) {
      activeJob.filaments[0].filamentId = filaments[0].id;
    }
  } catch (err) {
    console.error("Error loading user-specific data from cloud:", err);
  }
};
const resetToGuestData = () => {
};
const use3DStore = () => {
  const getFilamentCostPerGram = (f) => {
    const totalCost = (Number(f.pricePaid) || 0) + (Number(f.shippingCost) || 0);
    const weight = Number(f.spoolWeightG) || 1e3;
    return weight > 0 ? totalCost / weight : 0;
  };
  const jobCostBreakdown = computed(() => {
    const printer = printers.find((p) => p.id === activeJob.printerId) || printers[0] || {
      powerWatts: 150,
      purchaseCost: 2500,
      lifespanHours: 3500,
      maintenancePerHour: 1.2
    };
    let filamentCost = 0;
    let totalGrams = 0;
    for (const item of activeJob.filaments) {
      const f = filaments.find((fil) => fil.id === item.filamentId);
      const grams = Number(item.grams) || 0;
      totalGrams += grams;
      if (f) {
        filamentCost += getFilamentCostPerGram(f) * grams;
      }
    }
    const printHours = (Number(activeJob.printTimeHours) || 0) + (Number(activeJob.printTimeMinutes) || 0) / 60;
    const energyCost = (printer.powerWatts || 150) / 1e3 * printHours * (Number(settings.electricityCostPerKwh) || 0.92);
    const depreciationPerHour = (printer.purchaseCost || 0) / Math.max(printer.lifespanHours || 3e3, 1);
    const depreciationCost = depreciationPerHour * printHours;
    const maintenanceCost = (Number(printer.maintenancePerHour) || 0) * printHours;
    const prepHours = (Number(activeJob.prepTimeMinutes) || 0) / 60;
    const laborCost = prepHours * (Number(settings.hourlyLaborRate) || 35);
    const packagingCost = Number(activeJob.packagingCost) || 0;
    const hardwareCost = Number(activeJob.hardwareCost) || 0;
    const subtotal = filamentCost + energyCost + depreciationCost + maintenanceCost + laborCost + packagingCost + hardwareCost;
    const failurePercent = activeJob.customFailureRate !== void 0 ? Number(activeJob.customFailureRate) : Number(settings.defaultFailureRate || 8);
    const failureRiskCost = subtotal * (failurePercent / 100);
    const totalProductionCost = subtotal + failureRiskCost;
    const profitMarginPercent = activeJob.customProfitMargin !== void 0 ? Number(activeJob.customProfitMargin) : Number(settings.defaultProfitMargin || 65);
    const directProfit = totalProductionCost * (profitMarginPercent / 100);
    const recommendedDirectPrice = totalProductionCost + directProfit;
    const directMarginPercent = recommendedDirectPrice > 0 ? directProfit / recommendedDirectPrice * 100 : 0;
    return {
      filamentCost,
      energyCost,
      depreciationCost,
      maintenanceCost,
      laborCost,
      packagingCost,
      hardwareCost,
      failureRiskCost,
      totalProductionCost,
      recommendedDirectPrice,
      directProfit,
      directMarginPercent,
      totalGrams,
      totalPrintHours: printHours
    };
  });
  const solvePlatformPrice = (productionCost, targetProfit, platform, taxRatePercent) => {
    const comRate = (Number(platform.commissionPercent) || 0) / 100;
    const payRate = (Number(platform.paymentProcessingPercent) || 0) / 100;
    const taxRate = (Number(taxRatePercent) || 0) / 100;
    const totalPercentageDeduction = comRate + payRate + taxRate;
    if (totalPercentageDeduction >= 0.98) {
      return (productionCost + targetProfit) * 2;
    }
    const divisor = 1 - totalPercentageDeduction;
    const fixedFee = Number(platform.fixedFee) || 0;
    const priceWithFixed = (productionCost + targetProfit + fixedFee) / divisor;
    const shippingFee = Number(platform.freeShippingCost) || 0;
    const priceWithShipping = (productionCost + targetProfit + shippingFee) / divisor;
    Number(platform.fixedFeeThreshold) || 99999;
    const shipThreshold = Number(platform.freeShippingThreshold) || 99999;
    if (platform.fixedFeeThreshold > 0 && platform.fixedFeeThreshold < 99999) {
      if (priceWithFixed < platform.fixedFeeThreshold) {
        return Math.max(priceWithFixed, 5);
      } else {
        return Math.max(priceWithShipping, 5);
      }
    }
    return Math.max((productionCost + targetProfit + fixedFee + (priceWithShipping >= shipThreshold ? shippingFee : 0)) / divisor, 5);
  };
  const simulatePlatformDetail = (platform, salePrice, productionCost) => {
    const price = Math.max(Number(salePrice) || 0, 0);
    const comPercent = Number(platform.commissionPercent) || 0;
    const payPercent = Number(platform.paymentProcessingPercent) || 0;
    const taxPercent = Number(settings.taxRatePercent) || 0;
    const commissionAmount = price * (comPercent / 100);
    const paymentProcessingAmount = price * (payPercent / 100);
    let fixedFeeAmount = 0;
    if (price > 0) {
      if (!platform.fixedFeeThreshold || platform.fixedFeeThreshold >= 99999) {
        fixedFeeAmount = Number(platform.fixedFee) || 0;
      } else if (price < platform.fixedFeeThreshold) {
        fixedFeeAmount = Number(platform.fixedFee) || 0;
      }
    }
    let shippingSubsidyAmount = 0;
    const isAboveThreshold = platform.freeShippingThreshold > 0 && price >= platform.freeShippingThreshold;
    if (isAboveThreshold && platform.freeShippingCost > 0) {
      shippingSubsidyAmount = Number(platform.freeShippingCost) || 0;
    }
    const taxAmount = price * (taxPercent / 100);
    const totalFees = commissionAmount + paymentProcessingAmount + fixedFeeAmount + shippingSubsidyAmount + taxAmount;
    const netRevenue = Math.max(price - totalFees, 0);
    const netProfit = netRevenue - productionCost;
    const netProfitMarginPercent = price > 0 ? netProfit / price * 100 : 0;
    return {
      platformId: platform.id,
      platformName: platform.name,
      category: platform.category,
      badgeColor: platform.badgeColor,
      recommendedPrice: 0,
      salePriceToSimulate: price,
      commissionAmount: commissionAmount + paymentProcessingAmount,
      fixedFeeAmount,
      shippingSubsidyAmount,
      taxAmount,
      totalFees,
      netRevenue,
      netProfit,
      netProfitMarginPercent,
      isAboveThreshold
    };
  };
  const platformSimulations = computed(() => {
    const breakdown = jobCostBreakdown.value;
    const targetProfit = breakdown.directProfit;
    const cost = breakdown.totalProductionCost;
    return platforms.filter((p) => p.enabled).map((platform) => {
      const recommended = solvePlatformPrice(cost, targetProfit, platform, settings.taxRatePercent);
      const currentSimPrice = manualSalePrice[platform.id] !== void 0 ? manualSalePrice[platform.id] : recommended;
      const sim = simulatePlatformDetail(platform, currentSimPrice, cost);
      sim.recommendedPrice = recommended;
      return sim;
    });
  });
  const addFilament = (filament) => {
    const newFilament = {
      ...filament,
      id: "f-" + Date.now()
    };
    filaments.unshift(newFilament);
    return newFilament;
  };
  const updateFilament = (id, updated) => {
    const index = filaments.findIndex((f) => f.id === id);
    if (index !== -1) {
      Object.assign(filaments[index], updated);
    }
  };
  const deleteFilament = (id) => {
    const index = filaments.findIndex((f) => f.id === id);
    if (index !== -1) {
      filaments.splice(index, 1);
    }
  };
  const addPrinter = (printer) => {
    const newPrinter = {
      ...printer,
      id: "p-" + Date.now()
    };
    printers.push(newPrinter);
    return newPrinter;
  };
  const updatePrinter = (id, updated) => {
    const index = printers.findIndex((p) => p.id === id);
    if (index !== -1) {
      Object.assign(printers[index], updated);
    }
  };
  const deletePrinter = (id) => {
    if (printers.length <= 1) return;
    const index = printers.findIndex((p) => p.id === id);
    if (index !== -1) {
      printers.splice(index, 1);
    }
  };
  const addPlatform = (platform) => {
    const newPlatform = {
      ...platform,
      id: "plat-" + Date.now()
    };
    platforms.push(newPlatform);
    return newPlatform;
  };
  const updatePlatform = (id, updated) => {
    const index = platforms.findIndex((p) => p.id === id);
    if (index !== -1) {
      Object.assign(platforms[index], updated);
    }
  };
  const deletePlatform = (id) => {
    const index = platforms.findIndex((p) => p.id === id);
    if (index !== -1) {
      platforms.splice(index, 1);
    }
  };
  const resetPlatformsToDefault = () => {
    platforms.splice(0, platforms.length, ...JSON.parse(JSON.stringify(DEFAULT_PLATFORMS)));
  };
  const resetFilamentsToDefault = () => {
    filaments.splice(0, filaments.length, ...JSON.parse(JSON.stringify(DEFAULT_FILAMENTS)));
  };
  const resetPrintersToDefault = () => {
    printers.splice(0, printers.length, ...JSON.parse(JSON.stringify(DEFAULT_PRINTERS)));
  };
  const saveCurrentQuote = (selectedPlatformName, finalPrice, finalProfit) => {
    const quote = {
      ...JSON.parse(JSON.stringify(activeJob)),
      id: "quote-" + Date.now(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      breakdown: JSON.parse(JSON.stringify(jobCostBreakdown.value)),
      selectedPlatformPrice: selectedPlatformName && finalPrice ? {
        platformName: selectedPlatformName,
        price: finalPrice,
        profit: finalProfit || 0
      } : void 0
    };
    savedQuotes.unshift(quote);
    return quote;
  };
  const deleteQuote = (quoteId) => {
    const index = savedQuotes.findIndex((q) => q.id === quoteId);
    if (index !== -1) {
      savedQuotes.splice(index, 1);
    }
  };
  const loadQuoteIntoActive = (quote) => {
    activeJob.title = quote.title;
    activeJob.clientName = quote.clientName || "";
    activeJob.printerId = quote.printerId;
    activeJob.filaments = JSON.parse(JSON.stringify(quote.filaments));
    activeJob.printTimeHours = quote.printTimeHours;
    activeJob.printTimeMinutes = quote.printTimeMinutes;
    activeJob.prepTimeMinutes = quote.prepTimeMinutes;
    activeJob.packagingCost = quote.packagingCost;
    activeJob.hardwareCost = quote.hardwareCost;
    activeJob.notes = quote.notes || "";
    if (quote.customFailureRate !== void 0) activeJob.customFailureRate = quote.customFailureRate;
    if (quote.customProfitMargin !== void 0) activeJob.customProfitMargin = quote.customProfitMargin;
  };
  return {
    filaments,
    printers,
    settings,
    platforms,
    savedQuotes,
    activeJob,
    manualSalePrice,
    jobCostBreakdown,
    platformSimulations,
    initStore,
    getFilamentCostPerGram,
    solvePlatformPrice,
    simulatePlatformDetail,
    // CRUD
    addFilament,
    updateFilament,
    deleteFilament,
    resetFilamentsToDefault,
    addPrinter,
    updatePrinter,
    deletePrinter,
    resetPrintersToDefault,
    addPlatform,
    updatePlatform,
    deletePlatform,
    resetPlatformsToDefault,
    saveSettings,
    saveCurrentQuote,
    deleteQuote,
    loadQuoteIntoActive,
    loadUserSpecificData,
    resetToGuestData,
    triggerCloudSync
  };
};
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "PrintJobCalculator",
  __ssrInlineRender: true,
  emits: ["save-quote", "view-proposal"],
  setup(__props) {
    const {
      activeJob: activeJob2,
      printers: printers2,
      filaments: filaments2,
      settings: settings2,
      jobCostBreakdown,
      getFilamentCostPerGram
    } = use3DStore();
    const selectedPrinter = computed(() => {
      return printers2.find((p) => p.id === activeJob2.printerId) || printers2[0];
    });
    const currentFailureRate = computed(() => {
      return activeJob2.customFailureRate !== void 0 ? activeJob2.customFailureRate : settings2.defaultFailureRate;
    });
    const currentProfitMargin = computed(() => {
      return activeJob2.customProfitMargin !== void 0 ? activeJob2.customProfitMargin : settings2.defaultProfitMargin;
    });
    const getFilamentColor = (id) => {
      const f = filaments2.find((fil) => fil.id === id);
      return f ? f.color : "#ffffff";
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "calculator-container" }, _attrs))}><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1.15fr 0.85fr", "gap": "1.5rem", "align-items": "start" })}"><div class="card card-glass"><div class="card-header"><div class="card-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg><span>Dados da Impressão 3D</span></div><span class="badge badge-cyan">Orçamento Ativo</span></div><form><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1.2fr 0.8fr", "gap": "1rem", "margin-bottom": "1.25rem" })}"><div class="form-group" style="${ssrRenderStyle({ "margin-bottom": "0" })}"><label class="form-label" for="job-title">Nome da Peça / Projeto</label><input id="job-title"${ssrRenderAttr("value", unref(activeJob2).title)} type="text" class="input-control" placeholder="Ex: Luminária Articulada Lua"></div><div class="form-group" style="${ssrRenderStyle({ "margin-bottom": "0" })}"><label class="form-label" for="job-client">Cliente (Opcional)</label><input id="job-client"${ssrRenderAttr("value", unref(activeJob2).clientName)} type="text" class="input-control" placeholder="Ex: Ana Clara ou Shopee"></div></div><div class="form-group"><div class="form-label"><label for="job-printer">Impressora 3D Utilizada</label>`);
      if (selectedPrinter.value) {
        _push(`<span style="${ssrRenderStyle({ "font-size": "0.75rem", "color": "var(--brand-cyan)", "font-family": "var(--font-mono)" })}">${ssrInterpolate(selectedPrinter.value.powerWatts)}W • Depreciação: R$ ${ssrInterpolate(((selectedPrinter.value.purchaseCost || 0) / Math.max(selectedPrinter.value.lifespanHours || 3e3, 1)).toFixed(2))}/h </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><select id="job-printer" class="input-control"><!--[-->`);
      ssrRenderList(unref(printers2), (pr) => {
        _push(`<option${ssrRenderAttr("value", pr.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(activeJob2).printerId) ? ssrLooseContain(unref(activeJob2).printerId, pr.id) : ssrLooseEqual(unref(activeJob2).printerId, pr.id)) ? " selected" : ""}>${ssrInterpolate(pr.name)} (${ssrInterpolate(pr.brand)} - ${ssrInterpolate(pr.model)} • ${ssrInterpolate(pr.powerWatts)}W) </option>`);
      });
      _push(`<!--]--></select></div><div style="${ssrRenderStyle({ "margin-bottom": "1.25rem", "background": "rgba(0, 0, 0, 0.2)", "border-radius": "var(--radius-md)", "padding": "1rem", "border": "1px solid var(--border-subtle)" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "0.75rem" })}"><label class="form-label" style="${ssrRenderStyle({ "margin-bottom": "0" })}"><span style="${ssrRenderStyle({ "font-weight": "700", "color": "var(--text-main)" })}">Filamento(s) &amp; Peso Gasto</span><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)" })}">(Suporta multimaterial/AMS)</span></label><button id="btn-add-filament-job" type="button" class="btn btn-secondary btn-sm" style="${ssrRenderStyle({ "font-size": "0.75rem", "padding": "0.25rem 0.6rem" })}"> + Adicionar Outra Cor / Material </button></div><!--[-->`);
      ssrRenderList(unref(activeJob2).filaments, (fItem, index) => {
        _push(`<div style="${ssrRenderStyle({ "display": "flex", "gap": "0.75rem", "align-items": "center", "margin-bottom": "0.65rem" })}"><div style="${ssrRenderStyle({ "flex": "1.5" })}"><select class="input-control"><!--[-->`);
        ssrRenderList(unref(filaments2), (fil) => {
          _push(`<option${ssrRenderAttr("value", fil.id)}${ssrIncludeBooleanAttr(Array.isArray(fItem.filamentId) ? ssrLooseContain(fItem.filamentId, fil.id) : ssrLooseEqual(fItem.filamentId, fil.id)) ? " selected" : ""}>${ssrInterpolate(fil.name)} (${ssrInterpolate(fil.material)} - R$ ${ssrInterpolate(unref(getFilamentCostPerGram)(fil).toFixed(3))}/g) </option>`);
        });
        _push(`<!--]--></select></div><div style="${ssrRenderStyle({ "flex": "1" })}" class="input-prefix-box"><input${ssrRenderAttr("id", `job-filament-grams-${index}`)}${ssrRenderAttr("value", fItem.grams)} type="number" class="input-control font-mono" min="1" step="1" placeholder="Gramas"><span class="input-prefix-tag">g</span></div><span class="filament-swatch" style="${ssrRenderStyle({ backgroundColor: getFilamentColor(fItem.filamentId) })}" title="Cor do filamento"></span>`);
        if (unref(activeJob2).filaments.length > 1) {
          _push(`<button type="button" class="btn btn-danger btn-icon btn-sm" style="${ssrRenderStyle({ "width": "32px", "height": "32px" })}"> ✕ </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "font-size": "0.775rem", "color": "var(--text-muted)", "padding-top": "0.35rem" })}"><span>Total de filamento: <strong class="font-mono text-gradient">${ssrInterpolate(unref(jobCostBreakdown).totalGrams)}g</strong></span><span>Custo total filamento: <strong class="font-mono text-gradient-cyan">R$ ${ssrInterpolate(unref(jobCostBreakdown).filamentCost.toFixed(2))}</strong></span></div></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr", "gap": "1rem", "margin-bottom": "1.25rem" })}"><div class="form-group" style="${ssrRenderStyle({ "margin-bottom": "0" })}"><label class="form-label" for="job-time-hours">Tempo de Impressão na Máquina</label><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.5rem" })}"><div class="input-prefix-box" style="${ssrRenderStyle({ "flex": "1" })}"><input id="job-time-hours"${ssrRenderAttr("value", unref(activeJob2).printTimeHours)} type="number" class="input-control font-mono" min="0" step="1"><span class="input-prefix-tag">h</span></div><div class="input-prefix-box" style="${ssrRenderStyle({ "flex": "1" })}"><input id="job-time-minutes"${ssrRenderAttr("value", unref(activeJob2).printTimeMinutes)} type="number" class="input-control font-mono" min="0" max="59" step="5"><span class="input-prefix-tag">min</span></div></div></div><div class="form-group" style="${ssrRenderStyle({ "margin-bottom": "0" })}"><label class="form-label" for="job-prep-minutes"><span>Trabalho Manual (Pós-processo)</span></label><div class="input-prefix-box"><input id="job-prep-minutes"${ssrRenderAttr("value", unref(activeJob2).prepTimeMinutes)} type="number" class="input-control font-mono" min="0" step="5"><span class="input-prefix-tag">minutos</span></div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)" })}">Fatiar, arrancar suportes, lixar, embalar</span></div></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr", "gap": "1rem", "margin-bottom": "1.25rem" })}"><div class="form-group" style="${ssrRenderStyle({ "margin-bottom": "0" })}"><label class="form-label" for="job-packaging">Embalagem (Caixa, Plástico)</label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="job-packaging"${ssrRenderAttr("value", unref(activeJob2).packagingCost)} type="number" class="input-control font-mono" min="0" step="0.5"></div></div><div class="form-group" style="${ssrRenderStyle({ "margin-bottom": "0" })}"><label class="form-label" for="job-hardware">Insumos Extras (Ímãs, Parafusos)</label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="job-hardware"${ssrRenderAttr("value", unref(activeJob2).hardwareCost)} type="number" class="input-control font-mono" min="0" step="0.5"></div></div></div><div style="${ssrRenderStyle({ "background": "rgba(255, 255, 255, 0.02)", "border-radius": "var(--radius-md)", "padding": "1rem", "border": "1px solid var(--border-subtle)", "display": "flex", "flex-direction": "column", "gap": "1rem", "margin-bottom": "1.25rem" })}"><div class="form-group" style="${ssrRenderStyle({ "margin-bottom": "0" })}"><div class="form-label"><span>Margem de Risco / Falha da Peça</span><span class="font-mono text-gradient-amber" style="${ssrRenderStyle({ "font-weight": "700" })}">${ssrInterpolate(currentFailureRate.value)}%</span></div><input id="job-slider-failure"${ssrRenderAttr("value", unref(activeJob2).customFailureRate)} type="range" class="range-input" min="0" max="25" step="1"></div><div class="form-group" style="${ssrRenderStyle({ "margin-bottom": "0" })}"><div class="form-label"><span>Margem de Lucro Alvo Desejada (Markup)</span><span class="font-mono text-gradient-emerald" style="${ssrRenderStyle({ "font-weight": "800", "font-size": "1.05rem" })}">${ssrInterpolate(currentProfitMargin.value)}%</span></div><input id="job-slider-profit"${ssrRenderAttr("value", unref(activeJob2).customProfitMargin)} type="range" class="range-input" min="10" max="250" step="5"><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)" })}"> O simulador garantirá que você receba líquido exatamente este percentual de lucro sobre o custo de produção, mesmo pagando as taxas das plataformas. </span></div></div><div class="form-group"><label class="form-label" for="job-notes">Observações do Orçamento</label><textarea id="job-notes" rows="2" class="input-control" placeholder="Ex: Altura de camada 0.20mm, 3 perímetros, 15% preenchimento gyroid...">${ssrInterpolate(unref(activeJob2).notes)}</textarea></div></form></div><div style="${ssrRenderStyle({ "display": "flex", "flex-direction": "column", "gap": "1.25rem", "position": "sticky", "top": "5rem" })}"><div class="card card-glass" style="${ssrRenderStyle({ "border": "1px solid rgba(0, 240, 255, 0.25)", "box-shadow": "0 0 25px rgba(0, 240, 255, 0.08)" })}"><div class="card-header"><div class="card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg><span>Composição Detalhada de Custo</span></div><span class="badge badge-cyan">${ssrInterpolate(unref(jobCostBreakdown).totalPrintHours.toFixed(1))}h máquina</span></div><div class="fee-breakdown-list"><div class="fee-item"><span>🧵 Filamento (${ssrInterpolate(unref(jobCostBreakdown).totalGrams)}g)</span><span class="font-mono" style="${ssrRenderStyle({ "font-weight": "600", "color": "var(--text-main)" })}">R$ ${ssrInterpolate(unref(jobCostBreakdown).filamentCost.toFixed(2))}</span></div><div class="fee-item"><span>⚡ Energia Elétrica</span><span class="font-mono">R$ ${ssrInterpolate(unref(jobCostBreakdown).energyCost.toFixed(2))}</span></div><div class="fee-item"><span>🖨️ Depreciação da Impressora</span><span class="font-mono">R$ ${ssrInterpolate(unref(jobCostBreakdown).depreciationCost.toFixed(2))}</span></div><div class="fee-item"><span>🔧 Manutenção &amp; Bico / Nozzle</span><span class="font-mono">R$ ${ssrInterpolate(unref(jobCostBreakdown).maintenanceCost.toFixed(2))}</span></div><div class="fee-item"><span>⏱️ Mão de Obra Técnica (${ssrInterpolate(unref(activeJob2).prepTimeMinutes)} min)</span><span class="font-mono">R$ ${ssrInterpolate(unref(jobCostBreakdown).laborCost.toFixed(2))}</span></div><div class="fee-item"><span>📦 Embalagem &amp; Insumos Extras</span><span class="font-mono">R$ ${ssrInterpolate((unref(jobCostBreakdown).packagingCost + unref(jobCostBreakdown).hardwareCost).toFixed(2))}</span></div><div class="fee-item"><span>⚠️ Margem de Risco / Falha (${ssrInterpolate(currentFailureRate.value)}%)</span><span class="font-mono" style="${ssrRenderStyle({ "color": "var(--brand-amber)" })}">R$ ${ssrInterpolate(unref(jobCostBreakdown).failureRiskCost.toFixed(2))}</span></div><div class="fee-item total" style="${ssrRenderStyle({ "font-size": "0.95rem" })}"><span style="${ssrRenderStyle({ "font-weight": "700", "color": "var(--text-main)" })}">Custo Base de Fabricação</span><span class="font-mono" style="${ssrRenderStyle({ "font-size": "1.2rem", "font-weight": "800", "color": "var(--brand-rose)" })}"> R$ ${ssrInterpolate(unref(jobCostBreakdown).totalProductionCost.toFixed(2))}</span></div></div><div style="${ssrRenderStyle({ "background": "rgba(16, 185, 129, 0.08)", "border": "1px solid rgba(16, 185, 129, 0.25)", "border-radius": "var(--radius-md)", "padding": "1.15rem", "margin-bottom": "1rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "baseline", "margin-bottom": "0.4rem" })}"><span style="${ssrRenderStyle({ "font-size": "0.8rem", "text-transform": "uppercase", "color": "var(--brand-emerald)", "font-weight": "700" })}"> Preço Direto Sugerido (PIX / Dinheiro) </span><span class="badge badge-emerald">+${ssrInterpolate(currentProfitMargin.value)}% Lucro</span></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "baseline" })}"><div class="font-mono" style="${ssrRenderStyle({ "font-size": "2rem", "font-weight": "800", "color": "var(--brand-emerald)", "line-height": "1" })}"> R$ ${ssrInterpolate(unref(jobCostBreakdown).recommendedDirectPrice.toFixed(2))}</div><div style="${ssrRenderStyle({ "text-align": "right", "font-size": "0.825rem", "color": "var(--text-muted)" })}"> Lucro Líquido: <strong class="font-mono" style="${ssrRenderStyle({ "color": "var(--brand-emerald)" })}">R$ ${ssrInterpolate(unref(jobCostBreakdown).directProfit.toFixed(2))}</strong></div></div><div style="${ssrRenderStyle({ "font-size": "0.75rem", "color": "var(--text-dim)", "margin-top": "0.35rem" })}"> Preço para venda direta ao cliente sem descontos de plataformas de marketplace. </div></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.75rem", "flex-wrap": "wrap" })}"><button id="btn-save-quote" class="btn btn-primary" style="${ssrRenderStyle({ "flex": "1" })}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>Salvar Orçamento</span></button><button id="btn-view-proposal" class="btn btn-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg><span>Ver Proposta</span></button></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PrintJobCalculator.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "PlatformSimulator",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      platformSimulations,
      manualSalePrice: manualSalePrice2,
      jobCostBreakdown,
      settings: settings2
    } = use3DStore();
    const copied = ref(false);
    const sortedSimulations = computed(() => {
      return [...platformSimulations.value].sort((a, b) => b.netProfit - a.netProfit);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "platform-simulator-container",
        style: { "margin-top": "2rem" }
      }, _attrs))}><div class="card card-glass" style="${ssrRenderStyle({ "margin-bottom": "1.5rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "center", "flex-wrap": "wrap", "gap": "1rem" })}"><div><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "0.6rem", "margin-bottom": "0.25rem" })}"><span class="badge badge-emerald">Simulador Inteligente</span><span style="${ssrRenderStyle({ "font-size": "0.8rem", "color": "var(--text-dim)" })}">Fórmula Reversa de Markup &amp; Dedução</span></div><h2 style="${ssrRenderStyle({ "font-size": "1.4rem", "font-weight": "800" })}"><span class="text-gradient">Simulador de Vendas em Marketplaces &amp; Canais</span></h2><p class="card-subtitle"> Veja exatamente quanto cobrar no Mercado Livre, Shopee, Elo7 e outros para garantir seu lucro líquido, ou teste qualquer preço de venda e descubra o que realmente sobra na sua conta. </p></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.75rem", "align-items": "center", "flex-wrap": "wrap" })}"><button id="btn-sync-all-recommended" class="btn btn-secondary btn-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg> Restaurar Preços Sugeridos </button><button id="btn-copy-prices-summary" class="btn btn-primary btn-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> ${ssrInterpolate(copied.value ? "Copiado!" : "Copiar Tabela de Preços")}</button></div></div></div><div class="card" style="${ssrRenderStyle({ "margin-bottom": "1.5rem" })}"><div class="card-header"><div class="card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg><span>Comparativo Rápido de Preços &amp; Lucro Líquido</span></div><span style="${ssrRenderStyle({ "font-size": "0.8rem", "color": "var(--text-dim)" })}">Custo de Fabricação Base: <strong class="font-mono text-gradient-rose">R$ ${ssrInterpolate(unref(jobCostBreakdown).totalProductionCost.toFixed(2))}</strong></span></div><div class="table-responsive"><table class="table-custom"><thead><tr><th>Plataforma / Canal</th><th>Preço Sugerido (Alvo)</th><th>Preço Simulado</th><th>Total de Taxas</th><th>% Taxas Efetivas</th><th>Você Recebe Líquido</th><th>Lucro no Bolso</th><th>Margem Líquida</th><th>Status</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(sortedSimulations.value, (sim) => {
        _push(`<tr><td><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "0.5rem", "font-weight": "600" })}"><span class="platform-indicator" style="${ssrRenderStyle({ backgroundColor: sim.badgeColor })}"></span><span>${ssrInterpolate(sim.platformName)}</span></div></td><td><span class="font-mono" style="${ssrRenderStyle({ "font-weight": "700", "color": "var(--brand-cyan)" })}"> R$ ${ssrInterpolate(sim.recommendedPrice.toFixed(2))}</span></td><td><div class="input-prefix-box" style="${ssrRenderStyle({ "max-width": "130px", "height": "34px" })}"><span class="input-prefix-tag" style="${ssrRenderStyle({ "padding": "0.2rem 0.5rem", "font-size": "0.75rem" })}">R$</span><input${ssrRenderAttr("id", `table-price-input-${sim.platformId}`)} type="number" class="input-control font-mono" style="${ssrRenderStyle({ "padding": "0.2rem 0.4rem", "font-size": "0.85rem" })}" step="0.5" min="0"${ssrRenderAttr("value", unref(manualSalePrice2)[sim.platformId] !== void 0 ? unref(manualSalePrice2)[sim.platformId] : Number(sim.recommendedPrice.toFixed(2)))}></div></td><td><span class="font-mono" style="${ssrRenderStyle({ "color": "var(--brand-rose)", "font-weight": "600" })}"> - R$ ${ssrInterpolate(sim.totalFees.toFixed(2))}</span></td><td><span class="font-mono" style="${ssrRenderStyle({ "color": "var(--text-muted)" })}">${ssrInterpolate(sim.salePriceToSimulate > 0 ? (sim.totalFees / sim.salePriceToSimulate * 100).toFixed(1) : "0.0")}% </span></td><td><span class="font-mono" style="${ssrRenderStyle({ "font-weight": "700", "color": "var(--text-main)" })}"> R$ ${ssrInterpolate(sim.netRevenue.toFixed(2))}</span></td><td><span class="font-mono" style="${ssrRenderStyle([{ "font-weight": "800", "font-size": "1rem" }, { color: sim.netProfit > 0 ? "var(--brand-emerald)" : "var(--brand-rose)" }])}"> R$ ${ssrInterpolate(sim.netProfit.toFixed(2))}</span></td><td><span class="font-mono" style="${ssrRenderStyle([{ "font-weight": "700" }, { color: sim.netProfitMarginPercent >= 30 ? "var(--brand-emerald)" : sim.netProfitMarginPercent > 0 ? "var(--brand-amber)" : "var(--brand-rose)" }])}">${ssrInterpolate(sim.netProfitMarginPercent.toFixed(1))}% </span></td><td><span class="${ssrRenderClass([sim.netProfit >= unref(jobCostBreakdown).directProfit * 0.95 ? "badge-emerald" : sim.netProfit > 0 ? "badge-amber" : "badge-rose", "badge"])}">${ssrInterpolate(sim.netProfit >= unref(jobCostBreakdown).directProfit * 0.95 ? "Ideal" : sim.netProfit > 0 ? "Moderado" : "Prejuízo")}</span></td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></div><div class="platform-grid"><!--[-->`);
      ssrRenderList(unref(platformSimulations), (sim) => {
        _push(`<div class="platform-card" style="${ssrRenderStyle({ borderTop: `4px solid ${sim.badgeColor || "var(--brand-cyan)"}` })}"><div class="platform-card-header"><div class="platform-logo-title"><span class="platform-indicator" style="${ssrRenderStyle({ backgroundColor: sim.badgeColor })}"></span><span>${ssrInterpolate(sim.platformName)}</span></div><span class="${ssrRenderClass([sim.netProfit >= unref(jobCostBreakdown).directProfit * 0.95 ? "badge-emerald" : sim.netProfit > 0 ? "badge-amber" : "badge-rose", "badge"])}">${ssrInterpolate(sim.netProfit >= unref(jobCostBreakdown).directProfit * 0.95 ? "Lucro Alvo" : sim.netProfit > 0 ? "Lucro Abaixo" : "Prejuízo")}</span></div><div class="price-display-box"><div><div style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-muted)", "text-transform": "uppercase", "font-weight": "600" })}"> Preço Sugerido (Alvo) </div><div class="font-mono" style="${ssrRenderStyle({ "font-size": "1.35rem", "font-weight": "800", "color": "var(--brand-cyan)" })}"> R$ ${ssrInterpolate(sim.recommendedPrice.toFixed(2))}</div></div><button type="button" class="btn btn-secondary btn-sm" style="${ssrRenderStyle({ "font-size": "0.725rem", "padding": "0.25rem 0.5rem" })}" title="Usar o preço sugerido nesta simulação"> Usar Sugerido </button></div><div class="form-group"><label class="form-label"${ssrRenderAttr("for", `input-sim-price-${sim.platformId}`)}><span>Simular Preço de Venda do Anúncio</span><span class="font-mono" style="${ssrRenderStyle({ "color": "var(--brand-cyan)", "font-weight": "700" })}">R$ ${ssrInterpolate(sim.salePriceToSimulate.toFixed(2))}</span></label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input${ssrRenderAttr("id", `input-sim-price-${sim.platformId}`)} type="number" class="input-control font-mono" step="0.5" min="1"${ssrRenderAttr("value", unref(manualSalePrice2)[sim.platformId] !== void 0 ? unref(manualSalePrice2)[sim.platformId] : Number(sim.recommendedPrice.toFixed(2)))}></div></div><div class="fee-breakdown-list"><div class="fee-item"><span>Comissão da Plataforma</span><span class="font-mono">- R$ ${ssrInterpolate(sim.commissionAmount.toFixed(2))}</span></div>`);
        if (sim.fixedFeeAmount > 0) {
          _push(`<div class="fee-item"><span>Taxa Fixa por Item</span><span class="font-mono">- R$ ${ssrInterpolate(sim.fixedFeeAmount.toFixed(2))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (sim.shippingSubsidyAmount > 0) {
          _push(`<div class="fee-item"><span>Coparticipação Frete Grátis</span><span class="font-mono" style="${ssrRenderStyle({ "color": "var(--brand-amber)" })}">- R$ ${ssrInterpolate(sim.shippingSubsidyAmount.toFixed(2))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="fee-item"><span>Imposto de Nota (${ssrInterpolate(unref(settings2).taxRatePercent)}%)</span><span class="font-mono">- R$ ${ssrInterpolate(sim.taxAmount.toFixed(2))}</span></div><div class="fee-item total"><span>Total de Descontos (${ssrInterpolate(sim.salePriceToSimulate > 0 ? (sim.totalFees / sim.salePriceToSimulate * 100).toFixed(1) : 0)}%)</span><span class="font-mono" style="${ssrRenderStyle({ "color": "var(--brand-rose)", "font-weight": "700" })}">- R$ ${ssrInterpolate(sim.totalFees.toFixed(2))}</span></div></div><div class="profit-summary-box" style="${ssrRenderStyle({ backgroundColor: sim.netProfit > 0 ? "rgba(16, 185, 129, 0.08)" : "rgba(244, 63, 94, 0.08)", borderColor: sim.netProfit > 0 ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)" })}"><div><div style="${ssrRenderStyle({ "font-size": "0.725rem", "text-transform": "uppercase", "color": "var(--text-muted)", "font-weight": "600" })}"> Lucro Líquido Real </div><div class="font-mono" style="${ssrRenderStyle([{ "font-size": "1.4rem", "font-weight": "800", "line-height": "1.1" }, { color: sim.netProfit > 0 ? "var(--brand-emerald)" : "var(--brand-rose)" }])}"> R$ ${ssrInterpolate(sim.netProfit.toFixed(2))}</div><div style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)", "margin-top": "0.2rem" })}"> Entra na conta: <strong class="font-mono" style="${ssrRenderStyle({ "color": "var(--text-main)" })}">R$ ${ssrInterpolate(sim.netRevenue.toFixed(2))}</strong></div></div><div style="${ssrRenderStyle({ "text-align": "right" })}"><span class="${ssrRenderClass([sim.netProfitMarginPercent >= 25 ? "badge-emerald" : sim.netProfitMarginPercent > 0 ? "badge-amber" : "badge-rose", "badge"])}">${ssrInterpolate(sim.netProfitMarginPercent.toFixed(1))}% Margem </span><div style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)", "margin-top": "0.35rem" })}"> sobre o valor anunciado </div></div></div></div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PlatformSimulator.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "FilamentManager",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      filaments: filaments2,
      getFilamentCostPerGram
    } = use3DStore();
    const searchQuery = ref("");
    const selectedMaterialFilter = ref("Todos");
    const materialFilters = ["Todos", "PLA", "PETG", "ABS", "TPU", "PLA Silk"];
    const isModalOpen = ref(false);
    const isEditing = ref(false);
    ref("");
    const defaultForm = {
      name: "",
      brand: "",
      material: "PLA",
      color: "#ffffff",
      colorName: "Branco",
      diameter: 1.75,
      spoolWeightG: 1e3,
      pricePaid: 110,
      shippingCost: 0,
      remainingG: 1e3,
      density: 1.24,
      notes: ""
    };
    const form = reactive({ ...defaultForm });
    const formPreviewCostPerGram = computed(() => {
      const total = (Number(form.pricePaid) || 0) + (Number(form.shippingCost) || 0);
      const weight = Number(form.spoolWeightG) || 1e3;
      return weight > 0 ? total / weight : 0;
    });
    const averageCostPerGram = computed(() => {
      if (filaments2.length === 0) return 0;
      const sum = filaments2.reduce((acc, f) => acc + getFilamentCostPerGram(f), 0);
      return sum / filaments2.length;
    });
    const totalRemainingG = computed(() => {
      return filaments2.reduce((acc, f) => acc + (Number(f.remainingG) || 0), 0);
    });
    const totalInventoryValue = computed(() => {
      return filaments2.reduce((acc, f) => {
        const costPerG = getFilamentCostPerGram(f);
        return acc + costPerG * (Number(f.remainingG) || 0);
      }, 0);
    });
    const filteredFilaments = computed(() => {
      return filaments2.filter((f) => {
        const matchesSearch = searchQuery.value === "" || f.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || f.brand.toLowerCase().includes(searchQuery.value.toLowerCase()) || f.colorName.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesMat = selectedMaterialFilter.value === "Todos" || f.material === selectedMaterialFilter.value;
        return matchesSearch && matchesMat;
      });
    });
    const getMaterialBadgeClass = (mat) => {
      switch (mat) {
        case "PLA":
          return "badge-cyan";
        case "PLA Silk":
          return "badge-amber";
        case "PETG":
          return "badge-emerald";
        case "ABS":
          return "badge-rose";
        case "TPU":
          return "badge-cyan";
        default:
          return "badge-cyan";
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "filament-manager-section" }, _attrs))}><div class="card card-glass" style="${ssrRenderStyle({ "margin-bottom": "1.5rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "center", "flex-wrap": "wrap", "gap": "1rem" })}"><div><h2 style="${ssrRenderStyle({ "font-size": "1.4rem", "font-weight": "800", "display": "flex", "align-items": "center", "gap": "0.6rem" })}"><span class="text-gradient">Estoque &amp; Configuração de Filamentos</span></h2><p class="card-subtitle"> Cadastre os carretéis adquiridos, preços de compra e fretes. O custo por grama (R$/g) é calculado e sincronizado automaticamente na calculadora de impressões. </p></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.75rem", "flex-wrap": "wrap" })}"><button id="btn-reset-filaments" class="btn btn-secondary btn-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg> Padrões de Fábrica </button><button id="btn-add-filament-open" class="btn btn-primary btn-sm"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Novo Filamento </button></div></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "1rem", "margin-top": "1.25rem", "flex-wrap": "wrap", "align-items": "center" })}"><div style="${ssrRenderStyle({ "flex": "1", "min-width": "240px" })}" class="input-prefix-box"><span class="input-prefix-tag"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span><input id="input-search-filament"${ssrRenderAttr("value", searchQuery.value)} type="text" class="input-control" placeholder="Buscar por nome, marca ou cor..."></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.35rem", "flex-wrap": "wrap" })}"><!--[-->`);
      ssrRenderList(materialFilters, (mat) => {
        _push(`<button class="${ssrRenderClass([selectedMaterialFilter.value === mat ? "btn-primary" : "btn-secondary", "btn btn-sm"])}">${ssrInterpolate(mat)}</button>`);
      });
      _push(`<!--]--></div></div></div><div class="stat-grid"><div class="stat-card"><span class="stat-label">Total de Carretéis</span><span class="stat-value">${ssrInterpolate(unref(filaments2).length)}</span><span class="stat-subtext">Disponíveis no catálogo</span></div><div class="stat-card emerald"><span class="stat-label">Custo Médio / Grama</span><span class="stat-value font-mono">R$ ${ssrInterpolate(averageCostPerGram.value.toFixed(3))}</span><span class="stat-subtext">~R$ ${ssrInterpolate((averageCostPerGram.value * 1e3).toFixed(2))} por kg</span></div><div class="stat-card amber"><span class="stat-label">Estoque Total Estimado</span><span class="stat-value font-mono">${ssrInterpolate((totalRemainingG.value / 1e3).toFixed(2))} kg</span><span class="stat-subtext">${ssrInterpolate(totalRemainingG.value.toLocaleString())} gramas restantes</span></div><div class="stat-card purple"><span class="stat-label">Patrimônio em Filamentos</span><span class="stat-value font-mono">R$ ${ssrInterpolate(totalInventoryValue.value.toFixed(2))}</span><span class="stat-subtext">Valor de compra estocado</span></div></div><div class="platform-grid" style="${ssrRenderStyle({ "grid-template-columns": "repeat(auto-fill, minmax(320px, 1fr))" })}"><!--[-->`);
      ssrRenderList(filteredFilaments.value, (f) => {
        _push(`<div class="card" style="${ssrRenderStyle({ "display": "flex", "flex-direction": "column", "justify-content": "space-between" })}"><div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "flex-start", "margin-bottom": "0.75rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "0.65rem" })}"><span class="filament-swatch" style="${ssrRenderStyle({ backgroundColor: f.color, boxShadow: `0 0 10px ${f.color}66` })}"></span><div><h3 style="${ssrRenderStyle({ "font-size": "1.05rem", "font-weight": "700", "line-height": "1.2" })}">${ssrInterpolate(f.name)}</h3><span style="${ssrRenderStyle({ "font-size": "0.775rem", "color": "var(--text-dim)" })}">${ssrInterpolate(f.brand)} • ${ssrInterpolate(f.colorName)}</span></div></div><span class="${ssrRenderClass([getMaterialBadgeClass(f.material), "badge"])}">${ssrInterpolate(f.material)}</span></div><div style="${ssrRenderStyle({ "background": "rgba(0, 0, 0, 0.25)", "border-radius": "var(--radius-md)", "padding": "0.85rem", "border": "1px solid var(--border-subtle)", "margin-bottom": "1rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "baseline", "margin-bottom": "0.4rem" })}"><span style="${ssrRenderStyle({ "font-size": "0.75rem", "text-transform": "uppercase", "color": "var(--text-muted)", "font-weight": "600" })}">Custo por Grama</span><span class="font-mono" style="${ssrRenderStyle({ "font-size": "1.25rem", "font-weight": "800", "color": "var(--brand-cyan)" })}"> R$ ${ssrInterpolate(unref(getFilamentCostPerGram)(f).toFixed(4))}<span style="${ssrRenderStyle({ "font-size": "0.75rem", "color": "var(--text-muted)", "font-weight": "400" })}"> /g</span></span></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "font-size": "0.8rem", "color": "var(--text-muted)" })}"><span>Preço Pago: R$ ${ssrInterpolate(f.pricePaid.toFixed(2))}</span><span>Frete: +R$ ${ssrInterpolate(f.shippingCost.toFixed(2))}</span></div></div><div style="${ssrRenderStyle({ "margin-bottom": "1rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "font-size": "0.78rem", "margin-bottom": "0.35rem" })}"><span style="${ssrRenderStyle({ "color": "var(--text-muted)" })}">Restante no Carretel:</span><span class="font-mono" style="${ssrRenderStyle({ "font-weight": "600", "color": "var(--text-main)" })}">${ssrInterpolate(f.remainingG)}g / ${ssrInterpolate(f.spoolWeightG)}g (${ssrInterpolate(Math.round(f.remainingG / f.spoolWeightG * 100))}%) </span></div><div style="${ssrRenderStyle({ "height": "6px", "background": "#1e293b", "border-radius": "4px", "overflow": "hidden" })}"><div style="${ssrRenderStyle([{ "height": "100%", "transition": "width 0.3s", "border-radius": "4px" }, {
          width: `${Math.min(Math.max(f.remainingG / f.spoolWeightG * 100, 2), 100)}%`,
          background: f.remainingG < 150 ? "var(--brand-rose)" : "linear-gradient(90deg, var(--brand-cyan), var(--brand-blue))"
        }])}"></div></div></div>`);
        if (f.notes) {
          _push(`<p style="${ssrRenderStyle({ "font-size": "0.78rem", "color": "var(--text-muted)", "background": "rgba(255, 255, 255, 0.02)", "padding": "0.5rem 0.65rem", "border-radius": "var(--radius-sm)", "margin-bottom": "1rem", "border-left": "2px solid var(--border-hover)" })}">${ssrInterpolate(f.notes)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.5rem", "justify-content": "flex-end", "border-top": "1px solid var(--border-subtle)", "padding-top": "0.85rem", "margin-top": "0.5rem" })}"><button${ssrRenderAttr("id", `btn-edit-filament-${f.id}`)} class="btn btn-secondary btn-sm" title="Editar filamento"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Editar </button><button${ssrRenderAttr("id", `btn-delete-filament-${f.id}`)} class="btn btn-danger btn-sm" title="Excluir filamento"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Excluir </button></div></div>`);
      });
      _push(`<!--]--></div>`);
      if (filteredFilaments.value.length === 0) {
        _push(`<div class="card" style="${ssrRenderStyle({ "text-align": "center", "padding": "3rem 1.5rem" })}"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="${ssrRenderStyle({ "margin-bottom": "1rem" })}"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="3" x2="12" y2="9"></line><line x1="12" y1="15" x2="12" y2="21"></line></svg><h3 style="${ssrRenderStyle({ "font-size": "1.1rem", "margin-bottom": "0.5rem" })}">Nenhum filamento encontrado</h3><p style="${ssrRenderStyle({ "color": "var(--text-muted)", "font-size": "0.875rem", "margin-bottom": "1.25rem" })}"> Tente ajustar sua busca ou adicione um novo filamento para começar a calcular. </p><button class="btn btn-primary">Adicionar Filamento</button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isModalOpen.value) {
        _push(`<div class="modal-backdrop"><div class="modal-content card"><div class="card-header"><div class="card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3"></circle></svg><span>${ssrInterpolate(isEditing.value ? "Editar Filamento" : "Cadastrar Novo Filamento")}</span></div><button class="btn btn-secondary btn-icon btn-sm">✕</button></div><form><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr", "gap": "1rem" })}"><div class="form-group" style="${ssrRenderStyle({ "grid-column": "span 2" })}"><label class="form-label" for="modal-f-name">Nome Comercial / Descrição</label><input id="modal-f-name"${ssrRenderAttr("value", form.name)} type="text" class="input-control" required placeholder="Ex: PLA Branco Puro Super Speed"></div><div class="form-group"><label class="form-label" for="modal-f-brand">Marca / Fabricante</label><input id="modal-f-brand"${ssrRenderAttr("value", form.brand)} type="text" class="input-control" required placeholder="Ex: Voolt3D, PrintaLot, 3D Fila..."></div><div class="form-group"><label class="form-label" for="modal-f-mat">Material</label><select id="modal-f-mat" class="input-control" required><option value="PLA"${ssrIncludeBooleanAttr(Array.isArray(form.material) ? ssrLooseContain(form.material, "PLA") : ssrLooseEqual(form.material, "PLA")) ? " selected" : ""}>PLA (Poliácido Láctico)</option><option value="PLA Silk"${ssrIncludeBooleanAttr(Array.isArray(form.material) ? ssrLooseContain(form.material, "PLA Silk") : ssrLooseEqual(form.material, "PLA Silk")) ? " selected" : ""}>PLA Silk (Metálico/Brilhante)</option><option value="PETG"${ssrIncludeBooleanAttr(Array.isArray(form.material) ? ssrLooseContain(form.material, "PETG") : ssrLooseEqual(form.material, "PETG")) ? " selected" : ""}>PETG (Resistência e UV)</option><option value="ABS"${ssrIncludeBooleanAttr(Array.isArray(form.material) ? ssrLooseContain(form.material, "ABS") : ssrLooseEqual(form.material, "ABS")) ? " selected" : ""}>ABS (Térmico e Mecânico)</option><option value="TPU"${ssrIncludeBooleanAttr(Array.isArray(form.material) ? ssrLooseContain(form.material, "TPU") : ssrLooseEqual(form.material, "TPU")) ? " selected" : ""}>TPU (Flexível / Emborrachado)</option><option value="ASA"${ssrIncludeBooleanAttr(Array.isArray(form.material) ? ssrLooseContain(form.material, "ASA") : ssrLooseEqual(form.material, "ASA")) ? " selected" : ""}>ASA (Ultra resistente UV)</option><option value="Nylon"${ssrIncludeBooleanAttr(Array.isArray(form.material) ? ssrLooseContain(form.material, "Nylon") : ssrLooseEqual(form.material, "Nylon")) ? " selected" : ""}>Nylon (Engrenagens e Alta Carga)</option><option value="Resina"${ssrIncludeBooleanAttr(Array.isArray(form.material) ? ssrLooseContain(form.material, "Resina") : ssrLooseEqual(form.material, "Resina")) ? " selected" : ""}>Resina UV SLA</option><option value="Outro"${ssrIncludeBooleanAttr(Array.isArray(form.material) ? ssrLooseContain(form.material, "Outro") : ssrLooseEqual(form.material, "Outro")) ? " selected" : ""}>Outro Insumo</option></select></div><div class="form-group"><label class="form-label" for="modal-f-colorname">Nome da Cor</label><input id="modal-f-colorname"${ssrRenderAttr("value", form.colorName)} type="text" class="input-control" required placeholder="Ex: Branco Neve, Vermelho Cereja..."></div><div class="form-group"><label class="form-label" for="modal-f-color">Tom Visual (Cor)</label><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.5rem", "align-items": "center" })}"><input id="modal-f-color"${ssrRenderAttr("value", form.color)} type="color" style="${ssrRenderStyle({ "width": "44px", "height": "38px", "border": "none", "background": "transparent", "cursor": "pointer", "border-radius": "6px" })}"><input${ssrRenderAttr("value", form.color)} type="text" class="input-control font-mono" style="${ssrRenderStyle({ "text-transform": "uppercase" })}"></div></div><div class="form-group"><label class="form-label" for="modal-f-weight">Peso Total do Carretel (g)</label><div class="input-prefix-box"><input id="modal-f-weight"${ssrRenderAttr("value", form.spoolWeightG)} type="number" class="input-control font-mono" min="50" step="50" required><span class="input-prefix-tag">gramas</span></div></div><div class="form-group"><label class="form-label" for="modal-f-remaining">Estoque Restante (g)</label><div class="input-prefix-box"><input id="modal-f-remaining"${ssrRenderAttr("value", form.remainingG)} type="number" class="input-control font-mono" min="0"${ssrRenderAttr("max", form.spoolWeightG)} required><span class="input-prefix-tag">gramas</span></div></div><div class="form-group"><label class="form-label" for="modal-f-price">Preço Pago no Carretel</label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="modal-f-price"${ssrRenderAttr("value", form.pricePaid)} type="number" class="input-control font-mono" step="0.01" min="0" required></div></div><div class="form-group"><label class="form-label" for="modal-f-shipping">Frete Rateado (R$)</label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="modal-f-shipping"${ssrRenderAttr("value", form.shippingCost)} type="number" class="input-control font-mono" step="0.01" min="0"></div></div><div style="${ssrRenderStyle({ "grid-column": "span 2", "background": "rgba(0, 240, 255, 0.05)", "border": "1px dashed rgba(0, 240, 255, 0.3)", "border-radius": "var(--radius-md)", "padding": "0.85rem", "display": "flex", "justify-content": "space-between", "align-items": "center" })}"><div><span style="${ssrRenderStyle({ "font-size": "0.75rem", "text-transform": "uppercase", "color": "var(--text-muted)", "font-weight": "700" })}">Resultado Calculado:</span><div style="${ssrRenderStyle({ "font-size": "0.85rem", "color": "var(--text-main)" })}"> Custo total carretel: <strong>R$ ${ssrInterpolate(((Number(form.pricePaid) || 0) + (Number(form.shippingCost) || 0)).toFixed(2))}</strong></div></div><div style="${ssrRenderStyle({ "text-align": "right" })}"><span style="${ssrRenderStyle({ "font-size": "0.75rem", "text-transform": "uppercase", "color": "var(--brand-cyan)", "font-weight": "700" })}">Custo por Grama</span><div class="font-mono" style="${ssrRenderStyle({ "font-size": "1.35rem", "font-weight": "800", "color": "var(--brand-cyan)" })}"> R$ ${ssrInterpolate(formPreviewCostPerGram.value.toFixed(4))} /g </div></div></div><div class="form-group" style="${ssrRenderStyle({ "grid-column": "span 2" })}"><label class="form-label" for="modal-f-notes">Anotações / Temperaturas de Impressão</label><textarea id="modal-f-notes" rows="2" class="input-control" placeholder="Ex: Bico 215°C, Mesa 60°C, Fluxo 0.98, Retração 0.8mm...">${ssrInterpolate(form.notes)}</textarea></div></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "flex-end", "gap": "0.75rem", "margin-top": "1.5rem", "border-top": "1px solid var(--border-subtle)", "padding-top": "1rem" })}"><button type="button" class="btn btn-secondary">Cancelar</button><button id="modal-f-submit" type="submit" class="btn btn-primary">${ssrInterpolate(isEditing.value ? "Salvar Alterações" : "Cadastrar Filamento")}</button></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FilamentManager.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "PlatformFeeManager",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      platforms: platforms2
    } = use3DStore();
    const isModalOpen = ref(false);
    const isEditing = ref(false);
    ref("");
    const defaultForm = {
      name: "",
      category: "marketplace",
      badgeColor: "#00F0FF",
      commissionPercent: 14,
      fixedFee: 5,
      fixedFeeThreshold: 79,
      freeShippingCost: 0,
      freeShippingThreshold: 99999,
      paymentProcessingPercent: 0,
      enabled: true,
      description: ""
    };
    const form = reactive({ ...defaultForm });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "platform-fee-manager-section" }, _attrs))}><div class="card card-glass" style="${ssrRenderStyle({ "margin-bottom": "1.5rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "center", "flex-wrap": "wrap", "gap": "1rem" })}"><div><h2 style="${ssrRenderStyle({ "font-size": "1.4rem", "font-weight": "800", "display": "flex", "align-items": "center", "gap": "0.6rem" })}"><span class="text-gradient">Configuração de Taxas dos Marketplaces</span></h2><p class="card-subtitle"> Configure as comissões percentuais, taxas fixas por item, subsídios de frete grátis obrigatório e taxas de processamento financeiro de cada canal de venda. </p></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.75rem", "flex-wrap": "wrap" })}"><button id="btn-reset-platforms" class="btn btn-secondary btn-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg> Restaurar Regras Padrão </button><button id="btn-add-platform-open" class="btn btn-primary btn-sm"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Nova Plataforma </button></div></div><div style="${ssrRenderStyle({ "margin-top": "1.25rem", "background": "rgba(0, 240, 255, 0.05)", "border": "1px solid rgba(0, 240, 255, 0.2)", "border-radius": "var(--radius-md)", "padding": "0.85rem 1rem", "display": "flex", "align-items": "flex-start", "gap": "0.75rem" })}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${ssrRenderStyle({ "flex-shrink": "0", "margin-top": "2px" })}"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg><div style="${ssrRenderStyle({ "font-size": "0.825rem", "color": "var(--text-muted)", "line-height": "1.45" })}"><strong style="${ssrRenderStyle({ "color": "var(--brand-cyan)" })}">Como o simulador calcula o preço reverso:</strong> Quando você define a sua margem de lucro alvo na calculadora, o sistema calcula exatamente por quanto você deve anunciar em cada plataforma para que, após deduzir comissão, taxa fixa, coparticipação de frete e impostos de nota, sobre exatamente o lucro líquido desejado no seu bolso! </div></div></div><div class="platform-grid"><!--[-->`);
      ssrRenderList(unref(platforms2), (p) => {
        _push(`<div class="card" style="${ssrRenderStyle([{ borderLeft: `4px solid ${p.badgeColor || "var(--brand-cyan)"}` }, { "display": "flex", "flex-direction": "column", "justify-content": "space-between" }])}"><div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "flex-start", "margin-bottom": "0.85rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "0.65rem" })}"><span class="platform-indicator" style="${ssrRenderStyle({ backgroundColor: p.badgeColor, color: p.badgeColor })}"></span><div><h3 style="${ssrRenderStyle({ "font-size": "1.1rem", "font-weight": "700", "line-height": "1.2" })}">${ssrInterpolate(p.name)}</h3><span style="${ssrRenderStyle({ "font-size": "0.75rem", "text-transform": "uppercase", "color": "var(--text-dim)", "font-weight": "600" })}">${ssrInterpolate(p.category === "marketplace" ? "Marketplace" : p.category === "direct" ? "Canal Próprio" : "E-commerce")}</span></div></div><label style="${ssrRenderStyle({ "display": "inline-flex", "align-items": "center", "cursor": "pointer", "gap": "0.4rem" })}"${ssrRenderAttr("title", p.enabled ? "Ativo no simulador" : "Inativo no simulador")}><input${ssrRenderAttr("id", `toggle-platform-${p.id}`)}${ssrIncludeBooleanAttr(Array.isArray(p.enabled) ? ssrLooseContain(p.enabled, null) : p.enabled) ? " checked" : ""} type="checkbox" style="${ssrRenderStyle({ "display": "none" })}"><span style="${ssrRenderStyle([{ "width": "38px", "height": "20px", "border-radius": "20px", "display": "inline-block", "position": "relative", "transition": "background-color 0.2s" }, { background: p.enabled ? "var(--brand-emerald)" : "#334155" }])}"><span style="${ssrRenderStyle([{ "width": "14px", "height": "14px", "background": "white", "border-radius": "50%", "position": "absolute", "top": "3px", "transition": "left 0.2s" }, { left: p.enabled ? "21px" : "3px" }])}"></span></span><span style="${ssrRenderStyle([{ "font-size": "0.75rem", "font-weight": "600" }, { color: p.enabled ? "var(--brand-emerald)" : "var(--text-dim)" }])}">${ssrInterpolate(p.enabled ? "Ativo" : "Pausado")}</span></label></div><p style="${ssrRenderStyle({ "font-size": "0.8rem", "color": "var(--text-muted)", "margin-bottom": "1rem", "min-height": "38px" })}">${ssrInterpolate(p.description || "Sem descrição cadastrada.")}</p><div style="${ssrRenderStyle({ "background": "rgba(0, 0, 0, 0.25)", "border-radius": "var(--radius-md)", "padding": "0.85rem", "border": "1px solid var(--border-subtle)", "display": "grid", "grid-template-columns": "1fr 1fr", "gap": "0.75rem", "margin-bottom": "1rem" })}"><div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-muted)", "text-transform": "uppercase" })}">Comissão Canal</span><div class="font-mono" style="${ssrRenderStyle({ "font-size": "1.15rem", "font-weight": "800", "color": "var(--brand-cyan)" })}">${ssrInterpolate(p.commissionPercent)}% </div></div><div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-muted)", "text-transform": "uppercase" })}">Taxa Fixa / Item</span><div class="font-mono" style="${ssrRenderStyle({ "font-size": "1.15rem", "font-weight": "800", "color": "var(--text-main)" })}"> R$ ${ssrInterpolate((p.fixedFee || 0).toFixed(2))}</div></div><div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-muted)", "text-transform": "uppercase" })}">Teto Taxa Fixa</span><div class="font-mono" style="${ssrRenderStyle({ "font-size": "0.875rem", "color": "var(--text-muted)", "font-weight": "600" })}">${ssrInterpolate(p.fixedFeeThreshold < 99999 && p.fixedFeeThreshold > 0 ? `< R$ ${p.fixedFeeThreshold.toFixed(2)}` : "Sempre aplica")}</div></div><div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-muted)", "text-transform": "uppercase" })}">Frete Coparticipado</span><div class="font-mono" style="${ssrRenderStyle({ "font-size": "0.875rem", "color": "var(--brand-amber)", "font-weight": "600" })}">${ssrInterpolate(p.freeShippingCost > 0 ? `R$ ${p.freeShippingCost.toFixed(2)} (>= R$${p.freeShippingThreshold})` : "Isento")}</div></div></div></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.5rem", "justify-content": "flex-end", "border-top": "1px solid var(--border-subtle)", "padding-top": "0.85rem" })}"><button${ssrRenderAttr("id", `btn-edit-platform-${p.id}`)} class="btn btn-secondary btn-sm" title="Editar taxas da plataforma"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Editar Taxas </button><button${ssrRenderAttr("id", `btn-delete-platform-${p.id}`)} class="btn btn-danger btn-sm" title="Excluir plataforma"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div></div>`);
      });
      _push(`<!--]--></div>`);
      if (isModalOpen.value) {
        _push(`<div class="modal-backdrop"><div class="modal-content card"><div class="card-header"><div class="card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path></svg><span>${ssrInterpolate(isEditing.value ? "Editar Taxas da Plataforma" : "Cadastrar Nova Plataforma")}</span></div><button class="btn btn-secondary btn-icon btn-sm">✕</button></div><form><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr", "gap": "1rem" })}"><div class="form-group" style="${ssrRenderStyle({ "grid-column": "span 2" })}"><label class="form-label" for="modal-p-name">Nome da Plataforma / Canal</label><input id="modal-p-name"${ssrRenderAttr("value", form.name)} type="text" class="input-control" required placeholder="Ex: Mercado Livre Clássico, TikTok Shop, Shopee..."></div><div class="form-group"><label class="form-label" for="modal-p-category">Tipo de Canal</label><select id="modal-p-category" class="input-control" required><option value="marketplace"${ssrIncludeBooleanAttr(Array.isArray(form.category) ? ssrLooseContain(form.category, "marketplace") : ssrLooseEqual(form.category, "marketplace")) ? " selected" : ""}>Marketplace Oficial</option><option value="direct"${ssrIncludeBooleanAttr(Array.isArray(form.category) ? ssrLooseContain(form.category, "direct") : ssrLooseEqual(form.category, "direct")) ? " selected" : ""}>Venda Direta (PIX / WhatsApp)</option><option value="ecommerce"${ssrIncludeBooleanAttr(Array.isArray(form.category) ? ssrLooseContain(form.category, "ecommerce") : ssrLooseEqual(form.category, "ecommerce")) ? " selected" : ""}>E-commerce / Loja Própria</option></select></div><div class="form-group"><label class="form-label" for="modal-p-color">Cor de Destaque da Marca</label><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.5rem", "align-items": "center" })}"><input id="modal-p-color"${ssrRenderAttr("value", form.badgeColor)} type="color" style="${ssrRenderStyle({ "width": "44px", "height": "38px", "border": "none", "background": "transparent", "cursor": "pointer", "border-radius": "6px" })}"><input${ssrRenderAttr("value", form.badgeColor)} type="text" class="input-control font-mono" style="${ssrRenderStyle({ "text-transform": "uppercase" })}"></div></div><div class="form-group"><label class="form-label" for="modal-p-commission">Comissão da Plataforma (%)</label><div class="input-prefix-box"><input id="modal-p-commission"${ssrRenderAttr("value", form.commissionPercent)} type="number" class="input-control font-mono" step="0.1" min="0" max="100" required><span class="input-prefix-tag">%</span></div></div><div class="form-group"><label class="form-label" for="modal-p-fixedfee">Taxa Fixa por Item Vendido (R$)</label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="modal-p-fixedfee"${ssrRenderAttr("value", form.fixedFee)} type="number" class="input-control font-mono" step="0.01" min="0" required></div></div><div class="form-group"><label class="form-label" for="modal-p-threshold"> Cobrar Taxa Fixa se Preço for menor que </label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="modal-p-threshold"${ssrRenderAttr("value", form.fixedFeeThreshold)} type="number" class="input-control font-mono" step="1" min="0"></div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)" })}">No Mercado Livre é R$ 79. Se sempre cobrar (ex: Shopee), digite 99999.</span></div><div class="form-group"><label class="form-label" for="modal-p-payrate">Taxa Financeira / Gateway Cartão (%)</label><div class="input-prefix-box"><input id="modal-p-payrate"${ssrRenderAttr("value", form.paymentProcessingPercent)} type="number" class="input-control font-mono" step="0.1" min="0" max="30"><span class="input-prefix-tag">%</span></div></div><div class="form-group"><label class="form-label" for="modal-p-shippingcost">Custo Médio de Frete Subsidiado</label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="modal-p-shippingcost"${ssrRenderAttr("value", form.freeShippingCost)} type="number" class="input-control font-mono" step="0.5" min="0"></div></div><div class="form-group"><label class="form-label" for="modal-p-shippingthresh">Obrigatório acima de (R$)</label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="modal-p-shippingthresh"${ssrRenderAttr("value", form.freeShippingThreshold)} type="number" class="input-control font-mono" step="1" min="0"></div></div><div class="form-group" style="${ssrRenderStyle({ "grid-column": "span 2" })}"><label class="form-label" for="modal-p-desc">Regras / Notas Explicativas</label><textarea id="modal-p-desc" rows="2" class="input-control" placeholder="Ex: Anúncio com parcelamento sem juros, comissão de 18.5%, frete grátis...">${ssrInterpolate(form.description)}</textarea></div></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "flex-end", "gap": "0.75rem", "margin-top": "1.5rem", "border-top": "1px solid var(--border-subtle)", "padding-top": "1rem" })}"><button type="button" class="btn btn-secondary">Cancelar</button><button id="modal-p-submit" type="submit" class="btn btn-primary">${ssrInterpolate(isEditing.value ? "Salvar Alterações" : "Cadastrar Plataforma")}</button></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PlatformFeeManager.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "PrinterSettingsManager",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      printers: printers2,
      settings: settings2
    } = use3DStore();
    const isModalOpen = ref(false);
    const isEditing = ref(false);
    ref("");
    const defaultForm = {
      name: "",
      brand: "",
      model: "",
      powerWatts: 180,
      purchaseCost: 3500,
      lifespanHours: 4e3,
      maintenancePerHour: 1.5,
      isDefault: false
    };
    const form = reactive({ ...defaultForm });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "printer-settings-section" }, _attrs))}><div class="card card-glass" style="${ssrRenderStyle({ "margin-bottom": "1.5rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "center", "flex-wrap": "wrap", "gap": "1rem" })}"><div><h2 style="${ssrRenderStyle({ "font-size": "1.4rem", "font-weight": "800", "display": "flex", "align-items": "center", "gap": "0.6rem" })}"><span class="text-gradient">Impressoras 3D &amp; Custos Operacionais</span></h2><p class="card-subtitle"> Configure suas máquinas, consumo elétrico, depreciação, custo da energia por kWh e valor da sua hora técnica. </p></div><button id="btn-add-printer-open" class="btn btn-primary btn-sm"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Adicionar Impressora </button></div></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1.6fr", "gap": "1.5rem", "align-items": "start" })}"><div class="card"><div class="card-header"><div class="card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-amber)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg><span>Custos Fixos &amp; Parâmetros</span></div><span class="badge badge-amber">Global</span></div><form><div class="form-group"><label class="form-label" for="sett-kwh"><span>Energia Elétrica (R$ / kWh)</span><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)" })}">Consulte sua conta de luz</span></label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="sett-kwh"${ssrRenderAttr("value", unref(settings2).electricityCostPerKwh)} type="number" class="input-control font-mono" step="0.01" min="0" required><span class="input-prefix-tag">/ kWh</span></div></div><div class="form-group"><label class="form-label" for="sett-labor"><span>Valor da sua Hora Técnica</span><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)" })}">Fatiamento, suportes e pós</span></label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="sett-labor"${ssrRenderAttr("value", unref(settings2).hourlyLaborRate)} type="number" class="input-control font-mono" step="1" min="0" required><span class="input-prefix-tag">/ hora</span></div></div><div class="form-group"><label class="form-label" for="sett-failure"><span>Margem de Falha / Descarte Padrão</span><span class="font-mono text-gradient-amber">${ssrInterpolate(unref(settings2).defaultFailureRate)}%</span></label><input id="sett-failure"${ssrRenderAttr("value", unref(settings2).defaultFailureRate)} type="range" class="range-input" min="0" max="25" step="1"><span style="${ssrRenderStyle({ "font-size": "0.75rem", "color": "var(--text-dim)" })}">Cobre peças descoladas, entupimentos e testes de calibração.</span></div><div class="form-group"><label class="form-label" for="sett-profit"><span>Margem de Lucro Alvo Padrão (Markup)</span><span class="font-mono text-gradient-emerald">${ssrInterpolate(unref(settings2).defaultProfitMargin)}%</span></label><input id="sett-profit"${ssrRenderAttr("value", unref(settings2).defaultProfitMargin)} type="range" class="range-input" min="10" max="200" step="5"><span style="${ssrRenderStyle({ "font-size": "0.75rem", "color": "var(--text-dim)" })}">Adicionada sobre o custo total de fabricação na venda direta.</span></div><div class="form-group"><label class="form-label" for="sett-tax"><span>Imposto sobre Venda / Nota Fiscal</span><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)" })}">Simples / DAS</span></label><div class="input-prefix-box"><input id="sett-tax"${ssrRenderAttr("value", unref(settings2).taxRatePercent)} type="number" class="input-control font-mono" step="0.5" min="0" max="30" required><span class="input-prefix-tag">%</span></div><span style="${ssrRenderStyle({ "font-size": "0.75rem", "color": "var(--text-dim)" })}">Para MEI (isento de % por nota) use 0% a 3%. Para Simples Nacional use 4% a 8%.</span></div><div style="${ssrRenderStyle({ "background": "rgba(16, 185, 129, 0.08)", "border": "1px solid rgba(16, 185, 129, 0.2)", "border-radius": "var(--radius-md)", "padding": "0.75rem", "margin-top": "1rem", "display": "flex", "align-items": "center", "gap": "0.5rem", "font-size": "0.8rem", "color": "var(--brand-emerald)" })}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Configurações salvas automaticamente no navegador.</span></div></form></div><div style="${ssrRenderStyle({ "display": "flex", "flex-direction": "column", "gap": "1rem" })}"><!--[-->`);
      ssrRenderList(unref(printers2), (p) => {
        _push(`<div class="card" style="${ssrRenderStyle({ "display": "flex", "flex-direction": "column", "justify-content": "space-between" })}"><div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "flex-start", "margin-bottom": "0.75rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "0.75rem" })}"><div style="${ssrRenderStyle({ "width": "38px", "height": "38px", "background": "rgba(0, 240, 255, 0.1)", "border": "1px solid rgba(0, 240, 255, 0.3)", "border-radius": "var(--radius-md)", "display": "flex", "align-items": "center", "justify-content": "center", "color": "var(--brand-cyan)" })}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg></div><div><h3 style="${ssrRenderStyle({ "font-size": "1.1rem", "font-weight": "700" })}">${ssrInterpolate(p.name)}</h3><span style="${ssrRenderStyle({ "font-size": "0.775rem", "color": "var(--text-dim)" })}">${ssrInterpolate(p.brand)} • Modelo: ${ssrInterpolate(p.model)}</span></div></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.5rem", "align-items": "center" })}">`);
        if (p.isDefault) {
          _push(`<span class="badge badge-cyan">Principal</span>`);
        } else {
          _push(`<button class="btn btn-secondary btn-sm" style="${ssrRenderStyle({ "font-size": "0.725rem", "padding": "0.2rem 0.5rem" })}"> Tornar Padrão </button>`);
        }
        _push(`</div></div><div style="${ssrRenderStyle({ "background": "rgba(0, 0, 0, 0.25)", "border-radius": "var(--radius-md)", "padding": "0.85rem", "border": "1px solid var(--border-subtle)", "display": "grid", "grid-template-columns": "repeat(4, 1fr)", "gap": "0.5rem", "margin-bottom": "0.85rem" })}"><div><span style="${ssrRenderStyle({ "font-size": "0.7rem", "color": "var(--text-muted)", "text-transform": "uppercase" })}">Potência</span><div class="font-mono" style="${ssrRenderStyle({ "font-size": "0.95rem", "font-weight": "700", "color": "var(--text-main)" })}">${ssrInterpolate(p.powerWatts)}W </div></div><div><span style="${ssrRenderStyle({ "font-size": "0.7rem", "color": "var(--text-muted)", "text-transform": "uppercase" })}">Valor Compra</span><div class="font-mono" style="${ssrRenderStyle({ "font-size": "0.95rem", "font-weight": "700", "color": "var(--text-main)" })}"> R$ ${ssrInterpolate(p.purchaseCost.toFixed(0))}</div></div><div><span style="${ssrRenderStyle({ "font-size": "0.7rem", "color": "var(--text-muted)", "text-transform": "uppercase" })}">Depreciação/h</span><div class="font-mono" style="${ssrRenderStyle({ "font-size": "0.95rem", "font-weight": "800", "color": "var(--brand-amber)" })}"> R$ ${ssrInterpolate(((p.purchaseCost || 0) / Math.max(p.lifespanHours || 3e3, 1)).toFixed(2))}/h </div></div><div><span style="${ssrRenderStyle({ "font-size": "0.7rem", "color": "var(--text-muted)", "text-transform": "uppercase" })}">Manutenção/h</span><div class="font-mono" style="${ssrRenderStyle({ "font-size": "0.95rem", "font-weight": "800", "color": "var(--brand-cyan)" })}"> R$ ${ssrInterpolate((p.maintenancePerHour || 0).toFixed(2))}/h </div></div></div><div style="${ssrRenderStyle({ "font-size": "0.78rem", "color": "var(--text-muted)", "display": "flex", "justify-content": "space-between", "align-items": "center" })}"><span>Vida útil estimada: <strong>${ssrInterpolate(p.lifespanHours.toLocaleString())} horas</strong> de impressão</span><span>Custo elétrico estimado: <strong>~R$ ${ssrInterpolate(((p.powerWatts || 150) / 1e3 * (unref(settings2).electricityCostPerKwh || 0.92)).toFixed(2))}/hora</strong></span></div></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.5rem", "justify-content": "flex-end", "border-top": "1px solid var(--border-subtle)", "padding-top": "0.75rem", "margin-top": "0.75rem" })}"><button${ssrRenderAttr("id", `btn-edit-printer-${p.id}`)} class="btn btn-secondary btn-sm"> Editar </button><button${ssrRenderAttr("id", `btn-delete-printer-${p.id}`)} class="btn btn-danger btn-sm"${ssrIncludeBooleanAttr(unref(printers2).length <= 1) ? " disabled" : ""}> Excluir </button></div></div>`);
      });
      _push(`<!--]--></div></div>`);
      if (isModalOpen.value) {
        _push(`<div class="modal-backdrop"><div class="modal-content card"><div class="card-header"><div class="card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><rect x="6" y="14" width="12" height="8"></rect></svg><span>${ssrInterpolate(isEditing.value ? "Editar Impressora 3D" : "Cadastrar Nova Impressora 3D")}</span></div><button class="btn btn-secondary btn-icon btn-sm">✕</button></div><form><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr", "gap": "1rem" })}"><div class="form-group" style="${ssrRenderStyle({ "grid-column": "span 2" })}"><label class="form-label" for="modal-pr-name">Nome de Identificação da Máquina</label><input id="modal-pr-name"${ssrRenderAttr("value", form.name)} type="text" class="input-control" required placeholder="Ex: Bambu Lab P1S Oficina"></div><div class="form-group"><label class="form-label" for="modal-pr-brand">Marca</label><input id="modal-pr-brand"${ssrRenderAttr("value", form.brand)} type="text" class="input-control" required placeholder="Ex: Bambu Lab, Creality, Elegoo..."></div><div class="form-group"><label class="form-label" for="modal-pr-model">Modelo</label><input id="modal-pr-model"${ssrRenderAttr("value", form.model)} type="text" class="input-control" required placeholder="Ex: P1S, Ender 3 V3, K1 Max..."></div><div class="form-group"><label class="form-label" for="modal-pr-power">Consumo Médio (Watts)</label><div class="input-prefix-box"><input id="modal-pr-power"${ssrRenderAttr("value", form.powerWatts)} type="number" class="input-control font-mono" min="50" max="2000" step="10" required><span class="input-prefix-tag">Watts</span></div></div><div class="form-group"><label class="form-label" for="modal-pr-cost">Valor Pago na Máquina (R$)</label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="modal-pr-cost"${ssrRenderAttr("value", form.purchaseCost)} type="number" class="input-control font-mono" min="100" step="50" required></div></div><div class="form-group"><label class="form-label" for="modal-pr-lifespan">Vida Útil Estimada (Horas)</label><div class="input-prefix-box"><input id="modal-pr-lifespan"${ssrRenderAttr("value", form.lifespanHours)} type="number" class="input-control font-mono" min="500" step="500" required><span class="input-prefix-tag">horas</span></div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)" })}">Padrão de mercado: 3.000 a 5.000 horas de trabalho contínuo.</span></div><div class="form-group"><label class="form-label" for="modal-pr-maint">Manutenção &amp; Bicos (R$/h)</label><div class="input-prefix-box"><span class="input-prefix-tag">R$</span><input id="modal-pr-maint"${ssrRenderAttr("value", form.maintenancePerHour)} type="number" class="input-control font-mono" step="0.1" min="0" required><span class="input-prefix-tag">/ hora</span></div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)" })}">Troca de bico de latão/aço, graxa, correias e álcool isopropílico.</span></div></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "flex-end", "gap": "0.75rem", "margin-top": "1.5rem", "border-top": "1px solid var(--border-subtle)", "padding-top": "1rem" })}"><button type="button" class="btn btn-secondary">Cancelar</button><button id="modal-pr-submit" type="submit" class="btn btn-primary">${ssrInterpolate(isEditing.value ? "Salvar Impressora" : "Cadastrar Impressora")}</button></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PrinterSettingsManager.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "SavedQuotesManager",
  __ssrInlineRender: true,
  emits: ["switch-to-calc", "view-quote-proposal", "quote-loaded"],
  setup(__props, { emit: __emit }) {
    const { savedQuotes: savedQuotes2 } = use3DStore();
    const searchQuery = ref("");
    const filteredQuotes = computed(() => {
      if (!searchQuery.value) return savedQuotes2;
      const q = searchQuery.value.toLowerCase();
      return savedQuotes2.filter(
        (item) => item.title.toLowerCase().includes(q) || item.clientName && item.clientName.toLowerCase().includes(q)
      );
    });
    const formatDate = (dateStr) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("pt-BR");
      } catch {
        return dateStr;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "saved-quotes-section" }, _attrs))}><div class="card card-glass" style="${ssrRenderStyle({ "margin-bottom": "1.5rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "center", "flex-wrap": "wrap", "gap": "1rem" })}"><div><h2 style="${ssrRenderStyle({ "font-size": "1.4rem", "font-weight": "800", "display": "flex", "align-items": "center", "gap": "0.6rem" })}"><span class="text-gradient">Orçamentos &amp; Histórico de Projetos</span></h2><p class="card-subtitle"> Consulte seus orçamentos salvos anteriormente, recarregue os parâmetros na calculadora a qualquer momento ou gere propostas para clientes. </p></div><div style="${ssrRenderStyle({ "flex": "1", "max-width": "300px", "min-width": "200px" })}" class="input-prefix-box"><span class="input-prefix-tag"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span><input id="input-search-quotes"${ssrRenderAttr("value", searchQuery.value)} type="text" class="input-control" placeholder="Buscar por peça ou cliente..."></div></div></div>`);
      if (filteredQuotes.value.length > 0) {
        _push(`<div class="platform-grid"><!--[-->`);
        ssrRenderList(filteredQuotes.value, (q) => {
          _push(`<div class="card" style="${ssrRenderStyle({ "display": "flex", "flex-direction": "column", "justify-content": "space-between" })}"><div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "flex-start", "margin-bottom": "0.75rem" })}"><div><h3 style="${ssrRenderStyle({ "font-size": "1.1rem", "font-weight": "700", "line-height": "1.2" })}">${ssrInterpolate(q.title)}</h3><span style="${ssrRenderStyle({ "font-size": "0.78rem", "color": "var(--text-dim)" })}">${ssrInterpolate(q.clientName ? `Cliente: ${q.clientName}` : "Cliente Particular")} • ${ssrInterpolate(formatDate(q.createdAt))}</span></div><span class="badge badge-cyan font-mono">${ssrInterpolate((q.printTimeHours + q.printTimeMinutes / 60).toFixed(1))}h </span></div><div style="${ssrRenderStyle({ "background": "rgba(0, 0, 0, 0.25)", "border-radius": "var(--radius-md)", "padding": "0.85rem", "border": "1px solid var(--border-subtle)", "margin-bottom": "1rem", "display": "flex", "justify-content": "space-between", "align-items": "center" })}"><div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-muted)", "text-transform": "uppercase" })}">Custo Fabricação</span><div class="font-mono" style="${ssrRenderStyle({ "font-size": "1.05rem", "font-weight": "700", "color": "var(--brand-rose)" })}"> R$ ${ssrInterpolate(q.breakdown.totalProductionCost.toFixed(2))}</div></div><div style="${ssrRenderStyle({ "text-align": "right" })}"><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--brand-emerald)", "text-transform": "uppercase", "font-weight": "700" })}">Preço Sugerido</span><div class="font-mono" style="${ssrRenderStyle({ "font-size": "1.3rem", "font-weight": "800", "color": "var(--brand-emerald)" })}"> R$ ${ssrInterpolate(q.breakdown.recommendedDirectPrice.toFixed(2))}</div></div></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "repeat(3, 1fr)", "gap": "0.5rem", "font-size": "0.775rem", "color": "var(--text-muted)", "margin-bottom": "1rem" })}"><div style="${ssrRenderStyle({ "background": "rgba(255, 255, 255, 0.02)", "padding": "0.5rem", "border-radius": "var(--radius-sm)" })}"><span>Peso Total:</span><div class="font-mono" style="${ssrRenderStyle({ "font-weight": "700", "color": "var(--text-main)" })}">${ssrInterpolate(q.breakdown.totalGrams)}g</div></div><div style="${ssrRenderStyle({ "background": "rgba(255, 255, 255, 0.02)", "padding": "0.5rem", "border-radius": "var(--radius-sm)" })}"><span>Lucro Bruto:</span><div class="font-mono" style="${ssrRenderStyle({ "font-weight": "700", "color": "var(--brand-emerald)" })}">R$ ${ssrInterpolate(q.breakdown.directProfit.toFixed(2))}</div></div><div style="${ssrRenderStyle({ "background": "rgba(255, 255, 255, 0.02)", "padding": "0.5rem", "border-radius": "var(--radius-sm)" })}"><span>Margem:</span><div class="font-mono" style="${ssrRenderStyle({ "font-weight": "700", "color": "var(--brand-cyan)" })}">${ssrInterpolate(q.breakdown.directMarginPercent.toFixed(0))}%</div></div></div>`);
          if (q.notes) {
            _push(`<p style="${ssrRenderStyle({ "font-size": "0.775rem", "color": "var(--text-dim)", "margin-bottom": "0.85rem", "font-style": "italic" })}"> &quot;${ssrInterpolate(q.notes)}&quot; </p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.5rem", "justify-content": "flex-end", "border-top": "1px solid var(--border-subtle)", "padding-top": "0.85rem" })}"><button${ssrRenderAttr("id", `btn-load-quote-${q.id}`)} class="btn btn-primary btn-sm" title="Carregar de volta na calculadora"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Carregar </button><button${ssrRenderAttr("id", `btn-proposal-quote-${q.id}`)} class="btn btn-secondary btn-sm" title="Ver proposta comercial"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> Proposta </button><button${ssrRenderAttr("id", `btn-delete-quote-${q.id}`)} class="btn btn-danger btn-sm" title="Excluir orçamento"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="card" style="${ssrRenderStyle({ "text-align": "center", "padding": "3rem 1.5rem" })}"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="${ssrRenderStyle({ "margin-bottom": "1rem" })}"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg><h3 style="${ssrRenderStyle({ "font-size": "1.15rem", "margin-bottom": "0.5rem" })}">Nenhum orçamento salvo ainda</h3><p style="${ssrRenderStyle({ "color": "var(--text-muted)", "font-size": "0.875rem", "margin-bottom": "1.25rem" })}"> Ao preencher os dados de impressão na calculadora, clique em &quot;Salvar Orçamento&quot; para armazenar seus projetos aqui. </p><button class="btn btn-primary">Ir para a Calculadora</button></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SavedQuotesManager.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ClientProposalModal",
  __ssrInlineRender: true,
  props: {
    isOpen: { type: Boolean },
    jobTitle: {},
    clientName: {},
    materialList: {},
    totalGrams: {},
    printHours: {},
    finalPrice: {},
    notes: {}
  },
  emits: ["close"],
  setup(__props) {
    const copied = ref(false);
    const formattedDate = computed(() => {
      return (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR");
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.isOpen) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-backdrop" }, _attrs))}><div class="modal-content card" style="${ssrRenderStyle({ "max-width": "720px", "background": "#0b1120", "border": "1px solid rgba(0, 240, 255, 0.3)" })}"><div class="card-header" style="${ssrRenderStyle({ "border-bottom": "1px solid rgba(255, 255, 255, 0.08)" })}"><div class="card-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg><span>Proposta Comercial de Impressão 3D</span></div><button class="btn btn-secondary btn-icon btn-sm">✕</button></div><div id="proposal-printable-card" style="${ssrRenderStyle({ "padding": "1.5rem", "background": "#070a12", "border-radius": "var(--radius-lg)", "border": "1px solid rgba(255, 255, 255, 0.06)", "margin-bottom": "1.5rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "flex-start", "margin-bottom": "1.5rem", "border-bottom": "1px solid rgba(255, 255, 255, 0.06)", "padding-bottom": "1rem" })}"><div><div style="${ssrRenderStyle({ "font-size": "1.4rem", "font-weight": "800", "color": "#fff", "letter-spacing": "-0.02em" })}"> STUDIO 3D • PROPOSTA </div><div style="${ssrRenderStyle({ "font-size": "0.8rem", "color": "var(--brand-cyan)", "font-weight": "600" })}"> Manufatura Aditiva &amp; Prototipagem de Alta Precisão </div></div><div style="${ssrRenderStyle({ "text-align": "right", "font-size": "0.8rem", "color": "var(--text-dim)" })}"><div>Data: <strong>${ssrInterpolate(formattedDate.value)}</strong></div><div>Validade: <strong>10 dias</strong></div></div></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr", "gap": "1rem", "margin-bottom": "1.5rem", "background": "rgba(255, 255, 255, 0.02)", "padding": "1rem", "border-radius": "var(--radius-md)" })}"><div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)", "text-transform": "uppercase" })}">Cliente:</span><div style="${ssrRenderStyle({ "font-weight": "700", "font-size": "1.05rem", "color": "var(--text-main)" })}">${ssrInterpolate(__props.clientName || "Cliente Particular")}</div></div><div><span style="${ssrRenderStyle({ "font-size": "0.725rem", "color": "var(--text-dim)", "text-transform": "uppercase" })}">Projeto / Peça:</span><div style="${ssrRenderStyle({ "font-weight": "700", "font-size": "1.05rem", "color": "var(--brand-cyan)" })}">${ssrInterpolate(__props.jobTitle)}</div></div></div><div style="${ssrRenderStyle({ "margin-bottom": "1.5rem" })}"><h4 style="${ssrRenderStyle({ "font-size": "0.85rem", "text-transform": "uppercase", "color": "var(--text-muted)", "margin-bottom": "0.75rem", "font-weight": "700" })}"> Especificações Técnicas de Fabricação </h4><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "repeat(3, 1fr)", "gap": "0.75rem" })}"><div style="${ssrRenderStyle({ "background": "rgba(0, 0, 0, 0.3)", "padding": "0.75rem", "border-radius": "var(--radius-md)", "border": "1px solid rgba(255, 255, 255, 0.04)" })}"><span style="${ssrRenderStyle({ "font-size": "0.7rem", "color": "var(--text-dim)", "text-transform": "uppercase" })}">Material(is)</span><div style="${ssrRenderStyle({ "font-weight": "700", "font-size": "0.95rem", "color": "var(--text-main)" })}">${ssrInterpolate(__props.materialList)}</div></div><div style="${ssrRenderStyle({ "background": "rgba(0, 0, 0, 0.3)", "padding": "0.75rem", "border-radius": "var(--radius-md)", "border": "1px solid rgba(255, 255, 255, 0.04)" })}"><span style="${ssrRenderStyle({ "font-size": "0.7rem", "color": "var(--text-dim)", "text-transform": "uppercase" })}">Peso Estimado</span><div class="font-mono" style="${ssrRenderStyle({ "font-weight": "700", "font-size": "0.95rem", "color": "var(--text-main)" })}">${ssrInterpolate(__props.totalGrams)} gramas </div></div><div style="${ssrRenderStyle({ "background": "rgba(0, 0, 0, 0.3)", "padding": "0.75rem", "border-radius": "var(--radius-md)", "border": "1px solid rgba(255, 255, 255, 0.04)" })}"><span style="${ssrRenderStyle({ "font-size": "0.7rem", "color": "var(--text-dim)", "text-transform": "uppercase" })}">Prazo Médio</span><div style="${ssrRenderStyle({ "font-weight": "700", "font-size": "0.95rem", "color": "var(--text-main)" })}">${ssrInterpolate(__props.printHours <= 5 ? "1 a 2 dias úteis" : "2 a 4 dias úteis")}</div></div></div></div>`);
        if (__props.notes) {
          _push(`<div style="${ssrRenderStyle({ "margin-bottom": "1.5rem", "font-size": "0.825rem", "color": "var(--text-muted)", "background": "rgba(0, 240, 255, 0.03)", "border-left": "3px solid var(--brand-cyan)", "padding": "0.75rem" })}"><strong>Detalhes &amp; Acabamento:</strong> ${ssrInterpolate(__props.notes)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div style="${ssrRenderStyle({ "background": "linear-gradient(135deg, rgba(0, 240, 255, 0.06), rgba(16, 185, 129, 0.08))", "border": "1px solid rgba(0, 240, 255, 0.2)", "border-radius": "var(--radius-md)", "padding": "1.25rem", "display": "flex", "justify-content": "space-between", "align-items": "center" })}"><div><div style="${ssrRenderStyle({ "font-size": "0.8rem", "color": "var(--brand-emerald)", "text-transform": "uppercase", "font-weight": "700" })}"> Investimento Total </div><div style="${ssrRenderStyle({ "font-size": "0.775rem", "color": "var(--text-muted)" })}"> Inclui matéria-prima de primeira linha, inspeção de qualidade e acabamento. </div></div><div style="${ssrRenderStyle({ "text-align": "right" })}"><div class="font-mono" style="${ssrRenderStyle({ "font-size": "2.2rem", "font-weight": "800", "color": "#fff", "line-height": "1" })}"> R$ ${ssrInterpolate(__props.finalPrice.toFixed(2))}</div><span style="${ssrRenderStyle({ "font-size": "0.75rem", "color": "var(--brand-emerald)", "font-weight": "600" })}"> À vista via PIX ou em até 3x no cartão </span></div></div></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "center", "gap": "0.75rem", "flex-wrap": "wrap" })}"><div style="${ssrRenderStyle({ "font-size": "0.8rem", "color": "var(--text-dim)" })}"> Ideal para enviar no WhatsApp ou gerar orçamento em PDF. </div><div style="${ssrRenderStyle({ "display": "flex", "gap": "0.75rem" })}"><button id="btn-copy-proposal-text" class="btn btn-secondary"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> ${ssrInterpolate(copied.value ? "Texto Copiado!" : "Copiar p/ WhatsApp")}</button><button id="btn-print-proposal" class="btn btn-primary"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Imprimir / Salvar PDF </button></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ClientProposalModal.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const currentTab = ref("calculator");
    const isGuestMode = ref(false);
    const store = use3DStore();
    const {
      filaments: filaments2,
      platforms: platforms2,
      savedQuotes: savedQuotes2,
      activeJob: activeJob2,
      jobCostBreakdown,
      saveCurrentQuote,
      loadUserSpecificData: loadUserSpecificData2
    } = store;
    const firebaseService = useFirebase();
    const {
      currentUser: currentUser2,
      isFirebaseConfigured: isFirebaseConfigured2,
      isSyncing: isSyncing2,
      logout
    } = firebaseService;
    const toasts = reactive([]);
    const showToast = (message) => {
      const id = Date.now();
      toasts.push({ id, message });
      setTimeout(() => {
        const idx = toasts.findIndex((t) => t.id === id);
        if (idx !== -1) toasts.splice(idx, 1);
      }, 3500);
    };
    const isProposalOpen = ref(false);
    const proposalData = reactive({
      jobTitle: "",
      clientName: "",
      materialList: "",
      totalGrams: 0,
      printHours: 0,
      finalPrice: 0,
      notes: ""
    });
    watch(currentUser2, async (newUser, oldUser) => {
      if (newUser && newUser.uid) {
        isGuestMode.value = false;
        await loadUserSpecificData2(newUser.uid);
        showToast(`Bem-vindo, ${newUser.displayName || newUser.email}! Dados sincronizados com a nuvem.`);
      } else if (oldUser && !newUser) {
        isGuestMode.value = false;
        showToast("Você saiu da sua conta.");
      }
    });
    const handleLoggedIn = () => {
      isGuestMode.value = false;
    };
    const handleLogout = async () => {
      if (confirm("Deseja realmente sair da sua conta?")) {
        await logout();
        isGuestMode.value = false;
      }
    };
    const handleTabChange = (tab) => {
      currentTab.value = tab;
    };
    const handleNewJob = () => {
      activeJob2.title = "Novo Projeto 3D";
      activeJob2.clientName = "";
      activeJob2.printTimeHours = 3;
      activeJob2.printTimeMinutes = 0;
      activeJob2.prepTimeMinutes = 15;
      activeJob2.packagingCost = 3.5;
      activeJob2.hardwareCost = 0;
      activeJob2.notes = "";
      currentTab.value = "calculator";
      showToast("Novo cálculo iniciado na calculadora!");
    };
    const handleSaveCurrentQuote = () => {
      saveCurrentQuote();
      showToast("Orçamento salvo com sucesso!");
    };
    const openCurrentProposal = () => {
      const materials = activeJob2.filaments.map((item) => {
        const f = filaments2.find((fil) => fil.id === item.filamentId);
        return f ? `${f.name} (${f.material})` : "Filamento 3D";
      }).join(", ");
      proposalData.jobTitle = activeJob2.title;
      proposalData.clientName = activeJob2.clientName || "Cliente Particular";
      proposalData.materialList = materials || "PLA Premium";
      proposalData.totalGrams = jobCostBreakdown.value.totalGrams;
      proposalData.printHours = jobCostBreakdown.value.totalPrintHours;
      proposalData.finalPrice = jobCostBreakdown.value.recommendedDirectPrice;
      proposalData.notes = activeJob2.notes || "";
      isProposalOpen.value = true;
    };
    const openSavedQuoteProposal = (q) => {
      const materials = q.filaments.map((item) => {
        const f = filaments2.find((fil) => fil.id === item.filamentId);
        return f ? `${f.name} (${f.material})` : "Filamento 3D";
      }).join(", ");
      proposalData.jobTitle = q.title;
      proposalData.clientName = q.clientName || "Cliente Particular";
      proposalData.materialList = materials || "PLA Premium";
      proposalData.totalGrams = q.breakdown.totalGrams;
      proposalData.printHours = q.breakdown.totalPrintHours;
      proposalData.finalPrice = q.breakdown.recommendedDirectPrice;
      proposalData.notes = q.notes || "";
      isProposalOpen.value = true;
    };
    const onQuoteLoaded = () => {
      currentTab.value = "calculator";
      showToast("Orçamento carregado com sucesso na calculadora!");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AuthScreen = __nuxt_component_0;
      const _component_AppHeader = _sfc_main$a;
      const _component_PrintJobCalculator = _sfc_main$9;
      const _component_PlatformSimulator = _sfc_main$8;
      const _component_FilamentManager = _sfc_main$7;
      const _component_PlatformFeeManager = _sfc_main$6;
      const _component_PrinterSettingsManager = _sfc_main$5;
      const _component_SavedQuotesManager = _sfc_main$4;
      const _component_ClientProposalModal = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "app-wrapper" }, _attrs))}>`);
      if (!unref(currentUser2) && !isGuestMode.value) {
        _push(ssrRenderComponent(_component_AuthScreen, {
          onLoggedIn: handleLoggedIn,
          onContinueAsGuest: ($event) => isGuestMode.value = true
        }, null, _parent));
      } else {
        _push(`<div style="${ssrRenderStyle({ "display": "flex", "flex-direction": "column", "min-height": "100vh" })}">`);
        _push(ssrRenderComponent(_component_AppHeader, {
          "current-tab": currentTab.value,
          "filament-count": unref(filaments2).length,
          "platform-count": unref(platforms2).length,
          "quote-count": unref(savedQuotes2).length,
          "current-user": unref(currentUser2),
          "is-firebase-configured": unref(isFirebaseConfigured2),
          "is-syncing": unref(isSyncing2),
          onChangeTab: handleTabChange,
          onNewJob: handleNewJob,
          onOpenAuth: ($event) => isGuestMode.value = false,
          onLogout: handleLogout
        }, null, _parent));
        if (!unref(currentUser2) && isGuestMode.value) {
          _push(`<div style="${ssrRenderStyle({ "background": "rgba(245, 158, 11, 0.12)", "border-bottom": "1px solid rgba(245, 158, 11, 0.25)", "padding": "0.6rem 1.5rem", "display": "flex", "justify-content": "space-between", "align-items": "center", "font-size": "0.8rem", "color": "var(--brand-amber)", "flex-wrap": "wrap", "gap": "0.5rem" })}"><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "0.5rem" })}"><span>⚠️ <strong>Modo Local Offline:</strong> Seus dados estão salvos apenas neste navegador.</span></div><button class="btn btn-secondary btn-sm" style="${ssrRenderStyle({ "padding": "0.25rem 0.65rem", "font-size": "0.75rem", "border-color": "rgba(245, 158, 11, 0.4)", "color": "var(--brand-amber)" })}"> Entrar ou Criar Conta para Salvar na Nuvem → </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<main class="container-custom" style="${ssrRenderStyle({ "padding-top": "1.5rem", "padding-bottom": "4rem", "flex": "1" })}"><div style="${ssrRenderStyle(currentTab.value === "calculator" ? null : { display: "none" })}">`);
        _push(ssrRenderComponent(_component_PrintJobCalculator, {
          onSaveQuote: handleSaveCurrentQuote,
          onViewProposal: openCurrentProposal
        }, null, _parent));
        _push(ssrRenderComponent(_component_PlatformSimulator, null, null, _parent));
        _push(`</div>`);
        if (currentTab.value === "filaments") {
          _push(`<div>`);
          _push(ssrRenderComponent(_component_FilamentManager, null, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (currentTab.value === "platforms") {
          _push(`<div>`);
          _push(ssrRenderComponent(_component_PlatformFeeManager, null, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (currentTab.value === "printers") {
          _push(`<div>`);
          _push(ssrRenderComponent(_component_PrinterSettingsManager, null, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (currentTab.value === "quotes") {
          _push(`<div>`);
          _push(ssrRenderComponent(_component_SavedQuotesManager, {
            onSwitchToCalc: ($event) => currentTab.value = "calculator",
            onViewQuoteProposal: openSavedQuoteProposal,
            onQuoteLoaded
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</main>`);
        _push(ssrRenderComponent(_component_ClientProposalModal, {
          "is-open": isProposalOpen.value,
          "job-title": proposalData.jobTitle,
          "client-name": proposalData.clientName,
          "material-list": proposalData.materialList,
          "total-grams": proposalData.totalGrams,
          "print-hours": proposalData.printHours,
          "final-price": proposalData.finalPrice,
          notes: proposalData.notes,
          onClose: ($event) => isProposalOpen.value = false
        }, null, _parent));
        _push(`<footer style="${ssrRenderStyle({ "border-top": "1px solid var(--border-subtle)", "padding": "1.5rem 0", "background": "rgba(9, 13, 22, 0.9)" })}"><div class="container-custom" style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "center", "flex-wrap": "wrap", "gap": "1rem", "font-size": "0.8rem", "color": "var(--text-dim)" })}"><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "0.5rem" })}"><span style="${ssrRenderStyle({ "font-weight": "700", "color": "var(--text-muted)" })}">Print3D Pro Hub</span><span>•</span><span>Gerenciamento 3D, Filamentos &amp; Marketplaces Brasil</span></div><div>${ssrInterpolate(unref(currentUser2) ? `Conectado como ${unref(currentUser2).email} • Dados na Nuvem (Firestore)` : "Modo Convidado Offline")}</div></div></footer></div>`);
      }
      if (toasts.length > 0) {
        _push(`<div class="toast-container"><!--[-->`);
        ssrRenderList(toasts, (t) => {
          _push(`<div class="toast"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>${ssrInterpolate(t.message)}</span></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    const status = Number(_error.statusCode || 500);
    const is404 = status === 404;
    const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-Cf5go_Ln.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-BjHoMHNL.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ status: unref(status), statusText: unref(statusText), statusCode: unref(status), statusMessage: unref(statusText), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    function invokeAppErrorHandler(err, target, info) {
      const errorHandler = nuxtApp.vueApp.config.errorHandler;
      if (errorHandler && !errorHandler.__nuxt_default) {
        try {
          errorHandler(err, target, info);
        } catch (handlerError) {
          console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
        }
      }
    }
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        invokeAppErrorHandler(err, target, info);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = ((ssrContext) => entry(ssrContext));

export { _export_sfc as _, useNuxtApp as a, useRuntimeConfig as b, nuxtLinkDefaults as c, entry_default as default, encodeRoutePath as e, navigateTo as n, resolveRouteObject as r, tryUseNuxtApp as t, useRouter as u };
//# sourceMappingURL=server.mjs.map
