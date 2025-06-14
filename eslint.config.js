import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

const eslintConfig = [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
    rules: {
      "no-unused-vars": ["error"], // 사용되지 않는 변수 검출
      "no-console": ["warn"], // console.log() 사용 제한
      eqeqeq: ["error", "always"], // === 및 !== 연산자 사용 강제
      "prefer-const": ["error"], // 재할당되지 않는 변수에 const 사용 강제
      "no-var": ["error"], // var 대신 let 또는 const 사용 강제
      curly: ["error", "all"], // 모든 제어문에 중괄호 사용 강제(화살표함수에 영향 미치지 않음)
      "no-debugger": ["warn"], // 디버거 사용 못하게
      "no-shadow": "warn", // 변수 섀도잉 방지(상위스코프와 동일한 하위스코프의 변수 네이밍)
      "no-magic-numbers": ["warn", { ignore: [0, 1] }], // 매직넘버 사용금지
      "no-multi-spaces": ["warn"], // 여러 개의 연속된 공백 금지
      "space-before-function-paren": ["warn", "never"], // 함수 앞 공백 정의
      "object-shorthand": ["warn", "always"], // Object에서 key/value 같을시 value 생략
      "no-trailing-spaces": ["warn"], // 불필요 공백 방지
    },
  },
];

export default eslintConfig;
