/**
 * 2단계: render
 *
 * core가 만든 "설명서"(MiniElement 트리)를 읽고 실제 DOM 노드를 만든다.
 * core는 DOM을 모르고, DOM은 이 패키지만 안다. (core ↔ renderer 분리)
 *
 * 지금 구현은 의도적으로 단순하다:
 * - 재귀로 트리 전체를 한 번에 그린다 (큰 트리면 그동안 화면이 멈춘다 → 6단계 Fiber)
 * - 다시 render하면 기존 DOM을 전부 버리고 새로 만든다 (입력 포커스/스크롤이 사라진다 → 3단계 diff)
 */
import { Fragment, TEXT_ELEMENT, type MiniElement } from '@mini-react/core';

export interface Root {
  render(element: MiniElement): void;
  unmount(): void;
}

export function createRoot(container: Element): Root {
  return {
    render(element) {
      // 기존 내용을 모두 지우고 처음부터 다시 만든다 (diff 없음)
      container.replaceChildren(...createNodes(element));
    },
    unmount() {
      container.replaceChildren();
    },
  };
}

/** 엘리먼트 하나 → DOM 노드 0개 이상. (Fragment는 여러 개를 낼 수 있다) */
function createNodes(element: MiniElement): Node[] {
  const { type, props } = element;

  if (type === TEXT_ELEMENT) {
    return [document.createTextNode(String(props.nodeValue))];
  }

  if (type === Fragment) {
    // 래퍼 노드 없이 자식들의 노드만 그대로 반환
    return props.children.flatMap(createNodes);
  }

  if (typeof type === 'function') {
    throw new Error(
      `함수 컴포넌트(${type.name || 'anonymous'})는 아직 지원하지 않습니다. (4단계에서 구현)`,
    );
  }

  const dom = document.createElement(type);
  for (const [name, value] of Object.entries(props)) {
    if (name !== 'children') setProp(dom, name, value);
  }
  for (const child of props.children) {
    dom.append(...createNodes(child));
  }
  return [dom];
}

/**
 * JSX props → DOM 반영 규칙.
 * DOM에는 "속성(attribute, HTML에 적힌 값)"과 "프로퍼티(property, JS 객체의 필드)"가 따로 있다.
 */
export function setProp(dom: HTMLElement, name: string, value: unknown): void {
  // 1) 이벤트: onClick → addEventListener('click')
  if (name.startsWith('on') && typeof value === 'function') {
    dom.addEventListener(name.slice(2).toLowerCase(), value as EventListener);
    return;
  }

  // 2) style 객체: { fontSize: '12px' } → dom.style.fontSize = '12px'
  if (name === 'style' && typeof value === 'object' && value !== null) {
    Object.assign(dom.style, value);
    return;
  }

  // 3) 값이 없거나 false면 속성을 달지 않는다 (disabled={false} → disabled 없음)
  if (value == null || value === false) return;

  // 4) DOM 프로퍼티로 존재하면 프로퍼티로 설정 (className, value, checked, id ...)
  //    value처럼 사용자가 바꾸는 "현재 상태"는 attribute가 아니라 property에 있다.
  if (name in dom) {
    (dom as unknown as Record<string, unknown>)[name] = value;
    return;
  }

  // 5) 나머지(data-*, aria-*, 커스텀 속성)는 attribute로
  dom.setAttribute(name, value === true ? '' : String(value));
}
