import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "src/generated/prisma/**"],
  },
  ...nextVitals,
];

export default config;
