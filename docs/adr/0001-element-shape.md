# ADR 0001: 엘리먼트 객체의 모양

- 상태: 채택
- 날짜: 2026-11-22

## 배경
`createElement`는 renderer와 reconciler가 공통으로 쓰는 데이터 계약이다.
이 모양이 바뀌면 이후의 모든 단계가 영향을 받으므로 먼저 정해 둔다.

## 결정
```ts
{ $$typeof, type, key, ref, props: { ...rest, children: MiniElement[] } }
```
1. **자식은 항상 `props.children` 배열**에 넣고, 생성 시점에 정규화한다
   (평탄화, null/boolean 제거, 원시값은 `TEXT_ELEMENT`로 감싸기).
2. **`key`와 `ref`는 props에서 분리**한다. 컴포넌트가 아니라 프레임워크가 쓰는 값이기 때문이다.
3. **`$$typeof: Symbol`** 로 진짜 엘리먼트를 표시한다. 서버가 준 JSON이 엘리먼트로 둔갑하는 XSS를 막는다.

## 트레이드오프
- React는 원시값 자식을 그대로 두어 객체를 덜 만든다(메모리 효율이 좋다).
  우리는 renderer의 분기를 줄이기 위해 단순함을 택했다. 성능 단계에서 다시 검토한다.
- 생성 시점에 정규화하므로 `props.children`이 사용자가 넘긴 값과 다를 수 있다
  (React의 `Children` API와 다르다).
