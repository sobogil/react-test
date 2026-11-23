/**
 * JSX → createElement 변환 설정 (Vite 8 / Vitest 공통).
 * <div/>  →  createElement('div', null)
 * <></>   →  createElement(Fragment, null)
 * classic 런타임이라 각 파일에서 createElement, Fragment를 import해야 한다.
 */
export const jsxOxc = {
  jsx: {
    runtime: 'classic' as const,
    pragma: 'createElement',
    pragmaFrag: 'Fragment',
  },
};
