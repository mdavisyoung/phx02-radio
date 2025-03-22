'use client';

import { useRouter } from 'next/navigation';
import SubmitForm from '@/components/SubmitForm';

export default function SubmitPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/phx02-skel.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) saturate(1.2)',
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen bg-black/50 backdrop-blur-sm p-6">
        <SubmitForm
          onSubmitSuccess={() => {
            alert('Track submitted successfully! It will be reviewed by our team.');
            router.push('/');
          }}
        />
      </div>
    </div>
  );
} 