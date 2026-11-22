/**
 * 1단계: createElement
 *
 * JSX는 그냥 함수 호출의 문법 설탕이다.
 *   <div id="a">hi</div>  →  createElement('div', { id: 'a' }, 'hi')
 *
 * createElement는 "화면에 무엇을 그릴지"를 설명하는 순수한 데이터(객체)만 만든다.
 * DOM을 전혀 모른다. → 실제 반영은 renderer(2단계, packages/dom)의 책임.
 */

/** 진짜 엘리먼트인지 구별하는 표식. JSON에는 Symbol을 넣을 수 없어 XSS 주입을 막아준다. */
export const ELEMENT_TYPE: unique symbol = Symbol.for('mini-react.element');

/** 문자열/숫자 자식을 감싸는 특수 타입. renderer가 모든 자식을 같은 모양으로 다룰 수 있게 한다. */
export const TEXT_ELEMENT = 'TEXT_ELEMENT';

/** <>...</> 를 위한 타입. */
export const Fragment: unique symbol = Symbol.for('mini-react.fragment');

export type Key = string | number;

export type FunctionComponent<P = any> = (props: P) => Child;

export type ElementType = string | FunctionComponent | typeof Fragment;

export interface Props {
  children: MiniElement[];
  [prop: string]: unknown;
}

export interface MiniElement {
  $$typeof: typeof ELEMENT_TYPE;
  type: ElementType;
  key: Key | null;
  ref: unknown;
  props: Props;
}

/** 사용자가 자식으로 넘길 수 있는 모든 것. */
export type Child =
  | MiniElement
  | string
  | number
  | boolean
  | null
  | undefined
  | Child[];

const RESERVED = new Set(['key', 'ref', '__self', '__source']);

export function createElement(
  type: ElementType,
  config?: Record<string, unknown> | null,
  ...children: Child[]
): MiniElement {
  const props: Props = { children: [] };
  let key: Key | null = null;
  let ref: unknown = null;

  if (config != null) {
    // key/ref는 컴포넌트에 전달되는 props가 아니라 프레임워크가 쓰는 메타데이터다.
    if (config.key != null) key = String(config.key);
    if (config.ref !== undefined) ref = config.ref;

    for (const name in config) {
      if (Object.prototype.hasOwnProperty.call(config, name) && !RESERVED.has(name)) {
        props[name] = config[name];
      }
    }
  }

  // createElement(type, { children: x }) 형태도 지원 (자식 인자가 우선).
  const rawChildren: Child[] =
    children.length > 0
      ? children
      : config?.children !== undefined
        ? [config.children as Child]
        : [];

  props.children = normalizeChildren(rawChildren);

  return { $$typeof: ELEMENT_TYPE, type, key, ref, props };
}

/**
 * 자식을 renderer가 다루기 쉬운 형태로 정규화한다.
 * - 중첩 배열 평탄화 ({list.map(...)} 결과)
 * - null / undefined / boolean 제거 ({cond && <A/>} 패턴)
 * - string / number → TEXT_ELEMENT 로 감싸기
 *
 * 설계 결정: React는 원시값을 그대로 두지만, 여기서는 단순함을 위해
 * 생성 시점에 정규화한다. (docs/adr/0001-element-shape.md 참고)
 */
export function normalizeChildren(children: Child[], result: MiniElement[] = []): MiniElement[] {
  for (const child of children) {
    if (Array.isArray(child)) {
      normalizeChildren(child, result);
    } else if (child == null || typeof child === 'boolean') {
      continue;
    } else if (typeof child === 'string' || typeof child === 'number') {
      result.push(createTextElement(child));
    } else {
      result.push(child);
    }
  }
  return result;
}

export function createTextElement(text: string | number): MiniElement {
  return {
    $$typeof: ELEMENT_TYPE,
    type: TEXT_ELEMENT,
    key: null,
    ref: null,
    props: { nodeValue: String(text), children: [] },
  };
}

export function isValidElement(value: unknown): value is MiniElement {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { $$typeof?: unknown }).$$typeof === ELEMENT_TYPE
  );
}
