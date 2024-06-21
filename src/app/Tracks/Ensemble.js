import React, { Component } from 'react'
import * as twglr from '@/helpers/twgl'
import {afn, minGreater} from '@/helpers/animation'
import WebGLSequencer from '@/Components/WebGLSequencer'

import keyframes from './EnsembleSeq'

var twgl = twglr.twgl

class Ensemble extends WebGLSequencer {

  startBar = 80
  randomSeed = Math.random() * 999999

  n = 1024 * 1
  m = 1024 * 1

  timeMult = 3

  temp = null

  sequencerUniforms = {
    feedback1: 0,
    feedback2: 0,
    lightXY: [1, 0],
    specularHardness: 70,
    feedbackScale: 1,
    lightHue: 0,
    secondLight: 0,
    hueShift:0,
    satMult: 1,
  }
 
  keyframes = keyframes

  programDefs = {
    'programInit' : ['particleInit.vs', 'particleInit.fs'],
    'programPhysics' : ['particlePhysics.vs', 'particlePhysics.fs'],
    'programDraw' : ['particleDraw.vs', 'particleDraw.fs'],
    'programEncode' : ['default.vs', 'encode.fs'],
    'programFeedback' : ['default.vs', 'feedback.fs'],
    'programDisplay' : ['default.vs', 'extract.fs'],
    'programBlur' : ['default.vs', 'blur.fs'],
    'programLookup' : ['default.vs', 'lookup.fs'],
    'programPhong' : ['default.vs', 'phong.fs'],
    'programAdd' : ['default.vs', 'composite.fs'],
  }

  bufferDefs = {
    'pos' : {
      num: 2,
      size: [this.n, this.m],
    },
    'vel' : {
      num: 2,
      size: [this.n, this.m],
    },
    'fb' : {
      num : 4,
      copy : [1]
    }
  }

  numParticles = [this.n, this.m]

  // constructor(props) {
  //   super(props)
  // }

  setupUser = () => {
    let { gl, programs, buffers } = this
    const {n, m} = this

    twglr.runProgram(gl, programs['programInit'], {pass: 0}, this.bufferInfo, buffers['pos'][0])
    twglr.runProgram(gl, programs['programInit'], {pass: 1}, this.bufferInfo, buffers['vel'][0])
    
  }

  renderLoop = (rTime) => {
    let { 
      programInit, programPhysics, programDraw, programFeedback,
      programDisplay, programBlur, programLookup,
      programPhong, programAdd, programEncode
    } = this.programs
    let {
      pos, vel,
      fb
    } = this.buffers
    let { 
      gl, bufferInfo, canvasSize, prevTime, audioData, randomSeed, seqUniEval, hdSize,
      AUDIO_HIGH, AUDIO_MID, AUDIO_LOW
    } = this

    let { n, m, pointBufferInfo, posBufferInfo } = this

    // particle physics
    const physarumUniforms = {
      resolution: canvasSize(),
      u_pheromones: fb[1].attachments[0],
      u_position: pos[0].attachments[0],
      u_velocity: vel[0].attachments[0],
      time: audioData.curTime/this.timeMult + randomSeed + AUDIO_MID * 3,
      pass: 0,
      lmh: [AUDIO_LOW, AUDIO_MID, AUDIO_HIGH],
    }
    this.runProgram(programPhysics, physarumUniforms, vel[1])

    const physarumUniforms2 = {
      pass: 1
    }
    this.runProgram(programPhysics, physarumUniforms2, pos[1])


    // drawing black for particles
    this.setBlack(fb[3])


    gl.enable(gl.BLEND)

    // drawing particles
    const drawUniforms = { 
      u_texture: pos[1].attachments[0],
      HD: this.hdAA[0]
    }
    this.runProgram(programDraw, drawUniforms, fb[3], pointBufferInfo, 'points')


    gl.disable(gl.BLEND)


    //encode particles
    const encodeUniforms = {
      resolution: canvasSize(),
      u_texture: fb[3].attachments[0],
      ...seqUniEval
    }
    this.runProgram(programEncode, encodeUniforms, fb[2])


    // blur prevFrame
    const blurUniforms = {
      resolution: canvasSize(),
      u_texture: fb[1].attachments[0],
      pass: 0,
    }
    this.runProgram(programBlur, blurUniforms, fb[3])

    const blurUniforms2 = {
      resolution: canvasSize(),
      u_texture: fb[3].attachments[0],
      pass: 1,
    }
    this.runProgram(programBlur, blurUniforms2, fb[1])


    // drawing black
    this.setBlack(fb[0])

    // particles feedback trails
    const feedbackUniforms = {
      resolution: canvasSize(),
      u_prevFrame: fb[1].attachments[0],
      u_curFrame: fb[2].attachments[0],
      HD: this.hdAA[0],
      ...seqUniEval
    }
    this.runProgram(programFeedback, feedbackUniforms, fb[0])

    // lookup for phong
    const lookupUniforms = {
      resolution: canvasSize(),
      u_texture: fb[0].attachments[0] ,
      multiplier: .7+Math.pow(AUDIO_MID, .5)*.8,
      ...seqUniEval
    }
    this.runProgram(programLookup, lookupUniforms, fb[3])

    // shiny phong
    const phongUniforms = {
      resolution: canvasSize(),
      u_texture: fb[0].attachments[0] ,
      intensity: 100,
      specularPower: 30*(AUDIO_HIGH+.01),
      diffusePower: .0,
      viewDir: [0,0,-1],
      ...seqUniEval
    }
    this.runProgram(programPhong, phongUniforms, fb[2])

    // drawing display
    const addUniforms = {
      resolution: canvasSize(),
      u_texture: fb[2].attachments[0] ,
      u_add: fb[3].attachments[0] ,
      time: audioData.curTime/10,
      saturation: AUDIO_LOW * 5,
      ...seqUniEval
    }
    this.runProgram(programAdd, addUniforms, gl.canvas)

    // ping-pong buffers
    this.pingPong('pos', [0,1])
    this.pingPong('vel', [0,1])

    this.pingPong('fb', [0,1])
    
  }

}
export default Ensemble
