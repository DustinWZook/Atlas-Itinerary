import { EventClickArg } from "@fullcalendar/core/index.js";

import { PlaceDetails } from "@/lib/shared/types";
import { photoUrl } from "@/lib/shared/photo";

import '@/css/calendarEventModal.css';

export default function CalendarEventModal({ open, event, details, onDelete, onClose }: { open: boolean, event: EventClickArg | undefined, details: PlaceDetails | undefined, onDelete: (locationEvent: EventClickArg) => void, onClose: () => void }) {
    const PhotoName = !!details?.photos ? details?.photos?.[0] : '';
    const PhotoSrc = photoUrl(PhotoName, 1000, 420);

    if (!open || !event || !details)
        return null;

    return (
        <>
            <div className="background">
                <div className="calendarEventModal">
                    <h2>{event.event.title}</h2>

                    <div className="content">
                        {!!details.photos && <img src={PhotoSrc} className="placePhoto" alt={details.name + ' Cover Photo'} />}

                        <div className="textContent">
                            <h3>Start: {event.event.start?.toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</h3>
                            <h3>End: {event.event.end?.toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</h3>
                            <hr />

                            {details.address && <p>{details.address}</p>}
                            {!!details.rating && <p>Ratings: {details.rating} ({details.userRatingCount})</p>}

                            <nav className="placeLinks">
                                <ul>
                                    {!!details.websiteUri &&
                                        <li><a href={details.websiteUri} target="_blank" rel="noreferrer">Website</a></li>}

                                    {details.mapUrl && <li><a href={details.mapUrl} target="_blank" rel="noreferrer">Google Maps</a></li>}

                                    {!!details.phone && <li>{details.phone}</li>}
                                </ul>
                            </nav>

                            {!!details.description && <p>{details.description}</p>}
                        </div>
                    </div>

                    <div className="buttons">
                        <button onClick={onClose}>Close</button>
                        <button onClick={() => onDelete(event)}>Delete</button>
                    </div>
                </div>
            </div>
        </>
    )
}