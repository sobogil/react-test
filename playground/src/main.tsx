import { createElement, Fragment } from '@mini-react/core';
import { createRoot } from '@mini-react/dom';

const root = createRoot(document.getElementById('app')!);

// 아직 useState가 없으므로(5단계) 상태를 바깥 변수에 두고 직접 다시 render한다.
let count = 0;
let text = '';

function update() {
  root.render(
    <>
      <h1>mini-react 2단계: render</h1>

      <section>
        <p>
          count: <b>{count}</b>
        </p>
        <button onClick={() => { count++; update(); }}>+1</button>
        <button onClick={() => { count = 0; update(); }} disabled={count === 0}>
          reset
        </button>
      </section>

      <section style={{ marginTop: '24px' }}>
        <p>
          ⚠️ 입력해 보세요. 한 글자마다 전체 DOM을 새로 만들기 때문에 포커스가 사라집니다.
          <br />→ 3단계(Reconciliation)에서 해결할 문제
        </p>
        <input
          value={text}
          placeholder="type here"
          onInput={(e: Event) => { text = (e.target as HTMLInputElement).value; update(); }}
        />
        <p>입력값: {text}</p>
      </section>
    </>,
  );
}

update();
