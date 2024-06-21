import React, { Component } from 'react'

import WebGLSequencer from '@/Components/WebGLSequencer'
import keyframes from './MemorySeq'

class Memory extends WebGLSequencer {

  startBar = 162
  loopBar = 164
  loopStartBar = 132

  sequencerUniforms = {
    targetDist: 30,
    rayHeight: 0,
    upDir: [1, 0],
    fisheye: 0,
    hueShift: 0,
    rayPos: 0,
    playTime: 0,
    warpy: 0,
    twisty: 0
  }

  keyframes = keyframes

  programDefs = {
    'programMemory' : ['default.vs', 'memory.fs'],
  }

  textureDefs = {
    rand: { 
      src: this.props.tex['rand.png'],
    },
    hdri: { 
      src: this.props.tex['hdri.jpg'],
      min: WebGLRenderingContext.LINEAR,
      mag: WebGLRenderingContext.LINEAR,
    },
  }

  // bufferDefs = {
  //   'memoryBuffer' : {}
  // }


  constructor(props) {
    super(props)
  }

  // setupUser = () => {
  //   console.log(this.textures.pebbles)
  //   console.log(this.textures.rand)
  // }

  renderLoop = (rTime) => {
    let {
      gl, bufferInfo, prevTime, textures, audioData,
      lmh, AUDIO_HIGH, AUDIO_MID, AUDIO_LOW, seqUniEval
    } = this

    // let {
    //   memoryBuffer
    // } = this.buffers

    let {
      programMemory,
    } = this.programs
    

    const memoryUniforms = {
      ...seqUniEval,
      iResolution: this.canvasSize(),
      HDRI: textures.hdri,
      rand: textures.rand,
      iTime: audioData.curTime,
      HD: this.hdAA[0],
      lmh: lmh,
    }
    this.runProgram(programMemory, memoryUniforms, gl.canvas)

    
  }
}
export default Memory
