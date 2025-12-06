import { Suspense } from 'react';
import MedicalCertificatesContent from './MedicalCertificatesContent';

export default function MedicalCertificatesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MedicalCertificatesContent />
    </Suspense>
  );
}

