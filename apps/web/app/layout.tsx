import type { Metadata } from 'next';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenAvatars — Little faces. Big personalities.',
  description:
    'Free, open source animated SVG avatars for JavaScript and React. Install one package, pass a username, and give your app a little character.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
