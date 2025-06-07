'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useFetchUser from '@/hooks/useFetchUser';

interface AuthRouteProps {
  children: React.ReactNode;
}

export default function AuthRoute({ children }: AuthRouteProps) {
  const { user, hero } = useFetchUser();

  const token = useSelector((state: any) => state.token);
  const router = useRouter();

  useEffect(() => {
    // console.log(`User loaded:`, user, hero);
    if (token.length > 9 && user?.id) {
      router.push('/game');
    } else if (token.length < 9 && !user?.id) {
      router.push('/');
    }
    // if (user && user?.nikName) {
    //   console.log(`User loaded:`, user);
    // }
  }, [token, router, user]);

  return <>{children}</>;
}
