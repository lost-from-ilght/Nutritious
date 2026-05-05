import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler requires babel-plugin-react-compiler which can cause
  // build issues on some deployment platforms — disabled for production safety
};

export default nextConfig;
