import '@/css/itineraryCard.css'
import { ItineraryRow } from '@/lib/repos/itineraries'

export default function ItineraryCard({ itinerary, clickExpand }: { itinerary: ItineraryRow, clickExpand: (itinerary: ItineraryRow) => void }) {
    return <div className="itineraryCard" onClick={() => clickExpand(itinerary)}>
        <div className="itineraryInfo">
            <h2>{itinerary.name}</h2>
            <h2>{itinerary.traveldestination}</h2>
            <p>Date: {itinerary.startdate} to {itinerary.enddate}</p>
        </div>
    </div>
}