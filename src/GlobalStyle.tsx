import { Global, css } from '@emotion/react';
import { theme } from './styles/theme';

const style = css`
  body {
    background-color: ${theme.modes.light.background};
    color: ${theme.modes.light.text};

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
