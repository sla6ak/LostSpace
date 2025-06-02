'use client';

import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AuthRouteProps {
  children: React.ReactNode;
}

export default function AuthRoute({ children }: AuthRouteProps) {
  const token = useSelector((state: any) => state.token);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isHomePage = pathname === '/';

    if (token.length > 9 && isHomePage) {
      router.push('/game');
    } else if (token.length < 9 && !isHomePage) {
      router.push('/');
    }
  }, [token, pathname, router]);

  return <>{children}</>;
}
