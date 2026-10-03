import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'LaunchReady AI — Product Campaign Studio', description: 'Turn one product image into a complete, channel-ready creative campaign with Cloudinary.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
