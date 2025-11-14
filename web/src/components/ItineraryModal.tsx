import { useState, useEffect } from "react";
import { getLocations, LocationRow } from "@/lib/repos/locations";
import { ItineraryRow } from "@/lib/repos/itineraries"

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

import '@/css/itineraryModal.css'

export default function ItineraryModal({ open, itinerary, onClose, onDelete }: { open: boolean, itinerary: ItineraryRow | null, onClose: () => void, onDelete: (itineraryid: string) => void }) {
    const [locations, setLocations] = useState<LocationRow[]>();
    const [locationEvents, setLocationEvents] = useState<any[]>();
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

    useEffect(() => {
        if (!locations)
            return;

        let events: any[] = [];
        locations.map((lctn, i) => {
            events.push({ id: lctn.locationid, title: `Location ${i}`, start: `${lctn.startdate}T${lctn.starttime}`, end: `${lctn.enddate}T${lctn.endtime}` })
        })

        console.log(events);

        setLocationEvents(events);
    }, [locations])

    if (!open || !itinerary || !locations)
        return null;

    return (
        <div className="background">
            <div className="itineraryModal">
                <h2>{itinerary.name}</h2>
                <h2>{itinerary.traveldestination}</h2>
                <h3>Date: {itinerary.startdate} - {itinerary.enddate}</h3>
                <br />

                {loading ? <p>Loading Locations...</p> :
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin]}
                        initialView="dayGridMonth"
                        initialDate={itinerary.startdate !== null ? itinerary.startdate : undefined}
                        headerToolbar={{ start: 'title', center: '', end: 'today dayGridMonth timeGridDay prev,next' }}
                        height={'80%'}
                        events={locationEvents}
                        eventClick={function (info) {
                            // Basic popup when clicking event to display additional info
                            // eventually, will use placeID or something to get Google Maps Info maybe?
                            // Delete, Edit, and Close button
                            // Delete remove the location from events and updates locations table
                            // Edit, will allow for moving start and end according to constraints from Places Info
                            // Once edit is confirmed, update locations table
                            alert(`Title: ${info.event.title}\nStart: ${info.event.start}\nEnd: ${info.event.end}\nLocationID: ${info.event.id}`);
                        }}
                    />
                }

                <div className="buttons">
                    <button onClick={onClose}>Close</button>
                    <button onClick={() => onDelete(itinerary.itineraryid)}>Delete</button>
                </div>
            </div>
        </div>
    )
}