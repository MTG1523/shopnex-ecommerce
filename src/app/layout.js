import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'ShopNex — Premium Tech Store',
  description: 'Shop the latest tech gadgets, laptops, phones, and accessories. Fast shipping, easy returns, and amazing prices.',
  keywords: 'tech store, electronics, gadgets, laptops, phones, headphones',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
