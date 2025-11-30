'use client';

import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Header from '@/components/Header';

import heroBackground from '@/ImageTest/Home.jpg';
import '@/css/home.css';

export default function HomePage() {
  const supabase = createSupabaseBrowserClient();

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } finally {
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith('sb-')) localStorage.removeItem(k);
        }
      } catch {}
      window.location.assign('/signin?signedout=1');
    }
  };

  return (
    <>
      <Header onSignOut={signOut} />

      {/* HERO SECTION  */}
      <section className="hero">
        <Image
          src={heroBackground}
          alt="Atlas Itinerary Background"
          fill
          priority
          className="hero-img"
        />

        <div className="hero-content">
          <h1>Welcome to Atlas Itinerary</h1>
           <p className="hero-subtitle">Plan the Journey, Live the Experience.</p>

          <Link href="/instructions" className="instruction-link">
            View Instructions →
          </Link>
        </div>
      </section>

      {/* PURPOSE STATEMENT  */}
      <section className="purpose">
        <h2>Our Purpose</h2>
        <p>
          Atlas Itinerary is a personal travel planner that helps you design
          detailed, time-slotted trips without the pressure of booking.
          Create multiple trip plans based on your destination, choose lodging,
          restaurants, activities, and organize everything into a smooth schedule.
        </p>
      </section>
    </>
  );
}
