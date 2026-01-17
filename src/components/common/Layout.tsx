import styled from '@emotion/styled';
import { type ReactNode } from 'react';

// 스타일 정의
const Container = styled.div`
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
`;

// 타입 정의
interface LayoutProps {
  children: ReactNode;
}

// 컴포넌트 완성
const Layout = ({ children }: LayoutProps) => {
  return <Container>{children}</Container>;
};
export default Layout;
