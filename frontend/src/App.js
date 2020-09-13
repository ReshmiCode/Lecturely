import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import Home from "./pages/Home";
import Board from "./pages/Board";
import Class from "./pages/Class";
import Class2 from "./pages/Class_Less";

function App() {
  return (
    <div>
      <Router>
        <main>
          <Switch>
            <Route path="/" exact>
              <Home />
            </Route>
            <Route path="/board/:id" exact component={Board} />
            <Route path="/class/:id" exact component={Class2} />
            <Redirect to="/" />
          </Switch>
        </main>
      </Router>
    </div>
  );
}

export default App;
