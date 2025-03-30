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
        {/* Background pattern container */}
        <div 
          className="fixed inset-0 z-0 opacity-10"
          style={{
            backgroundImage: 'url(/images/phx02 main logo.jpg)',
            backgroundSize: '150px',
            backgroundRepeat: 'repeat',
            filter: 'grayscale(100%)',
            transform: 'rotate(45deg)',
          }}
        />
        
        {/* Content container with relative positioning */}
        <div className="relative z-10">
          <nav className="border-b border-gray-800">
            <div className="container mx-auto flex justify-between items-center px-4 py-2">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <div className="w-[120px] h-[120px] relative">
                  <Image
                    src="/images/phx02 main logo.jpg"
                    alt="PHX02 Radio Logo"
                    fill
                    sizes="120px"
                    style={{ objectFit: 'cover' }}
                    className="rounded-full"
                    priority
                  />
                </div>
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
        </div>
      </body>
    </html>
  );
} 