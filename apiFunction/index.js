import { google } from "googleapis";
export function listEvents(auth, res) {
  const calendar = google.calendar({ version: "v3", auth });

  calendar.events.list(
    {
      calendarId: "primary", // Change this if you want to use another calendar
      timeMin: new Date().toISOString(), // Filter events from now onwards
      maxResults: 10, // Limit the number of results
      singleEvents: true,
      orderBy: "startTime",
    },
    (err, response) => {
      if (err) {
        console.error("The API returned an error:", err);
        res.status(500).send({ error: "Error retrieving events" });
        return;
      }

      const events = response.data.items;
      if (events.length) {
        const eventDetails = events.map((event) => ({
          id: event.id,
          summary: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
        }));
        res.status(200).send({ events: eventDetails });
      } else {
        res.status(200).send({ message: "No upcoming events found." });
      }
    }
  );
}



export function getAcceptedAttendees(auth, eventId, res) {
  const calendar = google.calendar({ version: "v3", auth });

  calendar.events.get(
    {
      calendarId: "primary", // Ensure you're querying the correct calendar
      eventId: eventId,
    },
    (err, event) => {
      if (err) {
        if (err.response?.status === 404) {
          console.error(
            "Event not found. Verify the event ID or calendar access."
          );
          return res.status(404).send({
            message: "Event not found",
            error: err.message,
          });
        }
        console.error("Error retrieving event:", err);
        return res.status(500).send({
          message: "Error retrieving event",
          error: err.message,
        });
      }

      const attendees = event.data.attendees || [];
      // const acceptedAttendees = attendees.filter(
      //   (attendee) => attendee.responseStatus === "accepted"
      // );

      res.status(200).send({
        message: "Accepted attendees retrieved successfully",
        attendees: attendees,
      });
    }
  );
}



export function createEvent(auth, eventDetails, res) {
  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary: eventDetails.summary,
    location: eventDetails.location,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startDateTime,
      timeZone: eventDetails.timeZone,
    },
    end: {
      dateTime: eventDetails.endDateTime,
      timeZone: eventDetails.timeZone,
    },
    attendees: eventDetails.attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  calendar.events.insert(
    {
      calendarId: "primary",
      resource: event,
      sendUpdates: "all",
      sendNotifications: true,
    },
    (err, event) => {
      if (err) {
        console.error("Error contacting the Calendar service:", err);
        res.status(500).send("Error creating event");
        return;
      }
      console.log("Event created:", event.data.htmlLink);
      res.status(200).send({
        message: "Event created successfully",
        link: event.data.htmlLink,
      });
    }
  );
}