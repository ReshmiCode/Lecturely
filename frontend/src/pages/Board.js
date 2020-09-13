import React, { useRef, useEffect } from "react";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import io from "socket.io-client";
import "../styles/board.css";
import axios from 'axios';


const Board = (props) => {
  const canvasRef = useRef(null);
  const socketRef = useRef();
  const current = {
    color: "black",
  };

  useEffect(() => {
    // --------------- getContext() method returns a drawing context on the canvas-----

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let drawing = false;

    // ------------------------------- create the drawline ----------------------------

    const drawLine = (x0, y0, x1, y1, color, emit) => {
      const offset = canvas.getBoundingClientRect();
      console.log(offset);

      context.beginPath();
      context.moveTo(x0 - offset.x, y0 - offset.y);
      context.lineTo(x1 - offset.x, y1 - offset.y);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();

      if (!emit) {
        return;
      }
      const w = canvas.width;
      const h = canvas.height;

      socketRef.current.emit("drawing", {
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
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    };

    socketRef.current = io.connect(
      props.socketConnection || "http://localhost:4000"
    );

    socketRef.current.on("drawing", onDrawingEvent);
  }, []);

  const onResize = () => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const downloadImg = async () => {
    const canvas = canvasRef.current;
    var dataURL = canvas.toDataURL();
    console.log(dataURL);
    var text = await axios.post(`http://localhost:4000/process-text`, {imgUrl: dataURL});
    console.log(text);
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
          <Button>Done</Button>
          <Button onClick={() => downloadImg()}>Download</Button>
        </div>
      )}
    </div>
  );
};

export default Board;
