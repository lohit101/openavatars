import type { Metadata } from 'next';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenAvatars — Little faces. Big personalities.',
  description:
    'Free, open source animated blob avatars. Turn any username into a little character with expressive eyes and a personality of its own.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
