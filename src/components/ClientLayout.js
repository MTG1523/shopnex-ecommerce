'use client';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import CartPanel from '@/components/CartPanel';
import ToastContainer from '@/components/ToastContainer';

export default function ClientLayout({ children }) {
  return (
    <AppProvider>
      <Navbar />
      <CartPanel />
      <ToastContainer />
      <main>{children}</main>
    </AppProvider>
  );
}
