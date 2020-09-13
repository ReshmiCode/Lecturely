const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 4000;

// namespaces for diff auth levels
var teachers = io.of("/admin");
var students = io.of("/student");

const studentsList = [];

students.on("connection", (socket) => {
  console.log("student connection");

  // when student joins inform teacher
  studentsList.push({
    socketID: socket.id,
    userID: socket.handshake.query["id"],
  });
  teachers.emit("update_students", studentsList);

  socket.on("drawing", (data) => {
    teachers.emit("drawing", data);
  });

  socket.on("disconnect", () => {
    studentsList.splice(
      studentsList.findIndex((item) => item.socketID === socket.id),
      1
    );
    teachers.emit("update_students", studentsList);
  });
});

teachers.on("connection", (socket) => {
  console.log("teacher connection");

  if (
    studentsList.findIndex(
      (item) => item.userID === socket.handshake.query["id"]
    ) !== -1
  ) {
    studentsList.push({
      socketID: socket.id,
      userID: socket.handshake.query["id"],
    });
    teachers.emit("update_students", studentsList);
  }

  socket.on("drawing", (data) => {
    students.emit("drawing", data);
  });
});

app.get("/", (req, res) => {
  res.send("server running");
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});
