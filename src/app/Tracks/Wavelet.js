import React, { Component } from 'react'

import WebGLSequencer from '@/Components/WebGLSequencer'
import keyframes from './WaveletSeq'

import * as twglr from '@/helpers/twgl'
var twgl = twglr.twgl

class Wavelet extends WebGLSequencer {

  startBar = 90

  sequencerUniforms = {
    thetaScale: 1,
    fisheye: 1,
    camDist: 15,
    rayOriginC: [1, 0],
    rayUp: [1, 0],
    rayOriginOffset: [0, 0],
    skyHeight: .5,
    hueShift: 0,
    uvDisp: 0,
    camKal: 1,
    renderDist: 15,
    ballX: -1000,
    ballY: 0,
    moonXY: [0, 0],
    moonLight: 0
  }

  keyframes = keyframes

  programDefs = {
    'programAurora' : ['default.vs', 'aurora.fs'],
    'programWavelet' : ['default.vs', 'wavelet.fs'],
  }

  textureDefs = {
    rand: { 
      src: this.props.tex['rand.png'],
      min: WebGLRenderingContext.LINEAR,
      mag: WebGLRenderingContext.LINEAR,
    },
  }

  bufferDefs = {
    'waveletBuffer' : {}
  }


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

    let {
      waveletBuffer
    } = this.buffers

    let {
      programAurora, programWavelet
    } = this.programs


    let audioArray = this.props.getAllFrequencyData()
    let audioTextures = twgl.createTextures(gl, {
      audio: {
        mag: gl.NEAREST,
        min: gl.LINEAR,
        format: gl.LUMINANCE,
        src: audioArray,
        width: 2,
      }
    })
    

    const waveletUniforms = {
      ...seqUniEval,
      iTime: audioData.curTime,
      iResolution: this.canvasSize(),
      HD: this.hdAA[0],
      iAudioData: audioTextures['audio']
    }
    this.runProgram(programWavelet, waveletUniforms, waveletBuffer)



    const auroraUniforms = {
      iChannel0: textures.rand,
      iTime: audioData.curTime,
      HD: this.hdAA[0],
      iResolution: this.canvasSize(),
      iWavelet: waveletBuffer.attachments[0],
      lmh: lmh,
      ...seqUniEval,
    }
    this.runProgram(programAurora, auroraUniforms, gl.canvas)

    
  }
}
export default Wavelet
