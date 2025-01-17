import React, { Component } from "react";

import { getCanvasMousePosition, isFloat, isNumber } from "@/helpers/screen";
import * as twglr from "./helpers/twgl";

var twgl = twglr.twgl;

WebGLComponent = (props) => {
  const canvasRef = useRef();
  const [render, setRender] = useState(true);
  let gl = null;

  let hdAA = [false, false];
  let hdSize = 1;
  let nonHDSize = 0.35;
  const pixRat = window.devicePixelRatio || 1;

  let mousePos = { x: 0, y: 0 };

  let defaultPrograms = {};
  const defaultProgramDefs = {
    programBlack: ["default.vs", "black.fs"],
    programCopy: ["default.vs", "default.fs"],
  };
  let defaultFrameBuffer = null;

  let programs = {};
  let buffers = {};
  let textures = {};

  let programDefs = {};
  let bufferDefs = {};
  let textureDefs = {};

  let resizeBuffers = [];

  let nextRenderFrame = null;
  let nextFrame = 1;

  let numParticles = 0;
  let pointBufferInfo = null;

  const canvasSize = () => {
    return [gl.canvas.width, gl.canvas.height];
  };

  const handleMouseMove = (event) => {
    mousePos = getCanvasMousePosition(event, canvasRef.current);
  };

  let handleKeyup = (event) => {};

  const createBuffer = (bufferSizeX, bufferSizeY) => {
    return twgl.createFramebufferInfo(gl, undefined, bufferSizeX, bufferSizeY);
  };

  const createKeyBuffers = (key, numBuffers, bufferSize, matchCanvas) => {
    let matchCanvasI = false;
    let bufferSizeX = 1;
    let bufferSizeY = 1;

    if (
      Array.isArray(bufferSize) &&
      bufferSize.length == 2 &&
      isNumber(bufferSize[0]) &&
      isNumber(bufferSize[1])
    ) {
      bufferSizeX = bufferSize[0];
      bufferSizeY = bufferSize[1];
      matchCanvasI = isFloat(bufferSizeX) || isFloat(bufferSizeY);
    } else if (isNumber(bufferSize)) {
      bufferSizeX = bufferSize;
      bufferSizeY = bufferSize;
      matchCanvasI = isFloat(bufferSize);
    } else {
      matchCanvasI = true;
    }

    matchCanvasI = matchCanvas || matchCanvasI;

    let canvasSize = canvasSize();
    bufferSizeX *= matchCanvasI ? canvasSize[0] : 1;
    bufferSizeY *= matchCanvasI ? canvasSize[1] : 1;

    if (!numBuffers || numBuffers < 2) {
      buffers[key] = createBuffer(bufferSizeX, bufferSizeY);
    } else {
      buffers[key] = [];
      for (var i = 0; i < numBuffers; i++) {
        buffers[key].push(createBuffer(bufferSizeX, bufferSizeY));
      }
    }
    return matchCanvasI;
  };

  const setupParticleBuffer = () => {
    let np = numParticles;
    let n = 0;
    let m = 0;
    if (isNumber(np)) {
      n = np;
      m = 1;
    } else if (Array.isArray(np)) {
      n = np[0];
      m = np[1];
    } else {
      return;
    }
    const pointData = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        pointData.push((i + 0.5) / n);
        pointData.push((j + 0.5) / m);
      }
    }
    const pointsObject = {
      position: { data: pointData, numComponents: 2 },
    };
    pointBufferInfo = twgl.createBufferInfoFromArrays(gl, pointsObject);
  };

  const setupBuffers = () => {
    bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);

    setupParticleBuffer();

    buffers = {};
    resizeBuffers = [];
    Object.keys(bufferDefs).forEach((key) => {
      let val = bufferDefs[key];
      let match = createKeyBuffers(key, val.num, val.size);
      if (match) {
        resizeBuffers.push(key);
      }
    });
  };

  const setupDefaultPrograms = () => {
    defaultPrograms = twglr.createProgramInfos(
      gl,
      props.shaders,
      defaultProgramDefs
    );
    const canvasSize = canvasSize();
    defaultFrameBuffer = twgl.createFramebufferInfo(
      gl,
      undefined,
      canvasSize[0],
      canvasSize[1]
    );
  };

  const setupPrograms = () => {
    programs = twglr.createProgramInfos(gl, props.shaders, programDefs);
  };

  const setupTextures = () => {
    textures = twgl.createTextures(gl, textureDefs);
  };

  const setupGL = () => {
    gl = CANVAS_REF.current.getContext("webgl", {
      depth: false,
      antialiasing: false,
    });
    gl.clearColor(0, 0, 0, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  };

  let setupUser = () => {};

  const setup = () => {
    setupGL();
    setupDefaultPrograms();
    setupPrograms();
    setupBuffers();
    setupTextures();
    setupUser();
  };

  const unmount = () => {
    nextFrame = -1;
    clearTimeout(nextRenderFrame);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("keyup", handleKeyup);
  };

  useEffect(() => {
    const handleMouseMove = (event) => {
      /* your logic here */
    };
    const handleKeyup = (event) => {
      /* your logic here */
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keyup", handleKeyup);

    setup();
    startRender();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keyup", handleKeyup);
      unmount();
    };
  }, []);

  const startRender = () => {
    requestAnimationFrame(renderGl);
  };

  let renderLoop = (time) => {};

  const runProgram = (pro, uni, fb = null, bi = null, pts = null) => {
    const bufferInfo = bi ? bi : bufferInfo;
    twglr.runProgram(gl, pro, uni, bufferInfo, fb, pts);
  };

  const setBlack = (fb) => {
    const { programBlack } = defaultPrograms;
    twglr.runProgram(gl, programBlack, {}, bufferInfo, fb);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  const resizeFB = (fb, key, num = null) => {
    const bd = bufferDefs[key].copy;

    const inArr = Array.isArray(bd) && bd.includes(num);
    const isAll = bd === "all";

    // Copy the Frame Buffer
    if (inArr || isAll) {
      const { programCopy } = defaultPrograms;

      let copyUniforms = {
        resolution: canvasSize(),
        u_texture: fb.attachments[0],
      };
      runProgram(programCopy, copyUniforms, defaultFrameBuffer);

      twgl.resizeFramebufferInfo(gl, fb);

      copyUniforms["u_texture"] = defaultFrameBuffer.attachments[0];
      runProgram(programCopy, copyUniforms, fb);
    } else {
      twgl.resizeFramebufferInfo(gl, fb);
    }
  };

  const setHDAA = () => {
    hdAA = props.getHDAA();
    hdSize = hdAA[0] ? 1 : nonHDSize;

    if (twgl.resizeCanvasToDisplaySize(gl.canvas, hdSize * pixRat)) {
      twgl.resizeFramebufferInfo(gl, defaultFrameBuffer);
      resizeBuffers.forEach((key) => {
        let b = buffers[key];
        if (Array.isArray(b)) {
          b.forEach((bb, idx) => resizeFB(bb, key, idx));
        } else {
          resizeFB(b, key);
        }
      });
    }
    const canvasSize = canvasSize();
    gl.viewport(0, 0, canvasSize[0], canvasSize[1]);
  };

  const renderGl = (time) => {
    setHDAA();
    renderLoop(time);

    if (nextFrame > 0) {
      nextRenderFrame = setTimeout(() => requestAnimationFrame(renderGl), 1);
    }
  };

  const pingPong = (v1, v2, v3 = null) => {
    if (Array.isArray(v2)) {
      let i1 = v2[0];
      let i2 = v2[1];
      let temp = buffers[v1][i1];
      buffers[v1][i1] = buffers[v1][i2];
      buffers[v1][i2] = temp;
    } else if (v3 === null) {
      let temp = buffers[v1];
      buffers[v1] = buffers[v1];
      buffers[v1] = temp;
    } else {
      let i1 = v3[0];
      let i2 = v3[1];
      let temp = buffers[v1][i1];
      buffers[v1][i1] = buffers[v2][i2];
      buffers[v2][i2] = temp;
    }
  };

  return <canvas ref={canvasRef} width="100%" height="100%" />;
};
export default WebGLComponent;
