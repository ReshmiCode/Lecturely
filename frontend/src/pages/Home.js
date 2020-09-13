import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { useAuth0 } from "@auth0/auth0-react";
import { db } from "../firebase";
import logo from "../assets/logo.png";
import "../styles/home.css";

const Home = () => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  let [saved, setSaved] = useState(false);
  let [isTeacher, setIsTeacher] = useState("");
  let [classCode, setClassCode] = useState("");

  const saveToDatabase = (isTeacher) => {
    db.collection("user")
      .doc(user.sub)
      .set({
        id: user.sub,
        nickname: user.nickname,
        name: user.name,
        email: user.email,
        profile: user.picture,
        isteacher: isTeacher,
        sessionid: "",
        group: "",
      })
      .then(function () {
        console.log("Document successfully written!");
      })
      .catch(function (error) {
        console.error("Error writing document: ", error);
      });
  };

  const getUser = async (id) => {
    const doc = await db.doc(`user/${id}`).get();
    const user = doc.data();
    return user;
  };

  const connectToDatabase = async (isTeacher) => {
    setIsTeacher(isTeacher);
    const response = await getUser(user.sub);
    console.log(response);
    if (!response) {
      await saveToDatabase(isTeacher);
      console.log("added to database with id", user.sub);
    } else {
      console.log("user already exists");
    }
    setSaved(true);
  };

  const checkForOldUser = async () => {
    const response = await getUser(user.sub);
    if (response && !saved) {
      setSaved(true);
      setIsTeacher(response.isteacher);
    }
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    setClassCode(newValue);
  };

  if (isAuthenticated && !saved) {
    checkForOldUser();
  }

  const logoutWithRedirect = () =>
    logout({
      returnTo: window.location.origin,
    });

  return (
    <div className="home">
      <img src={logo} className="logo" />
      {!isAuthenticated && (
        <>
          <h3>To create a session:</h3>
          <Button
            variant="contained"
            style={{
              backgroundColor: "rgb(127,238,230)",
              color: "white",
              textShadow: "1px 1px 1px rgba(0,0,0,0.14)",
            }}
            onClick={() => loginWithRedirect()}
          >
            Sign In
          </Button>
        </>
      )}
      {isAuthenticated && (
        <>
          {!saved && (
            <>
              <h3>Select your status:</h3>
              <div style={{ padding: 10 }}>
                <Button
                  variant="contained"
                  onClick={() => connectToDatabase(true)}
                  style={{
                    margin: 10,
                    backgroundColor: "rgb(127,238,230)",
                    color: "white",
                    textShadow: "1px 1px 1px rgba(0,0,0,0.14)",
                  }}
                >
                  Teacher
                </Button>
                <Button
                  variant="contained"
                  onClick={() => connectToDatabase(false)}
                  style={{
                    margin: 10,
                    backgroundColor: "rgb(127,238,230)",
                    color: "white",
                    textShadow: "1px 1px 1px rgba(0,0,0,0.14)",
                  }}
                >
                  Student
                </Button>
              </div>
            </>
          )}
          {isTeacher && (
            <>
              <h3> Your class code: {user.sub.split("|")[1]}</h3>
              <Button
                variant="contained"
                style={{
                  marginBottom: "1rem",
                  backgroundColor: "rgb(127,238,230)",
                }}
              >
                <Link
                  to={`/class/${user.sub.split("|")[1]}`}
                  style={{
                    textDecoration: "none",
                    color: "white",
                    textShadow: "1px 1px 1px rgba(0,0,0,0.14)",
                  }}
                >
                  Enter Class
                </Link>
              </Button>
            </>
          )}
          {saved && !isTeacher && (
            <>
              <p>Enter your class code:</p>
              <input type="text" value={classCode} onChange={handleChange} />
              <Button
                variant="contained"
                style={{
                  marginBottom: "1rem",
                  backgroundColor: "rgb(127,238,230)",
                  marginTop: "0.5rem",
                }}
              >
                <Link
                  to={`/class/${classCode}`}
                  style={{
                    textDecoration: "none",
                    color: "white",
                    textShadow: "1px 1px 1px rgba(0,0,0,0.14)",
                  }}
                >
                  Enter Class
                </Link>
              </Button>
            </>
          )}

          <Button
            variant="contained"
            style={{
              backgroundColor: "rgb(127,238,230)",
              color: "white",
              textShadow: "1px 1px 1px rgba(0,0,0,0.14)",
            }}
            onClick={() => logoutWithRedirect()}
          >
            Sign out
          </Button>
        </>
      )}
    </div>
  );
};

export default Home;
