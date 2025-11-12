'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { createSupabaseClient } from '@/lib/shared/supabaseClient';
import Header from '@/components/Header';

export default function HomePage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } finally {
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith('sb-')) localStorage.removeItem(k);
        }
      } catch { }
      window.location.assign('/signin?signedout=1');
    }
  };

  return (
    <>
      <Header onSignOut={signOut} />
      <main style={{ padding: 16, maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 16 }}>
        <h1 style={{ textAlign: 'center' }}>Welcome Home!</h1>
        <p style={{ textAlign: 'center' }}>Welcome to Atlas Itinerary!</p>
        <h1 style={{ textAlign: 'center' }}>Our Purpose</h1>
        <p>This is a personal travel itinerary planner that helps people, like you, design detailed,
          time-slotted trips without the pressure of booking. You have successfully signed in, now for the fun part.
          You can build multiple trip plans, each focusing on a chosen destination. Within each trip,
          you can select your preferred lodging, restaurants, activities, and attractions,
          then schedule them into specific days and times to create a daily flow on the trip.</p>

        <h1 style={{ textAlign: 'center' }}>Congratulations, you have signed in! Now what?</h1>
        <p style={{ textAlign: 'center' }}>Now for what you came for, itinerary creation!!</p>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
          margin: "10px",
          height: "",
          width: "200px",
          border: "1px solid black",
          boxShadow: "0 2px 2px",
          transition: "background-color 0.5s ease-out"
        }}>
          <p>First users will click on create itinerary.</p>
          <p>Create Itinerary is the second option, next to home, at the top of the webstie.</p>
          <p>(Image of mouse clicking Create Itinerary)</p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
          margin: "10px",
          height: "",
          width: "200px",
          border: "1px solid black",
          boxShadow: "0 2px 2px",
          transition: "background-color 0.5s ease-out"
        }}>
          <p>After you click on Create Itinerary you should be greeted with this screen: </p>
          <p>(image of Create Itinerary before location access has been allowed)</p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
          margin: "10px",
          height: "",
          width: "200px",
          border: "1px solid black",
          boxShadow: "0 2px 2px",
          transition: "background-color 0.5s ease-out"
        }}>
          <p>You will be prompted to allow access to current locaiton.</p>
          <p>Click allow location to find venues you can add to your itinerary in your immediate vacinity, or choose to start entering a destination city into the search.</p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
          margin: "10px",
          height: "",
          width: "200px",
          border: "1px solid black",
          boxShadow: "0 2px 2px",
          transition: "background-color 0.5s ease-out"
        }}>
          <p>If you chose to enter a destination city into the search, watch for your option to be suggested as you type.</p>
          <p>Once you city is suggested, select it by clicking on it.</p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
          margin: "10px",
          height: "",
          width: "200px",
          border: "1px solid black",
          boxShadow: "0 2px 2px",
          transition: "background-color 0.5s ease-out"
        }}>
          <p>After your city destination is determined, either through current location or search location:</p>
          <p>You will be provided with options for venues for the itinerary.</p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
          margin: "10px",
          height: "",
          width: "200px",
          border: "1px solid black",
          boxShadow: "0 2px 2px",
          transition: "background-color 0.5s ease-out"
        }}>
          <p>Of the venues you are provided you will be able to sort them by 3 catagories:</p>
          <p>Lodging, Dining, and Attractions.</p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
          margin: "10px",
          height: "",
          width: "200px",
          border: "1px solid black",
          boxShadow: "0 2px 2px",
          transition: "background-color 0.5s ease-out"
        }}>
          <p>Of the catagories, You can further sort the venues by subcatagories</p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
          margin: "10px",
          height: "",
          width: "200px",
          border: "1px solid black",
          boxShadow: "0 2px 2px",
          transition: "background-color 0.5s ease-out"
        }}>
          <p>Clicking on one of those venues will let you see more about it.</p>
          <p>Click add to itinerary to start creating your itinerary or click cancel to return to looking at other options.</p>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
          margin: "10px",
          height: "",
          width: "200px",
          border: "1px solid black",
          boxShadow: "0 2px 2px",
          transition: "background-color 0.5s ease-out"
        }}>
          <p>After selecting add to itinerary, </p>
          <img src="C:\Users\User\Documents\Atlas-Itinerary\web\src\ImageTest\Test.jpg" alt="testing" width="500" height="600"></img>
        </div>

      </main >
    </>
  );
}
