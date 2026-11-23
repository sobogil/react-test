# ADR 0002: Fragment를 Symbol 대신 함수로

- 상태: 채택 (ADR 0001의 Fragment 부분을 대체)
- 날짜: 2026-11-23

## 배경
1단계에서 `Fragment`를 `Symbol.for('mini-react.fragment')`로 만들었다.
2단계에서 TSX로 `<>...</>`를 쓰자 타입 검사가 실패했다.

```
error TS2604: JSX element type '<>' does not have any construct or call signatures.
```

TypeScript는 JSX 태그 자리에 문자열이 아닌 값이 오면 **호출 가능한 함수(또는 클래스)** 이길 요구한다.
`JSX.ElementType`을 지정해도 Symbol은 허용되지 않았다.

## 선택지
1. **React 방식**: 런타임은 Symbol로 두고, 타입만 "호출 가능한 컴포넌트"라고 선언한다.
   타입이 실제 값과 다르다(타입이 거짓말을 한다).
2. **Preact 방식**: `Fragment`를 `props => props.children`인 진짜 함수로 만든다.
3. TSX에서 `<>`를 금지한다. 사용성이 너무 나빠서 제외했다.

## 결정
2번(Preact 방식)을 택한다.
- 타입과 런타임 값이 일치한다.
- `ElementType`이 `string | FunctionComponent` 두 가지로 단순해진다.
- 4단계에서 함수 컴포넌트를 지원하면, renderer가 Fragment를 특별 취급하지 않아도
  "자식을 반환하는 컴포넌트"로 동작한다.
- 라이브러리 사본이 두 개 로드되면 `type === Fragment` 비교는 실패한다.
  하지만 그 경우에도 일반 함수 컴포넌트로 실행되므로 결과는 같다.
  Symbol 방식에서 얻던 이점을 다른 방식으로 대체하는 셈이다.

## 트레이드오프
- 렌더러는 `type === Fragment`를 함수 컴포넌트 검사보다 **먼저** 해야
  래퍼 없는 최적 경로를 탄다.
- 엘리먼트를 판별하는 `ELEMENT_TYPE`은 계속 Symbol로 둔다. 이건 JSX 태그 자리에 쓰이지 않는다.
