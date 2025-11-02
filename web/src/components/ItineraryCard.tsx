import '@/css/itineraryCard.css'
import { itinerayRow } from '@/lib/shared/types';

export default function ItineraryCard({itinerary, clickExpand, clickDelete}:{itinerary: itinerayRow, clickExpand: (itinerary: itinerayRow) => void, clickDelete: (itineraryid: string) => void}) {
    return <div className="itineraryCard">
        <div className="itineraryInfo"  onClick={() => clickExpand(itinerary)}>
            <h2>{itinerary.name}</h2>
            <h2>{itinerary.traveldestination}</h2>
            <p>Date: {itinerary.startdate} - {itinerary.enddate}</p>
        </div>
        <button onClick={() => clickDelete(itinerary.itineraryid)}>Delele</button>
    </div>
}