// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement, Fragment } from '@mini-react/core';
import { createRoot } from '../src';

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement('div');
});

describe('createRoot().render', () => {
  it('엘리먼트를 실제 DOM으로 그린다', () => {
    createRoot(container).render(<h1>Hello</h1>);
    expect(container.innerHTML).toBe('<h1>Hello</h1>');
  });

  it('중첩된 트리와 숫자 텍스트를 그린다', () => {
    createRoot(container).render(
      <ul>
        <li>a</li>
        <li>{1 + 1}</li>
      </ul>,
    );
    expect(container.innerHTML).toBe('<ul><li>a</li><li>2</li></ul>');
  });

  it('배열과 조건부 자식을 그린다', () => {
    const items = ['x', 'y'];
    const show = false;
    createRoot(container).render(
      <div>
        {items.map((i) => <span>{i}</span>)}
        {show && <b>hidden</b>}
      </div>,
    );
    expect(container.innerHTML).toBe('<div><span>x</span><span>y</span></div>');
  });

  it('Fragment는 래퍼 없이 자식만 그린다', () => {
    createRoot(container).render(
      <>
        <li>a</li>
        <li>b</li>
      </>,
    );
    expect(container.innerHTML).toBe('<li>a</li><li>b</li>');
  });

  it('className, id, data-*, aria-* 를 반영한다', () => {
    createRoot(container).render(<div id="app" className="box" data-x="1" aria-label="L" />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.id).toBe('app');
    expect(div.className).toBe('box');
    expect(div.getAttribute('data-x')).toBe('1');
    expect(div.getAttribute('aria-label')).toBe('L');
  });

  it('style 객체를 반영한다', () => {
    createRoot(container).render(<p style={{ color: 'red', fontSize: '12px' }} />);
    const p = container.firstElementChild as HTMLElement;
    expect(p.style.color).toBe('red');
    expect(p.style.fontSize).toBe('12px');
  });

  it('boolean 속성: true면 달고, false면 달지 않는다', () => {
    createRoot(container).render(
      <>
        <button disabled={true}>a</button>
        <button disabled={false}>b</button>
      </>,
    );
    const [a, b] = container.querySelectorAll('button');
    expect(a?.disabled).toBe(true);
    expect(b?.disabled).toBe(false);
  });

  it('input value는 property로 설정된다', () => {
    createRoot(container).render(<input value="hi" />);
    expect((container.firstElementChild as HTMLInputElement).value).toBe('hi');
  });

  it('onClick 핸들러를 연결한다', () => {
    const onClick = vi.fn();
    createRoot(container).render(<button onClick={onClick}>go</button>);
    (container.firstElementChild as HTMLButtonElement).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('다시 render하면 이전 DOM을 버리고 새로 만든다 (diff 없음 — 3단계에서 개선)', () => {
    const root = createRoot(container);
    root.render(<p>one</p>);
    const first = container.firstChild;
    root.render(<p>two</p>);
    expect(container.innerHTML).toBe('<p>two</p>');
    expect(container.firstChild).not.toBe(first); // 노드가 재사용되지 않음
  });

  it('unmount하면 비운다', () => {
    const root = createRoot(container);
    root.render(<p>x</p>);
    root.unmount();
    expect(container.innerHTML).toBe('');
  });

  it('함수 컴포넌트는 아직 명확한 에러를 낸다', () => {
    const App = () => <p>app</p>;
    expect(() => createRoot(container).render(<App />)).toThrow(/4단계/);
  });
});
