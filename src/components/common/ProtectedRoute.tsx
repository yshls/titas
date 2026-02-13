import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import toast from 'react-hot-toast';

const ProtectedRoute = () => {
  const user = useAppStore((state) => state.user);
  const initialized = useAppStore((state) => state.user !== undefined);

  if (!initialized) {
    //  사용자 정보 로딩 중...
    return null;
  }

  if (!user) {
    toast.error('로그인이 필요한 서비스입니다.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
