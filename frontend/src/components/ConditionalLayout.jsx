'use client';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

const HIDE_ON = ['/login', '/signup'];

export function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDE_ON.includes(pathname)) return null;
  return <Footer />;
}