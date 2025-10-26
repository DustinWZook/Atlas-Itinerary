import '@/css/itineraryCard.css'
import { getLocations } from '@/lib/repos/locations'

async function alertClick(itineraryid : string) {
    try {
        const locations = await getLocations(itineraryid);
        let locationsStr = '';

        if (locations.length <= 0) {
            alert("No Locations Added to Itinerary...");
        }
        else {
            for (let i = 0; i < locations.length; i++) {
            locationsStr += `${i+1}: tripid=${locations[i].placeid} startdate=${locations[i].startdate} enddate=${locations[i].enddate} starttime=${locations[i].starttime} endtime=${locations[i].endtime}`;
            if (i != locations.length - 1) {
                locationsStr += '\n\n';
            }
        }

        alert(locationsStr);
        }
    }
    catch(err) {}
}

export function ItineraryCard({itinerary}: any) {
    return <div className="itineraryCard">
        <div className="itineraryInfo" onClick={() => {alertClick(itinerary.itineraryid)}}>
            <h2>{itinerary.name}</h2>
            <h2>{itinerary.traveldestination}</h2>
            <p>Date: {itinerary.startdate} - {itinerary.enddate}</p>
        </div>
    </div>
}

export default ItineraryCard;