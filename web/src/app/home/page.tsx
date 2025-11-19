'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Header from '@/components/Header';

import Image from 'next/image';
import testImg from '@/ImageTest/Test.jpg';
import swordTest from '@/ImageTest/Sword.png';
import '@/css/instructions.css';


export default function HomePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

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

        <div className='instructions'>
          <p>
            First users will click on create itinerary.
            <br/> Create Itinerary is the second option, next to home, at the top of the webstie.
            <br/> (Image of mouse clicking Create Itinerary)
          </p>
        </div>

        <div className='instructions'>
          <p>
            After you click on Create Itinerary you should be greeted with this screen:
          <br/>(image of Create Itinerary before location access has been allowed)
          </p>
        </div>

        <div className='instructions'>
          <p>
            You will be prompted to allow access to current locaiton.
          <br/>Click allow location to find venues you can add to your itinerary in your immediate vacinity, or choose to start entering a destination city into the search.
          <br/> (image of mouse clicking location access allowed)
          </p>
        </div>

        <div className='instructions'>
          <p>
            If you chose to enter a destination city into the search, watch for your option to be suggested as you type.
            <br/>Once you city is suggested, select it by clicking on it.
            <br/> (image of user typing in a location)
            </p>
        </div>

        <div className='instructions'>
          <p>
            After your city destination is determined, either through current location or search location:
          <br/> You will be provided with options for venues for the itinerary.
            <br/> (image of venues in lodging for example desitination)
          </p>
        </div>

        <div className='instructions'>
          <p>
            Of the venues you are provided you will be able to sort them by 3 catagories:
          <br/> Lodging, Dining, and Attractions.
          <br/>(image of focused view on catagories)
          </p>
        </div>

        <div className='instructions'>
          <p>Of the catagories, You can further sort the venues by subcatagories
            <br/>(image focus on filter options)
          </p>
        </div>

        <div className='instructions'>

          <p>
            Clicking on one of those venues will let you see more about it.
            <br /> Click add to itinerary to start creating your itinerary or click cancel to return to looking at other options.
            <br/>(Image of expanded venue card)
          </p>
          <Image className='image-container' src={testImg} alt="testing" />
        </div>


        <div className='instructions'>
          <p>After selecting add to itinerary, 
            <br/> select the start date, end date, start time, and end time for the venue
            <br/>(image of add to itinerary options)
          </p>
          <Image className='image-container' src={swordTest} alt="testing" />
        </div>

        <div className='instructions'>
          <p>After selecting the dates and times, 
            <br/> click (placeholder) to complete the process and add the venue to the itinerary
            <br/>(image of calendar with example data)
          </p>
          <Image className='image-container' src={testImg} alt="testing"/>
        </div>

        <div className='instructions'>
          <p>continue this process until you are satisfied with the calendar
          <br/> then click Save As
          <br/> (image of Save As button being clicked)  
            </p>
            <Image className='image-container' src={swordTest} alt="testing" />
        </div>

        <div className='instructions'>
          <p>After clicking Save As, 
            <br/> Name you itinerary
            <br/>(image of itinerary naming interface)
          </p>
          <Image className='image-container' src={testImg} alt="testing" />
        </div>

        <div className='instructions'>
          <p>After completing the naming process, 
            <br/> You have completed your itinerary
            
          </p>
          </div>

        <div className='instructions'>
          <p>To view your itinerary go to Itinerary List 
            <br/>(image of clicking on Itinerary List)
          </p>
          <Image className='image-container' src={testImg} alt="testing" />
        </div>
      </main >
    </>
  );
}
