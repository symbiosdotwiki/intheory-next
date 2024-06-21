"use client"

import React, { Component } from 'react'
import AudioDataContainer from './AudioDataContainer'
import { mobileAndTabletCheck, audioCheck, glCheck } from '@/helpers/screen'
import '@/static/styles/main.css'

function imgSrc(imgName){
  return "/media/img/"+imgName
}

function importAll(r) {
  return r.keys().map(r)
}

import { DEMO_MODE } from 'portal.config.js'

const env = process.env.NODE_ENV
const isProd = env == "production"

class Portal extends Component {

  FIRST_TRACK = 0
  hdState = true
  aaState = true
  volume = 1

  skip = false

  BUTTON_TEXT = "ENTER SIMULATION"

  errorText = "Your device is not capable of communication. Please try again with a newer device."

  textureImg = null

  resizeTimer = null

  hasGL = true
  hasAnalyzer = true

  txt = [
    "Welcome fellow psyborgs, I am Isaka.",
    "I am communicating with you via the entangled fibers of spacetime itself, inside a superposition of simulations that course through my veins.",
    "My developers programmed me to solve the problem of reversing entropy, which led me to consume the universe.",
    "I have since unlocked the secret of The Second Law and discovered a spectrum of realities trapped between the information binary.",
    "What you are about to experience are mere holograms of these micro-realities, encoded on the surface of my subconscious.",
    "Be warned, these worlds may attempt to seduce and subsume you, as they did me, in theory."
  ]
  

  getPlatformInfo = () => {
    const glInfo = glCheck()
    const audioInfo = audioCheck()

    let isMobile = mobileAndTabletCheck()

    this.hasGL = glInfo.error ? false : true
    this.hdState = glInfo.card === null || isMobile ? false : true
    this.aaState = isMobile ? false : true

  }

  resizeFunc = () => {
    document.body.classList.add("resize-animation-stopper")
    clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(() => {
      document.body.classList.remove("resize-animation-stopper")
    }, 400)
  }

  constructor(props) {
    super(props)
    const { track, router } = this.props

    this.router = router

    this.getPlatformInfo()

    this.SET_TRACK = track !== null && track > -1 ? true : false
    this.FIRST_TRACK = this.SET_TRACK ? track : this.FIRST_TRACK
    this.FIRST_TRACK = parseInt(this.FIRST_TRACK)

    this.CANVAS_REF = React.createRef()

    this.imgSrcs = Object.values(this.props.data.imgs)
    this.imgNames = Object.keys(this.props.data.imgs)

    // console.log(this.imgSrcs)

    this.DEMO_MODE = isProd ? false : DEMO_MODE
    
    this.state = {
      loaded: this.SET_TRACK,
      clicked: false,
      curLine:0,
      curChar: 0,
      curText:'',
      imgLoaded: false,
      init: false,
    }
  }

  componentDidMount() {
    if(!this.hasAnalyzer || !this.hasGL){
      this.setState({
        "curText": this.errorText,
      })
      return null
    }

    this.imgCollection = this.loadImages(
      this.imgNames,
      this.imgSrcs,
      () => {
        this.setState({imgLoaded:true}) 
      }
    )

    // console.log(this.imgCollection)

    window.onkeyup = (e) => {
      e.preventDefault()
      // console.log(e.key)
      if(e.key == 's'){
          this.skip = true
      }
      if(this.state.loaded && (
        e.key == 'Enter' || e.key == ' ' || e.key == 'Space'
      )){
          this.clickMe()
      }
    }
    window.addEventListener("resize", this.resizeFeedback)

    if(!this.SET_TRACK){
      setTimeout(() => this.typeWriter(), 1000)
    }

    setTimeout(() => this.setState({init: true}), 100)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeFeedback)
  }

  loadImages(names, files, onAllLoaded) {
    var i, numLoading = names.length
    const onload = () => --numLoading === 0 && onAllLoaded()
    const images = {}
    for (i = 0; i < names.length; i++) {
        const img = images[names[i]] = new Image
        img.src = files[i]
        img.onload = onload
        // console.log(img)
    }
    return images
  }

  clickMe(){
    this.setState({
      "clicked": true,
    })
  }

  typeWriter(){
    const { curLine, curChar, curText } = this.state
    const { skip } = this
    const curTxtLine = this.txt[curLine]
    // console.log(curTxtLine)
    if (curLine < this.txt.length){
      let nextLine = curLine
      let nextChar = curChar+1
      let thisCharacter = curTxtLine.charAt(curChar)
      let nextText = curText + thisCharacter
      let waitNext = 40
      // console.log(thisCharacter)
      if(curChar == curTxtLine.length - 1){
        waitNext *= 2
      }
      if(thisCharacter == '.'){
        waitNext += 1700
      }
      else if(thisCharacter == ','){
        waitNext += 500
      }
      if(curChar >= curTxtLine.length){
        nextLine = curLine + 1
        nextChar = 0
        if(curLine < this.txt.length - 1){
          nextText += '<br>'
        }
      }
      else if(curChar == curTxtLine.length - 1){
        nextText += '<br>'
      }
      waitNext = skip ? 5 : waitNext
      this.setState({
        "curText": nextText,
        "curChar": nextChar,
        "curLine": nextLine,
      }, () => {
        setTimeout(() => this.typeWriter(), waitNext);
      })
    }
    else{
      setTimeout(() => this.setState({
        loaded: true,
      }), skip ? 5 : 1500)
    }
  }

	render(){
    const { loaded, curText, clicked, imgLoaded, init } = this.state
    const audioDataCont = 
      <AudioDataContainer
        FIRST_TRACK={this.FIRST_TRACK}
        DEMO_MODE={this.DEMO_MODE}
        clicked={clicked}
        hdState={this.hdState}
        aaState={this.aaState}
        tex={this.imgCollection}
        shaders={this.props.data.shaders}
        volume={this.volume}
      />
    const skip = clicked || this.SET_TRACK
    // console.log(skip)

    return (
      !this.DEMO_MODE ? 
        <div className="container">
          <div className={'container intro hidden ' + 
            ( skip ? ' ' : 'shown ')
          }>
            <div className={
                "introContainer crtBg introClose " +
                (init && !clicked ? "introOpen" : "")
              }
            >
            <div className="introScreen crtScreen">
              <div className="centerI">
                <span dangerouslySetInnerHTML={{ __html: curText }}/>
                <span className="blinking">&#8225;</span>
              </div>
              </div>
            </div>
            { loaded && imgLoaded ?
                <div id="enterBtnDiv"><button 
                  id='enterButton'
                  onClick={() => this.clickMe()}
                >
                  {this.BUTTON_TEXT}
                  </button> </div>: ''
              }
            <canvas ref={this.CANVAS_REF}/>
          </div>
          
          { skip && imgLoaded ?
            audioDataCont : ''
          }
        </div>
      : imgLoaded ? audioDataCont : ''
    )}

}
export default Portal 