import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import '@/css/navBar.css';
import { User } from '@supabase/supabase-js';


type NavBarProps = {
    onSignOut: () => void;
    currentLocation?: string; // e.g. "Dallas, TX"
    email?: string;           // e.g. "user@example.com"
};

export default function NavBar({ onSignOut, currentLocation, email }: NavBarProps) {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<User>();
    const [avatarUrl, setAvatarUrl] = useState<string>();

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getSession();

            if (data.session?.user) {
                //console.log(data.session.user);
                //console.log(data.session.user.user_metadata.avatar_url);
                setUser(data.session.user);
                setAvatarUrl(data.session.user.user_metadata.avatar_url);
            }
        }

        fetchUser();
    }, [])

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
                        <div className='dropdown-item'>
                            {avatarUrl && <img src={avatarUrl} alt='userImg' className='avatarImg' />}
                            <span className='dropdown-text'>
                                {user?.user_metadata.full_name}
                            </span>
                        </div>

                        {/* Email row */}
                        <div className="dropdown-item">
                            <span className="dropdown-icon">📧</span>
                            <span className="dropdown-text">
                                {user?.user_metadata.email}
                            </span>
                        </div>

                        {/* Location row */}
                        <div className="dropdown-item">
                            <span className="dropdown-icon">📍</span>
                            <span className="dropdown-text">
                                {currentLocation || 'Location unavailable'}
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
