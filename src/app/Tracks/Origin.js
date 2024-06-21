import React, { Component } from 'react'
import { getCanvasMousePosition } from '@/helpers/screen'

import * as twglr from '@/helpers/twgl'
import WebGLSequencer from '@/Components/WebGLSequencer'

import keyframes from './OriginSeq'

var twgl = twglr.twgl

class Origin extends WebGLSequencer {

  startBar = 34

  golScal = 2

  sequencerUniforms = {
    bhX: 4,
    bhRad: .0001,
    bhSeparation: 0,
    MOUSEX: .1,
    MOUSEY: .7,
    hueShift: 0,
    camDist: 5,
    starBright: 0,
    bhTIME: 0,
    // bhDist: 100,
  }

  keyframes = keyframes

  programDefs = {
    'programLife' : ['default.vs', 'life.fs'],
    'programRandom' : ['default.vs', 'random.fs'],
    'programCircle' : ['default.vs', 'circle.fs'],
    'programAdd' : ['default.vs', 'add.fs'],
    'programBlackhole' : ['default.vs', 'blackhole.fs'],
    'programDisplay' : ['default.vs', 'default.fs'],
  }

  bufferDefs = {
    'gol' : {
      num: 4,
      size: [512*this.golScal, 512*this.golScal],
    },
    'bh' : {
      num : 1,
      size : null
    }
  }

  textureDefs = {
    'rand': { 
      src: this.props.tex['rand.png'],
    },
    'pebbles': { 
      src: this.props.tex['pebbles.png'],
      // min: gl.LINEAR,
      // mag: gl.LINEAR,
    }
  }

  golBufferSize = () => {
    return this.bufferDefs['gol'].size
  }

  // constructor(props) {
  //   super(props)
  //  }
 
  setupUser = () => {
    this.gl.clearColor(0, 0, 0, 1)
    twglr.runProgram(this.gl, this.programs['programRandom'], {}, this.bufferInfo, this.buffers['gol'][0])
  }

  renderLoop = (rTime) => {
    let time = rTime/1000
    let {
      golBuffers, golBufferSize, 
    } = this

    let {
      gl, bufferInfo, seqUniEval, prevTime, audioData, lmh, textures, canvasSize,
      AUDIO_HIGH, AUDIO_MID, AUDIO_LOW,
    } = this

    let {
      gol, bh
    } = this.buffers

    let {
      programLife, programRandom, programCircle, programDisplay, 
      programAdd, programBlackhole
    } = this.programs



    // Calc Life
    const lifeUniforms = { 
      u_texture: gol[0].attachments[0],
      resolution: golBufferSize(),
      iTime: audioData.curTime
    }
    twglr.runProgram(gl, programLife, lifeUniforms, bufferInfo, gol[2])

    // Calc Circle
    const circleUniforms = { 
      resolution: golBufferSize(),
      radius: .1*AUDIO_LOW,
      iTime: audioData.curTime,
      rand: textures.rand,
      pebbles: textures.pebbles,
      ...seqUniEval
    }
    twglr.runProgram(gl, programCircle, circleUniforms, bufferInfo, gol[3])

    // Add Circle
    const addUniforms = { 
      resolution1: golBufferSize(),
      resolution2: golBufferSize(),
      tex1: gol[2].attachments[0],
      tex2: gol[3].attachments[0],
    }
    twglr.runProgram(gl, programAdd, addUniforms, bufferInfo, gol[1])

    // // calc blackhole
    // gl.useProgram(programBlackhole.program);
    // twgl.setBuffersAndAttributes(gl, programBlackhole, canvasBuffer);
    // twgl.setUniforms(programBlackhole, { 
    //   sphereMap: gol[1].attachments[0],
    //   resolution: [gl.canvas.width, gl.canvas.height],
    //   TIME: audioData.curTime,
    //   // MOUSE: [this.mousePos.x, this.mousePos.y],
    //   iAudio: lmh,
    //   pebbles: textures.pebbles,
    //   HD: this.hdAA[0],
    //   // MOUSE: [500, 1200],
    //   // bhSize: 1*(AUDIO_HIGH*.2+.3),
    //   bhDist: (Math.pow(AUDIO_LOW, 2)*2+.3) * Math.sin(audioData.curTime*.7)
    // });
    // twgl.setUniforms(programBlackhole, this.evalObj(this.sequencerUniforms))
    // twgl.bindFramebufferInfo(gl, gl.canvas);
    // twgl.drawBufferInfo(gl, canvasBuffer);

    const bhUniforms = {
      resolution: canvasSize(),
      sphereMap: gol[1].attachments[0],
      TIME: audioData.curTime,
      iAudio: lmh,
      pebbles: textures.pebbles,
      HD: this.hdAA[0],
      bhDist: (Math.pow(AUDIO_LOW, 2)*2+.3) * Math.sin(audioData.curTime*.7),
      ...seqUniEval
    }
    this.runProgram(programBlackhole, bhUniforms, gl.canvas)

    // // Display
    // const displayUniforms = { 
    //   u_texture: gol[1].attachments[0],
    //   resolution: canvasSize(),
    // }
    // twglr.runProgram(gl, programDisplay, displayUniforms, this.bufferInfo, gl.canvas)


    // ping-pong buffers
    this.pingPong('gol', [0, 1])

  }
}
export default Origin
