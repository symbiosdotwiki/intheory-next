import React, { Component } from 'react'

import { getCanvasMousePosition, isFloat, isNumber } from '@/helpers/screen'
import * as twglr from '@/helpers/twgl'

var twgl = twglr.twgl

class WebGLComponent extends Component {

  hdAA = [false, false]
  hdSize = 1
  nonHDSize = .35
  pixRat = window.devicePixelRatio || 1

  mousePos = {x: 0, y: 0}

  defaultPrograms = {}
  defaultProgramDefs = {
    'programBlack' : ['default.vs', 'black.fs'],
    'programCopy' : ['default.vs', 'default.fs'],
  }
  defaultFrameBuffer = null
  
  programs = {}
  buffers = {}
  textures = {}

  programDefs = {}
  bufferDefs = {}
  textureDefs = {}

  resizeBuffers = []

  nextRenderFrame = null
  nextFrame = 1

  numParticles = 0
  pointBufferInfo = null

  canvasSize = () => {
    return [this.gl.canvas.width, this.gl.canvas.height]
  }

  handleMouseMove = (event) => {
    this.mousePos = getCanvasMousePosition(event, this.CANVAS_REF.current)
  }

  handleKeyup = (event) => {
    
  }

  createBuffer = (bufferSizeX, bufferSizeY) => {
    return twgl.createFramebufferInfo(
      this.gl, undefined, 
      bufferSizeX, bufferSizeY
    )
  }

  createKeyBuffers = (key, numBuffers, bufferSize, matchCanvas) => {
    let matchCanvasI = false
    let bufferSizeX = 1
    let bufferSizeY = 1

    if(Array.isArray(bufferSize)
        && bufferSize.length == 2  
        && isNumber(bufferSize[0]) 
        && isNumber(bufferSize[1])
    ){ 
      bufferSizeX = bufferSize[0]
      bufferSizeY = bufferSize[1]
      matchCanvasI = isFloat(bufferSizeX) || isFloat(bufferSizeY)
    }
    else if(isNumber(bufferSize)){
      bufferSizeX = bufferSize
      bufferSizeY = bufferSize
      matchCanvasI = isFloat(bufferSize)
    }
    else{
      matchCanvasI = true
    }

    matchCanvasI = matchCanvas || matchCanvasI

    let canvasSize = this.canvasSize()
    bufferSizeX *= matchCanvasI ? canvasSize[0] : 1
    bufferSizeY *= matchCanvasI ? canvasSize[1] : 1

    if(!numBuffers || numBuffers < 2){
      this.buffers[key] = this.createBuffer(bufferSizeX, bufferSizeY)
    }
    else{
      this.buffers[key] = []
      for(var i = 0; i < numBuffers; i++){
        this.buffers[key].push( this.createBuffer(bufferSizeX, bufferSizeY) )
      }
    }
    return matchCanvasI
  }

  setupParticleBuffer = () => {
    let np = this.numParticles
    let n = 0
    let m = 0
    if(isNumber(np)){
      n = np
      m = 1
    }
    else if(Array.isArray(np)){
      n = np[0]
      m = np[1]
    }
    else{
      return
    }
    const pointData = []
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        pointData.push((i+.5) / n)
        pointData.push((j+.5) / m)
      }
    }
    const pointsObject = { 
      position: { data: pointData, numComponents: 2 } 
    }
    this.pointBufferInfo = twgl.createBufferInfoFromArrays(
      this.gl, pointsObject
    )
  }

  setupBuffers = () => {
    this.bufferInfo = twgl.primitives.createXYQuadBufferInfo(this.gl)

    this.setupParticleBuffer()

    this.buffers = {}
    this.resizeBuffers = []
    Object.keys(this.bufferDefs).forEach(key => {
      let val = this.bufferDefs[key]
      let match = this.createKeyBuffers(key, val.num, val.size)
      if(match){
        this.resizeBuffers.push(key)
      }
    })
  }

  setupDefaultPrograms = () => {
    this.defaultPrograms = twglr.createProgramInfos(
      this.gl, this.props.shaders, this.defaultProgramDefs
    )
    const canvasSize = this.canvasSize()
    this.defaultFrameBuffer = twgl.createFramebufferInfo(
      this.gl, undefined, 
      canvasSize[0], canvasSize[1]
    )
  }

  setupPrograms = () => {
    this.programs = twglr.createProgramInfos(
      this.gl, this.props.shaders, this.programDefs
    )
  }

  setupTextures = () => {
    this.textures = twgl.createTextures(this.gl, this.textureDefs)
  }

  setupGL = () => {
    this.gl = this.CANVAS_REF.current.getContext('webgl', { 
      depth: false, antialiasing: false
    })
    this.gl.clearColor(0, 0, 0, 1)
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true)
  }

  setupUser = () => {}

  setup = () => {
    this.setupGL()    
    this.setupDefaultPrograms()
    this.setupPrograms()
    this.setupBuffers()
    this.setupTextures()
    this.setupUser()
  }

  unmount = () => {
    this.nextFrame = -1
    clearTimeout(this.nextRenderFrame)
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('keyup', this.handleKeyup)
  }

  constructor(props) {
    super(props)
    this.CANVAS_REF = React.createRef()
    this.state = {
      render: true
    }

    window.addEventListener('mousemove', this.handleMouseMove)
  }

  componentDidMount() {
    this.setup()
    this.startRender()
    window.addEventListener('keyup', this.handleKeyup)
  }

  componentWillUnmount() {
    this.unmount()
  }

  startRender = () => {
    requestAnimationFrame(this.renderGl)
  }

  renderLoop = (time) => {}

  runProgram = (pro, uni, fb=null, bi=null, pts=null) => {
    const bufferInfo = bi ? bi : this.bufferInfo
    twglr.runProgram(this.gl, pro, uni, bufferInfo, fb, pts)
  }

  setBlack = (fb) => {
    const { programBlack } = this.defaultPrograms
    twglr.runProgram(this.gl, programBlack, {}, this.bufferInfo, fb)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  resizeFB = (fb, key, num=null) => {
    const bd = this.bufferDefs[key].copy

    const inArr = Array.isArray(bd) && bd.includes(num)
    const isAll = bd === 'all'

    // Copy the Frame Buffer
    if(inArr || isAll){
      const { programCopy } = this.defaultPrograms

      let copyUniforms = {
        resolution: this.canvasSize(),
        u_texture: fb.attachments[0],
      }
      this.runProgram(programCopy, copyUniforms, this.defaultFrameBuffer)

      twgl.resizeFramebufferInfo(this.gl, fb)

      copyUniforms['u_texture'] = this.defaultFrameBuffer.attachments[0]
      this.runProgram(programCopy, copyUniforms, fb)
    }
    else{
      twgl.resizeFramebufferInfo(this.gl, fb)
    }
  }

  setHDAA = () => {
    this.hdAA = this.props.getHDAA()
    this.hdSize = this.hdAA[0] ? 1 : this.nonHDSize

    if(twgl.resizeCanvasToDisplaySize(this.gl.canvas, this.hdSize * this.pixRat)){
      twgl.resizeFramebufferInfo(this.gl, this.defaultFrameBuffer)
      this.resizeBuffers.forEach(key => {
        let b = this.buffers[key]
        if(Array.isArray(b)){
          b.forEach( (bb, idx) => 
            this.resizeFB(bb, key, idx)
          )
        }
        else{
          this.resizeFB(b, key)
        }
      })
    }
    const canvasSize = this.canvasSize()
    this.gl.viewport(0, 0, canvasSize[0], canvasSize[1])
  }

  renderGl = (time) => {
    this.setHDAA()
    this.renderLoop(time)
    
    if(this.nextFrame > 0){
      this.nextRenderFrame = setTimeout(
        () => requestAnimationFrame(this.renderGl),
        1
      )
    }
  }

  pingPong = (v1, v2, v3=null) => {
    if(Array.isArray(v2)){
      let i1 = v2[0]
      let i2 = v2[1]
      let temp = this.buffers[v1][i1]
      this.buffers[v1][i1] = this.buffers[v1][i2]
      this.buffers[v1][i2] = temp
    }
    else if(v3 === null){
      let temp = this.buffers[v1]
      this.buffers[v1] = this.buffers[v1]
      this.buffers[v1] = temp
    }
    else{
      let i1 = v3[0]
      let i2 = v3[1]
      let temp = this.buffers[v1][i1]
      this.buffers[v1][i1] = this.buffers[v2][i2]
      this.buffers[v2][i2] = temp
    }
  }

  render(){
    return (
        <canvas ref={this.CANVAS_REF} width='100%' height='100%'/>
    )}

}
export default WebGLComponent
