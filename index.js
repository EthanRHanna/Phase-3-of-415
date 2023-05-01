const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const { error } = require("console");
const xmlparser = require("express-xml-bodyparser");

var fs = require("fs");
var js2xmlparser = require("js2xmlparser");

app.listen(port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xmlparser());

const uri =
  "mongodb+srv://User:HPIx5GGvfwzjgGNF@cluster0.cllmezs.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

var updateId = -1;

app.get("/form", function (req, res) {
  res.setHeader("Content-Type", "text/html");
  fs.readFile("./formFile.html", "utf8", (err, contents) => {
    if (err) {
      console.log("Form file Read Error", err);
      res.write("<p>Form file Read Error</p>");
    } else {
      console.log("Form loaded\n");
      res.write(contents + "<br>");
    }
    res.end();
  });
});

// GET All tickets
app.get("/rest/list/", function (req, res) {
  async function run() {
    try {
      let collection = await client
        .db("cluster0")
        .collection("SampleForProject");
      let results = await collection.find({}).limit(50).toArray();

      res.send(results).status(200);
    } catch (error) {
      res.status(404).send("Nothing");
    }
  }

  run().catch(console.log(error));
});

//Get ticket by id
app.get("/rest/ticket/:id", function (req, res) {
  const inputId = req.params.id;
  console.log("Looking for: " + inputId);

  async function run() {
    let collection = await client.db("cluster0").collection("SampleForProject");
    let query = { id: inputId };
    let result = await collection.findOne(query);

    if (!result) res.send("Ticket Not found").status(404);

    res.send(result).status(200);
  }

  run().catch(console.log(error));
});

//A Delete request
app.delete("/rest/delete/:id", function (req, res) {
  async function run() {
    const query = { id: req.params.id };

    let collection = await client.db("cluster0").collection("SampleForProject");

    if (!(await collection.findOne(query))) {
      res.send("There is no Ticket");
    } else {
      let result = await collection.deleteOne(query);
      res.send(result).status(200);
    }
  }

  run().catch(console.log(error));
});

// A POST request
app.post("/rest/ticket/", function (req, res) {
  const newTicket = req.body;

  //fields needed in the body
  const ticketInfo = [
    "id",
    "created_at",
    "updated_at",
    "type",
    "subject",
    "description",
    "priority",
    "status",
    "recipient",
    "submitter",
    "assignee_id",
    "follower_ids",
  ];
  //checking how many fields are missing
  const missingTicketInfo = ticketInfo.filter((field) => !(field in newTicket));

  //if more than 0 are missing then throw an error
  if (missingTicketInfo.length > 0) {
    return res.status(400).json({
      error: `Incomplete ticket info!\n Missing fields: ${missingTicketInfo.join(
        ", "
      )}`,
    });
  }

  //Adding new entry into database
  async function run() {
    let collection = await client.db("cluster0").collection("SampleForProject");
    let newDocument = newTicket;
    newDocument.date = new Date();
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  }

  run().catch(console.log(error));
});

//Update request
app.patch("/rest/patch/:id", function (req, res) {
  const client = new MongoClient(uri);

  async function run() {
    try {
      const database = client.db("cluster0");
      const ticket = database.collection("SampleForProject");
      const searchId = req.params.id;
      const query = { id: searchId };

      var updateTicket = {
        $set: {
          createdAt: req.body.createdAt,
          updatedAt: req.body.updatedAt,
          type: req.body.type,
          subject: req.body.subject,
          Description: req.body.Description,
          priority: req.body.priority,
          status: req.body.status,
          recipient: req.body.recipient,
          submitter: req.body.submitter,
          assignee_ID: req.body.assignee_ID,
          follower_IDs: req.body.follower_IDs,
          tags: req.body.tags,
        },
      };
      await ticket.updateOne(query, updateTicket);
      let result = await ticket.findOne(query);
      console.log(ticket);
      res.send(result).status(200);
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});

//XML Get Method
app.get("/rest/xml/ticket/:id", function (req, res) {
  const inputId = req.params.id;
  console.log("Looking for: " + inputId);

  async function run() {
    let collection = await client.db("cluster0").collection("SampleForProject");
    let query = { id: inputId };
    let result = await collection.findOne(query);

    if (!result) res.send("Ticket Not found").status(404);

    res.send(js2xmlparser.parse("Ticket", result)).status(200);
  }

  run().catch(console.log(error));
});

//XML Patch Method
app.patch("/rest/xml/patch/:id", function (req, res) {
  const client = new MongoClient(uri);

  async function run() {
    try {
      const database = client.db("cluster0");
      const ticket = database.collection("SampleForProject");
      const searchId = req.params.id;
      const query = { id: searchId };

      var updateTicket = {
        $set: {
          createdAt: req.body.createdAt,
          updatedAt: req.body.updatedAt,
          type: req.body.type,
          subject: req.body.subject,
          Description: req.body.Description,
          priority: req.body.priority,
          status: req.body.status,
          recipient: req.body.recipient,
          submitter: req.body.submitter,
          assignee_ID: req.body.assignee_ID,
          follower_IDs: req.body.follower_IDs,
          tags: req.body.tags,
        },
      };

      updateTicket = JSON.parse(JSON.stringify(xmlparser(updateTicket)));

      await ticket.updateOne(query, updateTicket);
      let result = await ticket.findOne(query);
      console.log(ticket);
      res.send(result).status(200);
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});
