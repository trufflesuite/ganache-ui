/**
 By default, vite optimizes and packs all the necessary dependencies into your bundle,
 so there is no need to supply them in your application as a node module.
 Unfortunately, vite cannot optimize any dependencies:
 Some that are designed for a node environment may not work correctly after optimization.
 Therefore, such dependencies should be marked as "external":
 they will not be optimized, will not be included in your bundle, and will be delivered as a separate node module.
*/
export const external = [
  "electron",
  "pg-native"
];

export const builtins = [
  "assert",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "inspector",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "timers",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "zlib",
];

export default [
  ...builtins,
  ...external,
];
