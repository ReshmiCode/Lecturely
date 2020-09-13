import React, { useState, useEffect } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { useAuth0 } from "@auth0/auth0-react";
import io from "socket.io-client";
import Board from "./Board_Less";
import { db } from "../firebase";

const ENDPOINT = "http://localhost:4000";

const activeUsers = ["109074203591919453634", "104609449234380862807"];

const Class = (props) => {
  const { user } = useAuth0();
  const [usersList, setUsersList] = useState([]);
  let [isTeacher, setIsTeacher] = useState("");
  let socket;
  const userID = user.sub.split("|")[1];
  // compare this session ID to user token to see if teacher
  if (props.match.params.id === userID)
    socket = io.connect(ENDPOINT + "/admin");
  else socket = io.connect(ENDPOINT + "/student", { query: `id=${userID}` });
  socket.on("update_students", (data) => {
    if (data) setUsersList(data);
    console.log(data);
  });

  /*if (usersList) {
    const boards = activeUsers.map((id) => <Board id={id} socket={socket} />);
    return <ul>{boards}</ul>;
  }*/

  /*if (props.match.params.id === userID && usersList) {
    const boards = usersList.map((id) => (
      <Board id={id.userID} socket={socket} />
    ));
    return <ul>{boards}</ul>;
  } else
    return (
      <ul>
        <Board id={userID} socket={socket} />
        <Board id={props.match.params.id} socket={socket} />
      </ul>
    );*/

  const studentList = (
    <List style={{ margin: "0 auto 0 auto" }}>
      {usersList && props.match.params.id === userID ? (
        usersList.map((board) => {
          if (board.userID === userID) return;
          return (
            <ListItem>
              <Board
                id={board.userID}
                styling="main"
                socket={socket}
                noColor={true}
              />
            </ListItem>
          );
        })
      ) : (
        <ListItem>
          <Board
            id={props.match.params.id}
            styling="main"
            socket={socket}
            noColor={true}
          />
        </ListItem>
      )}
    </List>
  );

  const checkForteacher = async () => {
    const doc = await db.doc(`user/${user.sub}`).get();
    setIsTeacher(doc.data().isteacher);
  };

  if (user) {
    checkForteacher();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div>
        {isTeacher && (
          <h3 style={{ textAlign: "center" }}>
            Your class code: {user.sub.split("|")[1]}
          </h3>
        )}
        <Board id={userID} styling={"main"} socket={socket} />
      </div>
      {studentList}
    </div>
  );
};

export default Class;
