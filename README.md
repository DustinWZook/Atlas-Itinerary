# Atlas Itinerary
Atlas Itinerary is a personal travel itinerary planner that helps users design detailed, time-slotted trips without the pressure of booking. After creating an account, users can build multiple trip plans, each focused on a specific destination. During a trip, they select lodging, restaurants, activities, and attractions, and then schedule them for specific days and times. The result is a daily schedule that shows what they will do and when they will do it instead of a loose collection of bookmarks and notes.

## Purpose
Many people start planning with sticky notes, random websites, and scattered phone reminders. They may know what hotel they want, where they want to eat, and which attractions are “must-sees,” but they struggle to see how everything fits together in a realistic timeline. It is easy to double-book a time slot, underestimate travel time between places, or simply forget a stop entirely. Atlas Itinerary addresses this problem by providing a single web application where users can search for places, select the ones they care about, and plug them into a calendar-like structure for their trip.

## Primary Audience
The audience for this system is casual travelers who want structure without committing to reservations yet, as well as more technical users who want a repeatable way to plan multiple trips. From a developer’s point of view, Atlas Itinerary is also a small but complete full-stack React and Next.js application with authentication, a Postgres-backed database, and server-side API routes. With the documentation in this report, a team of developers with similar skills should be able to understand, build, fix, and extend the system. 

Try Atlas Itinerary [here](https://atlas-itinerary-4skv.vercel.app)!

***
## Repository Structure
### Documents
The projects documentation, including diagrams of the project's overall structure, requirements, and design, is stored in [/Documents](/Documents). This directory contains everything that documents the development process behind the project and showcases how it evolved over time. Reports submitted overtime while the group worked on Atlas itineary are here.

Initial project requirements that outlined the basic ideas behind Atlas itinerary are in [/Project Requirements](/Documents/Project%20Requirements). The overall design of the project that was intially conceptualized is in [/Project Design](/Documents/Project%20Design). An update report that describes the group's progress in the middle of developing Atlas Itinerary is in [/Progress Update](/Documents/Progress%20Update). The Final report on the project detailing its current state after the time constraints the group was given is in [/Final Submit](/Documents/Final%20Submit).

### Web
All the files for the Atlas Itinerary Web Application are stored within the [/web](/web) directory. This is where the actual program files, including web pages, components, scripts, etc.,are stored. The /web directory itself contains the the project configuration files along with the application code in [/src](/web/src).

Within the /src directory, Atlas Itinerary's web pages are stored in the [/app](/web/src/app) router directory. React components used to build these pages are in [/components](/web/src/components). CSS files that handle the styling of these components and the pages themselves are stored within [/css](/web/src/css). Code that deals the application's logic, handling interaction with the database, authentication, and making calls to the Google Places API, can be found in the [/lib](/web/src/lib) directory. The [/ImageTest](/web/src/ImageTest) directory contains all the images used for Atlas Itinerary's instructions page along with the application's logo.
