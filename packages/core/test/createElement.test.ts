import { describe, it, expect } from 'vitest';
import { createElement as h, Fragment, isValidElement, TEXT_ELEMENT } from '../src';

describe('createElement', () => {
  it('타입과 props를 담은 객체를 만든다', () => {
    const el = h('div', { id: 'app', className: 'box' });
    expect(el.type).toBe('div');
    expect(el.props).toEqual({ id: 'app', className: 'box', children: [] });
  });

  it('config가 null이어도 동작한다', () => {
    expect(h('span', null).props).toEqual({ children: [] });
  });

  it('문자열/숫자 자식을 TEXT_ELEMENT로 감싼다', () => {
    const el = h('p', null, 'hello', 42);
    expect(el.props.children.map((c) => c.type)).toEqual([TEXT_ELEMENT, TEXT_ELEMENT]);
    expect(el.props.children.map((c) => c.props.nodeValue)).toEqual(['hello', '42']);
  });

  it('중첩된 엘리먼트 트리를 표현한다', () => {
    const el = h('ul', null, h('li', null, 'a'), h('li', null, 'b'));
    expect(el.props.children).toHaveLength(2);
    expect(el.props.children[1]?.props.children[0]?.props.nodeValue).toBe('b');
  });

  it('배열 자식을 평탄화한다 (list.map 패턴)', () => {
    const items = ['a', 'b', 'c'];
    const el = h('ul', null, items.map((x) => h('li', { key: x }, x)), 'tail');
    expect(el.props.children).toHaveLength(4);
  });

  it('null, undefined, boolean 자식은 제거한다 (cond && <A/> 패턴)', () => {
    const el = h('div', null, null, undefined, false, true, 'ok');
    expect(el.props.children).toHaveLength(1);
  });

  it('0은 제거하지 않는다', () => {
    expect(h('div', null, 0).props.children[0]?.props.nodeValue).toBe('0');
  });

  it('key와 ref는 props가 아니라 엘리먼트에 저장한다', () => {
    const ref = { current: null };
    const el = h('li', { key: 1, ref, title: 't' });
    expect(el.key).toBe('1');
    expect(el.ref).toBe(ref);
    expect(el.props).toEqual({ title: 't', children: [] });
  });

  it('함수 컴포넌트와 Fragment를 타입으로 받을 수 있다', () => {
    const App = () => null;
    expect(h(App, { name: 'x' }).type).toBe(App);
    expect(h(Fragment, null, 'a').type).toBe(Fragment);
  });

  it('config.children도 지원하되, 인자로 넘긴 자식이 우선한다', () => {
    expect(h('div', { children: 'x' }).props.children[0]?.props.nodeValue).toBe('x');
    expect(h('div', { children: 'x' }, 'y').props.children[0]?.props.nodeValue).toBe('y');
  });

  it('isValidElement는 진짜 엘리먼트만 인정한다', () => {
    expect(isValidElement(h('div', null))).toBe(true);
    // 서버 JSON 등에서 들어온 가짜 객체 (Symbol은 JSON에 담을 수 없음)
    expect(isValidElement(JSON.parse('{"type":"div","props":{}}'))).toBe(false);
    expect(isValidElement('div')).toBe(false);
  });
});
