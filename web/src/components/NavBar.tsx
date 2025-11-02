import Link from 'next/link';
import '@/css/navBar.css';

export default function NavBar({ onSignOut }: { onSignOut: () => void }) {
    return (
        <nav className='navBar'>
            <ul>
                <li>
                    <Link href={'/home'}>Home</Link>
                </li>
                <li>
                    <Link href={'/itineraryDetails'}>Itinerary Details</Link>
                </li>
                <li>
                    <Link href={'/itineraryList'}>Itinerary List</Link>
                </li>
                <li>
                    <button onClick={onSignOut}>Sign Out</button>
                </li>
            </ul>
        </nav>
    )
}