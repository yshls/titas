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
`;

const GlobalStyle = () => {
  return <Global styles={style} />;
};

export default GlobalStyle;
