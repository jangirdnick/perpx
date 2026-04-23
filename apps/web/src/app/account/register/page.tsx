'use client';

import AuthForm from '../../../modules/auth/components/auth.form';
import Leftside from '../../../modules/auth/components/leftside';

export default function RegisterPage() {
  return (
    <section className="w-full h-screen bg-black grid lg:grid-cols-2 lg:gap-1 p-2 overflow-hidden">
      {/* Let section */}
      <Leftside />

      {/* Right section */}
      <AuthForm type="Register" />
    </section>
  );
}
