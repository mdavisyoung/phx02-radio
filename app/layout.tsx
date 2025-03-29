import './globals.css';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'PHX02 Radio',
  description: 'Underground music platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        <nav className="border-b border-gray-800">
          <div className="container mx-auto flex justify-between items-center px-4 py-2">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src="/images/phx02 main logo.jpg"
                alt="PHX02 Radio Logo"
                width={120}
                height={120}
                className="rounded-full"
                priority
              />
            </Link>
            <div className="space-x-6">
              <Link 
                href="/submit" 
                className="hover:text-gray-300 transition-colors"
              >
                Submit Song
              </Link>
              <Link 
                href="/admin" 
                className="hover:text-gray-300 transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-124px)]">
          {children}
        </main>
      </body>
    </html>
  );
} 