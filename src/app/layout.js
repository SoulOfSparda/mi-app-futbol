import { Bebas_Neue, DM_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'MiFutbolitoFc — Liga BetPlay & Premier League',
  description:
    'Tu portal de fútbol con resultados, tablas de posiciones, equipos y jugadores de la Liga BetPlay y la Premier League.',
  keywords: ['fútbol', 'Liga BetPlay', 'Premier League', 'resultados', 'posiciones'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body>
        <Navbar />
        <main style={{ paddingTop: 'var(--navbar-height)' }}>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
