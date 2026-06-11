import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'QU4SAR | Valorant Premier Organization',
  description:
    'QU4SAR (QSR) - Organización competitiva de Valorant Premier. Academia, scrims, creación de contenido y esports de alto nivel.',
  keywords: 'QU4SAR, QSR, Valorant, Premier, Esports, Academia, Scrims, Gaming',
  openGraph: {
    title: 'QU4SAR | Valorant Premier',
    description: 'Organización competitiva de Valorant Premier',
    type: 'website',
    locale: 'es_MX',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#0A0A0A] text-white antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
