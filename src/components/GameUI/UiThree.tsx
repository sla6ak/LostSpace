'use client';

import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

export default function UiThree({ children }: any) {
  const inbattle = useSelector((state: RootState) => state.heroSlice.inbattle);
  return <>{children(inbattle) as boolean}</>;
}
