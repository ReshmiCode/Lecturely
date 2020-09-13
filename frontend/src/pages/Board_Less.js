import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import "../styles/board.css";

const Board = (props) => {
  const canvasRef = useRef(null);
  const current = {
    color: "black",
  };
  let [transcript, setTranscipt] = useState("");

  useEffect(() => {
    // --------------- getContext() method returns a drawing context on the canvas-----

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let drawing = false;

    // ------------------------------- create the drawline ----------------------------

    const drawLine = (x0, y0, x1, y1, color, emit) => {
      const offset = canvas.getBoundingClientRect();

      context.beginPath();
      context.moveTo(Math.abs(x0 - offset.x), Math.abs(y0 - offset.y));
      context.lineTo(Math.abs(x1 - offset.x), Math.abs(y1 - offset.y));
      //context.moveTo(x0 - offset.x, y0 - offset.y);
      //context.lineTo(x1 - offset.x, y1 - offset.y);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();

      //console.log(x0 - offset.x + " -> 1");
      //console.log(y0 - offset.y);
      //console.log(x1 - offset.x + " " + y1 - offset.y);

      if (!emit) {
        return;
      }
      const w = canvas.width;
      const h = canvas.height;

      props.socket.emit("drawing", {
        boardid: props.id,
        sessionid: props.sessionid,
        isteacher: props.sessionid === props.id,
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
      });
    };

    // ---------------- mouse movement --------------------------------------

    const onMouseDown = (e) => {
      drawing = true;
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseMove = (e) => {
      if (!drawing) {
        return;
      }
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        true
      );
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseUp = (e) => {
      if (!drawing) {
        return;
      }
      drawing = false;
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        true
      );
    };

    // ----------- limit the number of events per second -----------------------

    const throttle = (callback, delay) => {
      let previousCall = new Date().getTime();
      return function () {
        const time = new Date().getTime();

        if (time - previousCall >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    };

    // -----------------add event listeners to our canvas ----------------------

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

    // Touch support for mobile devices
    canvas.addEventListener("touchstart", onMouseDown, false);
    canvas.addEventListener("touchend", onMouseUp, false);
    canvas.addEventListener("touchcancel", onMouseUp, false);
    canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

    // -------------- make the canvas fill its parent component -----------------

    //window.addEventListener("resize", onResize, false);
    //onResize();

    // ----------------------- socket.io connection ----------------------------
    const onDrawingEvent = (data) => {
      console.log(data.boardid + " " + props.id);
      if (data.boardid !== props.id) return;
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    };

    props.socket.on("drawing", onDrawingEvent);
  }, []);

  const onResize = () => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = async () => {
    console.log("Smiley");
    setTranscipt("Smiley");
    // var canvas = document.getElementById("canvas");
    // var dataURL = canvas.toDataURL();
    // console.log(dataURL);
    // try {
    //   const [result] = await client.documentTextDetection("./sample.png");
    //   const fullTextAnnotation = result.fullTextAnnotation;
    //   console.log(`Full text: ${fullTextAnnotation.text}`);
    // } catch (e) {
    //   console.log("Error: " + e);
    // }
  };

  // ------------- The Canvas and color elements --------------------------

  return (
    <div>
      {props.styling !== "main" ? (
        <canvas
          ref={canvasRef}
          className={props.styling}
          width="300"
          height="200"
        />
      ) : (
        <canvas
          ref={canvasRef}
          className={props.styling}
          width="1000"
          height="700"
        />
      )}

      {!props.noColor && (
        <div className="colors">
          <ButtonGroup color="primary" aria-label="contained button group">
            <Button
              style={{
                backgroundColor: "#000",
                color: "white",
              }}
              onClick={() => (current.color = "black")}
            >
              Black
            </Button>
            <Button
              style={{
                backgroundColor: "#eb1710",
                color: "white",
              }}
              onClick={() => (current.color = "red")}
            >
              Red
            </Button>
            <Button
              style={{
                backgroundColor: "#158a15",
                color: "white",
              }}
              onClick={() => (current.color = "green")}
            >
              Green
            </Button>
            <Button
              style={{
                backgroundColor: "#1029e6",
                color: "white",
              }}
              onClick={() => (current.color = "blue")}
            >
              Blue
            </Button>
            <Button
              style={{
                backgroundColor: "orange",
                color: "white",
              }}
              onClick={() => (current.color = "yellow")}
            >
              Yellow
            </Button>
          </ButtonGroup>
          <Button onClick={() => clearCanvas()}>Clear</Button>
          <Link to={`/`}>
            <Button>Done</Button>
          </Link>
          <Button onClick={() => downloadImage()}>Get Transcript</Button>
          {transcript.length > 1 && (
            <div>
              <h3>Transcript:</h3>
              <p>{transcript}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Board;
