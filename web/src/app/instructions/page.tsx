'use client';

import Header from '@/components/Header';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';

import testImg from '@/ImageTest/Test.jpg';
import swordTest from '@/ImageTest/Sword.png';
import clickCreate from '@/ImageTest/ClickCreate.png'
import locationRequest from '@/ImageTest/BeforeLocationAccess.png';
import locationAllow from '@/ImageTest/AllowLocationAccess.png'
import typingLocation from '@/ImageTest/TypingLocation.png'
import loadingVenues from '@/ImageTest/LoadedVenues.png'
import focusedCatagories from '@/ImageTest/FocusedCatagories.png'
import venueDetails from '@/ImageTest/VenueDetails.png'
import StartDate from '@/ImageTest/StartDate.png'
import StartTime from '@/ImageTest/StartTime.png'
import EndTime from '@/ImageTest/EndTime.png'
import ViewItinerary from '@/ImageTest/ViewItinerary.png'

import '@/css/home.css';

export default function InstructionsPage() {
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

      <main className="instructions-page">
        {/* 🔹 STICKY TOP BAR */}
        <div className="instructions-header">
          <h1>How to Use Atlas Itinerary</h1>
          <Link href="/home" className="back-link">
            ← Back to Home
          </Link>
        </div>

        {/* 🔹 LAYOUT: sidebar + content */}
        <div className="instructions-layout">
          <aside className="steps-index">
            <h2>Steps</h2>
            <ol>
              <li><a href="#step-1">Create an Itinerary</a></li>
              <li><a href="#step-2">Allow Location or Search</a></li>
              <li><a href="#step-3">Choose Your Destination</a></li>
              <li><a href="#step-4">Browse Venues</a></li>
              <li><a href="#step-5">Filter by Category</a></li>
              <li><a href="#step-6">Use Subcategories</a></li>
              <li><a href="#step-7">View Venue Details</a></li>
              <li><a href="#step-8">Add to Itinerary</a></li>
              <li><a href="#step-9">Set Dates & Times</a></li>
              <li><a href="#step-10">Build Out Your Itinerary</a></li>
              <li><a href="#step-11">Name Your Itinerary</a></li>
              <li><a href="#step-12">View Your Itinerary</a></li>
            </ol>
          </aside>

          {/* Right content */}
          <section className="instruction-sections">
            <div id="step-1" className="instructions step-card">
              <h3>Step 1: Create an Itinerary</h3>
              <p>
                From the top navigation bar, click <strong>Create Itinerary</strong>.
                This is the second option, next to Home, at the top of the website.
                {/*<br />(image of Create Itinerary before location access has been allowed)*/}
              
              <Image className="image-container" src={clickCreate} alt="Example venue card" />
              </p>
            </div>

            <div id="step-2" className="instructions step-card">
              <h3>Step 2: Allow Location Access or Search Manually</h3>
              <p>
                You will be prompted to allow access to your current location.
                Click <strong>Allow</strong> to find venues near you, or start entering a destination city
                into the search bar instead.
               {/* <br />(image of mouse clicking location access allowed)*/}
              </p>
              <Image className="image-container" src={locationAllow} alt="Example venue card" />
            </div>

            <div id="step-3" className="instructions step-card">
              <h3>Step 3: Choose Your Destination</h3>
              <p>
                If you choose to enter a destination city, watch for your option to be suggested as you type.
                Once your city is suggested, select it by clicking on it.
               {/* <br />(image of user typing in a location)*/}
              </p>
              <Image className="image-container" src={typingLocation} alt="Example venue card" />
            </div>

            <div id="step-4" className="instructions step-card">
              <h3>Step 4: Browse Available Venues</h3>
              <p>
                After your destination is determined—either through current location or search—you&apos;ll be
                provided with venue options to add to your itinerary.
               {/*} <br />(image of venues in lodging for example destination)*/}
              </p>
              <Image className="image-container" src={loadingVenues} alt="Example venue card" />
            </div>

            <div id="step-5" className="instructions step-card">
              <h3>Step 5: Filter by Category</h3>
              <p>
                You can sort venues by three main categories:
                <br /><strong>Lodging</strong>, <strong>Dining</strong>, and <strong>Attractions</strong>.
               {/* <br />(image of focused view on categories)*/}
              </p>
              <Image className="image-container" src={focusedCatagories} alt="Example venue card" />
            </div>

            {/*<div id="step-6" className="instructions step-card">
              <h3>Step 6: Use Subcategory Filters</h3>
              <p>
                Within each category, you can further refine venues using subcategory filters.
                <br />(image focus on filter options)
              </p>
              <Image className="image-container" src={loadingVenues} alt="Example venue card" />
            </div>*/}

            <div id="step-7" className="instructions step-card">
              <h3>Step 7: View Venue Details</h3>
              <p>
                Clicking on a venue lets you see more about it.
                Click <strong>Add to Itinerary</strong> to start building your plan with that venue,
                or click <strong>Close</strong> to continue browsing.
                {/*<br />(image of expanded venue card)*/}
              </p>
              <Image className="image-container" src={venueDetails} alt="Example venue card" />
              <p>You&apos;ll also be asked to choose when
                this venue should appear in your trip. </p>
            </div>

            {/*<div id="step-8" className="instructions step-card">
              <h3>Step 8: Add the Venue to Your Itinerary</h3>
              <p>
                After selecting <strong>Add to Itinerary</strong>, you&apos;ll be asked to choose when
                this venue should appear in your trip.
                <br />(image of add to itinerary options)
              </p>
              <Image className="image-container" src={swordTest} alt="Add to itinerary options" />
            </div>*/}

            <div id="step-9" className="instructions step-card">
              <h3>Step 9: Set Dates and Times</h3>
              <p>
                Select the <strong>start date</strong>, <strong>end date</strong>
               {/* <br />(image of calendar with example data)*/}
              </p>
              <Image className="image-container" src={StartDate} alt="Calendar example" />
              <p><strong>start time</strong></p>
              <Image className="image-container" src={StartTime} alt="Calendar example" />
              <p>and <strong>end time</strong></p>
              <Image className="image-container" src={EndTime} alt="Calendar example" />
              <p>Once everything looks correct, you&apos;re ready to add it to your calendar.</p>
            </div>

            <div id="step-10" className="instructions step-card">
              <h3>Step 10: Build Out Your Itinerary</h3>
              <p>
                Continue adding venues and assigning dates and times until you&apos;re satisfied with your trip.
                {/*Then click <strong>Save As</strong>.
                <br />(image of Save As button being clicked)
              </p>
              <Image className="image-container" src={swordTest} alt="Save itinerary" />*/}
              </p>
            </div>

            {/*<div id="step-11" className="instructions step-card">
              <h3>Step 11: Name Your Itinerary</h3>
              <p>
                After clicking <strong>Save As</strong>, give your itinerary a clear name so you can identify it
                later.
                <br />(image of itinerary naming interface)
              </p>
              <Image className="image-container" src={testImg} alt="Naming itinerary" />
            </div>*/}

            <div id="step-12" className="instructions step-card">
              <h3>Step 12: View Your Itinerary</h3>
              <p>
                To view your itinerary, go to <strong>Itinerary List</strong> in the navigation bar.
                {/*<br />(image of clicking on Itinerary List)*/}
              </p>
              <Image className="image-container" src={ViewItinerary} alt="Itinerary list" />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
