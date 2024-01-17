import express from "express";
import bodyParser from "body-parser";
import randomString from "random-string";

const port = 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var events = [
    {
        id: 1,
        name: "Book Fest",
        date: "30/1/2024",
        location: "NITC Campus",
        capacity: 100,
        list: [
            {
                username: "Sridevi",
            }
        ]
    }
]

var accessStrings = [];

// vip access

function hasPermit(req, res, next) {
    const auth = req.headers.authorization;
    let flag = 0;
    for (let i = 0; i < accessStrings.length; i++) {
        if (auth === accessStrings[i]) {
            flag = 1;
            break;
        } 
    }
    if (flag == 0) {
        res.status(401);
        res.send("You are forbidden from access.");  
    } else {
        next();
    }
    
}

// to view all events
app.get("/events/all", (req, res) => {
    res.json(events);
})

// to update some fields
app.patch("/events/update/:id", hasPermit, (req, res) => {
    let index = parseInt(req.params.id) - 1;
    var obj = events[index];
    if (obj) {
        var _name = obj.name;
        var _date = obj.date;
        var _loc = obj.location;
        var _capacity = obj.capacity;
        var _list = obj.list;
        const updatedObj = {
            id: index + 1,
            name: req.body.eventName || _name,
            date: req.body.date || _date,
            location: req.body.location || _loc,
            capacity: req.body.capacity || _capacity,
            list: req.body.listOfAttendees || _list,
        };
        events[index] = updatedObj
        res.status(200).json(events[index]);
    } else {
        res.status(404).json({ error: "Event not found!" });
    }

})

// re-enter the entire event's details
app.put("/events/recreate/:id", hasPermit, (req, res) => {
    let index = parseInt(req.params.id) - 1;
    var obj = events[index];
    if (obj) {
        const updatedObj = {
            id: index + 1,
            name: req.body.eventName,
            date: req.body.date,
            location: req.body.location,
            capacity: req.body.capacity,
            list: req.body.listOfAttendees,
        };
        events[index] = updatedObj
        res.status(200).json(events[index]);
    } else {
        res.status(404).json({ error: "Event not found!" });
    }
})

app.delete("/events/delete/:id", hasPermit, (req, res) => {
    if (parseInt(req.params.id) > events.length || parseInt(req.params.id) <= 0) {
        res.status(404).json({ error: "Event not found!" });
    } else {
        let index = parseInt(req.params.id) - 1;
        events.splice(index, 1);
        res.json(events);
    }
})

// to authenticate oneself
app.post("/events/authenticate", (req, res) => {
    var anyStr = randomString();
    accessStrings.push(anyStr);
    res.json(anyStr);
})

// registering and creating events requires authentication
app.post("/events/register/:id", hasPermit, (req, res) => {
    let eventID = parseInt(req.params.id);
    if(events[eventID - 1].list.length == events.capacity) {
        res.status(404).json({ error: "Event not found!" });
    } else {
        events[eventID - 1].list.push({
        username: req.body.name,
        });
        res.json("Succesfully registered!");
        // res.json(events[eventID - 1].list);
    }
    
})

app.post("/events/create", hasPermit, (req, res) => {
    let latestID = events.length;
    events.push({
        id: latestID + 1,
        name: req.body.eventName,
        date: req.body.date,
        capacity: req.body.capacity,
        list: [],
    });
    res.json(events[events.length - 1]);
})

// view list of attendees for any event with a particular id and check availability
// check for errors here
app.get("/events/view/:id", (req, res) => {
    let index = parseInt(req.params.id);
    res.json(events[index - 1].list);
})

app.get("/events/availability/:id", (req, res) => {
    // let obj = {
    //     content: "",
    // };
    let content = "";
    let index = parseInt(req.params.id);
    if(events[index - 1].list.length == events.capacity) {
        content = "No more seats available!";
    } else {
        let leftSeats = events[index - 1].capacity - events[index - 1].list.length;
        content = leftSeats + " seats left for this event!";
    }
    res.json(content);
})

app.listen(port, (req, res) => {
    console.log(`Server is up & listening on port ${port}.`);
})