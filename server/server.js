const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const friendRoutes = require("./routes/friendRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const socketIo = require("socket.io");
const socketController = require("./controllers/socketController");

const app = express();
const server = http.createServer(app);

app.set('server', server);

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(bodyParser.json());

app.use("/users", userRoutes);
app.use("/friends", friendRoutes);
app.use("/scores", scoreRoutes);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketController(io);

server.listen(4000, () => {
  console.log("Listening on *:4000");
});
