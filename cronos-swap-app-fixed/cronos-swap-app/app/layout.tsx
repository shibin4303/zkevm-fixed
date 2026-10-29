import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Orbit Swap — Cronos zkEVM',
  description: 'Independent, non-custodial token swap interface for Cronos zkEVM.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
