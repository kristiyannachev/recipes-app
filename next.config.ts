import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.RECIPES_NEXT_DIST_DIR ?? ".next",
  typescript: {
    tsconfigPath: process.env.RECIPES_TSCONFIG_PATH ?? "tsconfig.json",
  },
  reactCompiler: true,
};

export default nextConfig;
