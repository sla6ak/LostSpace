import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIsActivTokenQuery, useGetHeroQuery } from '@/redux/api/API';
import { setUser } from '@/redux/slices/sliceUser';
import { setHero } from '@/redux/slices/sliceStateHero';
import { toast } from 'react-toastify';

const useFetchUser = () => {
  const { token } = useSelector((state: any) => state);
  const dispatch = useDispatch();

  // Не делаем запрос, если токена нет
  const skip = !token;
  const { data: user, error: errorAuth } = useIsActivTokenQuery(undefined, { skip });
  const { data: hero, error: errorHero } = useGetHeroQuery(undefined, { skip });

  useEffect(() => {
    if (skip) return;
    if (errorAuth) {
      console.error('Authentication error:', errorAuth);
      return;
    }
    if (!user) return;
    if (!hero) return;
    // Обновляем только учётные данные
    dispatch(
      setUser({
        id: user.id,
        nikName: user.nikName,
        email: user.email,
        online: user.online,
        registrationDate: user.registrationDate,
      })
    );
    dispatch(setHero(hero as any));
    toast.success(`Welcome ${user.nikName}`);
  }, [user, dispatch, skip, errorAuth, hero, errorHero]);
  return { user, hero };
};

export default useFetchUser;
