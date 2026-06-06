/** @type {import('next').NextConfig} */
export default {
  eslint: { ignoreDuringBuilds: true },
  // React Compiler 1.0 — automatyczna memoizacja (mniej zbędnych re-renderów).
  reactCompiler: true,
};
