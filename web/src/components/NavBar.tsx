import { useState } from 'react';
import Link from 'next/link';
import '@/css/navBar.css';


type NavBarProps = {
  onSignOut: () => void;
  currentLocation?: string; // e.g. "Dallas, TX"
  email?: string;           // e.g. "user@example.com"
};

export default function NavBar({ onSignOut, currentLocation, email }: NavBarProps) {
    const [open, setOpen] = useState(false);

    return (
        <nav className='navBar'>
            <ul>
                <li><Link href="/home">Home</Link></li>
                <li><Link href="/itineraryDetails">Itinerary Details</Link></li>
                <li><Link href="/itineraryList">Itinerary List</Link></li>

                <li className="dropdown">
                    <span 
                        className="dropbtn" 
                        onClick={() => setOpen(prev => !prev)}
                    >
                        Account ▾
                    </span>

                    <div className={`content ${open ? "open" : ""}`}>
                        {/* Location row */}
                        <div className="dropdown-item">
                            <span className="dropdown-icon">📍</span>
                            <span className="dropdown-text">
                                {currentLocation || 'Location unavailable'}
                            </span>
                        </div>

                        {/* Email row */}
                        <div className="dropdown-item">
                            <span className="dropdown-icon">📧</span>
                            <span className="dropdown-text">
                                {email || 'Email unavailable'}
                            </span>
                        </div>

                        {/* Sign out */}
                        <button onClick={onSignOut}>Sign Out</button>
                    </div>
                </li>
            </ul>
        </nav>
    );
}
