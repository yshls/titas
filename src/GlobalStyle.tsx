import { Global, css } from '@emotion/react';
import { theme } from './styles/theme';

const style = css`
  body {
    background-color: ${theme.background};
    color: ${theme.textMain};

    font-family: 'Lato', 'Noto Sans KR', sans-serif;
    transition:
      background-color 0.2s ease-in-out,
      color 0.2s ease-in-out;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: 'Lato', 'Noto Sans KR', sans-serif;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    /* 다크모드 전환 시 부드러운 색상 변화 */
    transition: background-color 0.6s ease-in-out, 
                border-color 0.6s ease-in-out, 
                color 0.6s ease-in-out;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
  }

  /* 키보드 포커스 링.
     원래 index.css에 있었는데 Emotion 마이그레이션(2ba9073) 때 파일이
     통째로 삭제되면서 같이 유실됐다. 컴포넌트마다 outline: none을 흩뿌리지
     말고 여기서만 관리한다.
     - :focus        → 마우스 클릭 시엔 링 숨김
     - :focus-visible → 키보드 탐색 시에만 링 표시 */
  *:focus {
    outline: none;
  }

  *:focus-visible {
    outline: 2px solid ${theme.colors.success};
    outline-offset: 2px;
  }

  /* react-calendar가 자체 CSS로 '.react-calendar button { outline: none }'을
     걸어둬서(우선순위 0-1-1) 위 전역 규칙(0-1-0)이 밀린다. 같은 값으로 덮는다. */
  .react-calendar button:focus-visible {
    outline: 2px solid ${theme.colors.success};
    outline-offset: 2px;
  }
`;

const GlobalStyle = () => {
  return <Global styles={style} />;
};

export default GlobalStyle;
