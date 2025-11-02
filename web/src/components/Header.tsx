import '@/css/header.css';
import NavBar from '@/components/NavBar';

export default function Header({onSignOut} : {onSignOut: () => void}) {
    return (
        <header className='mainHeader'>
            <h1><i>Atlas Itinerary</i></h1>

            <NavBar onSignOut={onSignOut}/>
        </header>
    )
}