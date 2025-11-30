import '@/css/header.css';
import NavBar from '@/components/NavBar';
import Image from 'next/image';
import Logo from '@/ImageTest/Logo.png';

export default function Header({ onSignOut }: { onSignOut: () => void }) {
    return (
        <header className="mainHeader">
            <div className="brand">
                <Image
                    src={Logo}
                    alt="Atlas Itinerary Logo"
                    className="Logo"
                    priority
                />
                <h1><i>Atlas Itinerary</i></h1>
            </div>

            <NavBar onSignOut={onSignOut} />
        </header>
    );
}
