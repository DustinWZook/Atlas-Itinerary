import { useState, useEffect } from "react";
import { getLocations, LocationRow, removeItineraryLocation } from "@/lib/repos/locations";
import { ItineraryRow } from "@/lib/repos/itineraries";
import CalendarEventModal from '@/components/CalendarEventModal';
import { PlaceDetails } from "@/lib/shared/types";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { EventClickArg } from "@fullcalendar/core/index.js";

import '@/css/itineraryModal.css'

export default function ItineraryModal({ open, itinerary, onClose, onDelete }: { open: boolean, itinerary: ItineraryRow | null, onClose: () => void, onDelete: (itineraryid: string) => void }) {
    // Object that stores PlaceDetails. Can be searched using placeID
    // Should store details as calls to places API are made. Once stored, locations that have placeid equal to stored placeid
    // should NOT make calls to the places API. Calls should only be made when an itinerary first opens,
    // repeat openings of an itinerary should NOT make calls to places API.
    const [placesDetails, setPlacesDetails] = useState<{ [placeID: string]: PlaceDetails }>({});

    // Object is used so locationID can be used to get rows
    const [locations, setLocations] = useState<{ [locationID: string]: LocationRow }>({});

    type locationEvent = {
        id: string;
        title: string;
        start: string;
        end: string;
    }
    // array passed so FullCalendar Events are populated
    const [locationEvents, setLocationEvents] = useState<locationEvent[]>([]);

    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventClickArg>();
    const [selectedDetails, setSelectedDetails] = useState<PlaceDetails>();

    useEffect(() => {
        if (!open || !itinerary)
            return;

        const fetchLocations = async () => {
            setLoading(true);
            try {
                const lctnsArr = await getLocations(itinerary.itineraryid);

                let plsDets = placesDetails;
                let lctns: { [locationID: string]: LocationRow } = {};
                let events: locationEvent[] = [];

                // Gets placeDetails for each location on the selected itinerary
                for (const lctn of lctnsArr) {
                    let locationID: string;
                    lctn.locationid ? locationID = lctn.locationid : locationID = '';

                    lctns[locationID] = lctn;

                    // if placeid key is not in placesDetails, make api call and add it to record
                    if (!(lctn.placeid in plsDets)) {
                        // console.log("Calling Places API");
                        const response = await fetch(`/api/locations/${encodeURIComponent(lctn.placeid)}`);

                        const details: PlaceDetails = await response.json();

                        plsDets[lctn.placeid] = details;
                    }

                    // generate events array from locations for calendar
                    events.push({
                        id: locationID, title: plsDets[lctn.placeid].name,
                        start: `${lctn.startdate}T${lctn.starttime}`, end: `${lctn.enddate}T${lctn.endtime}`
                    })
                }

                // console.log(plsDets);
                // console.log(lctns);
                // console.log(events);

                setPlacesDetails(plsDets);
                setLocations(lctns);
                setLocationEvents(events);
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

    async function handleDeleteLocation(locationEvent: EventClickArg) {
        if (confirm("Are you sure you want to delete this location?")) {
            // Close the modal
            setModalOpen(false);

            try {
                // FullCalendar Event ID is set as locationID
                const locationid = locationEvent.event.id;

                // Remove the location row in supabase associated to the locationID
                await removeItineraryLocation(locationid);

                // Remove location from locations record with locationID of deleted event
                setLocations((lctns) => {
                    const { [locationid]: _, ...remainingLocations } = lctns;
                    return remainingLocations;
                })

                // Remove location from locationsEvent array with locationID of deleted event
                setLocationEvents(locEvts => locEvts.filter(event => event.id !== locationid));

                // Remove the event from the calendar
                locationEvent.event.remove();
            } catch (err) {
                console.log(err);
            }
        }
    }

    if (!open || !itinerary)
        return null;

    return (
        <>
            <div className="background">
                <div className="itineraryModal">
                    <h2>{itinerary.name}</h2>
                    <h2>{itinerary.traveldestination}</h2>
                    <h3>Date: {itinerary.startdate} to {itinerary.enddate}</h3>
                    <br />

                    {loading ? <p>Loading Locations...</p> :
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin]}
                            initialView="dayGridMonth"
                            initialDate={itinerary.startdate !== null ? itinerary.startdate : undefined}
                            headerToolbar={{ start: 'title', center: '', end: 'today dayGridMonth timeGridDay prev,next' }}
                            height={'78%'}
                            events={locationEvents}
                            eventColor="darkorange"
                            eventClick={function (info) {
                                // Potential addition: Edit, will allow for moving start
                                // and end according to constraints from Places Info
                                // Once edit is confirmed, update locations table
                                //alert(`Title: ${info.event.title}\nStart: ${info.event.start}\nEnd: ${info.event.end}\nLocationID: ${info.event.id}`);
                                if (!placesDetails)
                                    return;

                                setSelectedEvent(info);
                                setSelectedDetails(placesDetails[locations[info.event.id].placeid]);
                                setModalOpen(true);
                            }}
                        />
                    }

                    <div className="buttons">
                        <button onClick={onClose}>Close</button>
                        <button onClick={() => onDelete(itinerary.itineraryid)}>Delete</button>
                    </div>
                </div>
            </div>

            <CalendarEventModal open={modalOpen} event={selectedEvent} details={selectedDetails} onDelete={handleDeleteLocation} onClose={() => setModalOpen(false)} />
        </>
    )
}