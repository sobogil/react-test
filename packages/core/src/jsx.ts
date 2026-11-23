import type { MiniElement } from './element';

/**
 * TypeScript에게 JSX의 타입을 알려주는 선언.
 * - Element: JSX 식(<div/>)의 결과 타입 → createElement의 반환값
 * - IntrinsicElements: 소문자 태그(<div>, <button>)로 쓸 수 있는 것들과 그 props
 *
 * 지금은 모든 태그와 props를 허용한다. 태그별 정확한 타입은 나중 과제.
 */
declare global {
  namespace JSX {
    type Element = MiniElement;
    interface IntrinsicElements {
      [tag: string]: Record<string, unknown>;
    }
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}

export {};
