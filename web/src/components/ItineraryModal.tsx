import { useState, useEffect } from "react";
import { getLocations, LocationRow } from "@/lib/repos/locations";
import { itinerayRow } from "@/lib/shared/types";
import '@/css/itineraryModal.css'

export default function ItineraryModal({ open, itinerary, onClose }: { open: boolean, itinerary: itinerayRow | null, onClose: () => void }) {
    const [locations, setLocations] = useState<LocationRow[]>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !itinerary)
            return;

        const fetchLocations = async () => {
            setLoading(true);
            try {
                const lctns = await getLocations(itinerary.itineraryid);

                setLocations(lctns);
            }
            catch (err) {
                console.log(err);
            }
            finally {
                setLoading(false);
            }
        }

        fetchLocations();
    }, [open, itinerary]);

    if (!open || !itinerary || !locations)
        return null;

    return (
        <div className="background">
            <div className="itineraryModal">
                <h2>{itinerary.name}</h2>
                <h2>{itinerary.traveldestination}</h2>
                <h3>Date: {itinerary.startdate} - {itinerary.enddate}</h3>

                <h4>Locations</h4>
                {loading ? <p>Loading Locations...</p> :
                    <ul> {locations.map(lctns =>
                        <li key={lctns.locationid}>placeid={lctns.placeid} date={lctns.startdate}-{lctns.enddate} time={lctns.starttime} {lctns.endtime}</li>
                    )}
                    </ul>
                }

                <button onClick={onClose}>close</button>
            </div>
        </div>
    )
}