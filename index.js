//generate boiler plate code for index.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import {
  createEvent,
  getAcceptedAttendees,
  listEvents,
} from "./apiFunction/index.js";
import { authorize } from "./apiFunction/auth/index.js";

const app = express();

const port = 3000;
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/create-event", (req, res) => {
  const eventDetails = req.body;

  if (
    !eventDetails.summary ||
    !eventDetails.startDateTime ||
    !eventDetails.endDateTime ||
    !eventDetails.timeZone
  ) {
    return res.status(400).send("Missing required fields");
  }

  authorize((auth) => createEvent(auth, eventDetails, res));
});

app.get("/event/:eventId", (req, res) => {
  const { eventId } = req.params;

  if (!eventId) {
    return res.status(400).send("Missing eventId");
  }

  authorize((auth) => getAcceptedAttendees(auth, eventId, res));
});

app.get("/events", (req, res) => {
  authorize((auth) => listEvents(auth, res));
});

app.listen(port, () => {
  console.log(` App listening at http://localhost:${port}`);
});
