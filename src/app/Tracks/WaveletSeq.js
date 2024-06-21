const keyframes = {
    '0' : [
      {
        name:'fisheye',
        type:'sine',
        range:[-2, 3],
        dur: 8
      },
    ],
    '4': [
      {
        name:'camDist',
        type:'cosine',
        range:[15, 20],
        dur: 16
      },
      {
        name:'rayOriginC',
        type:'ellipse',
        range:[1, 1],
        dur: 9
      },
      {
        name:'skyHeight',
        type:'cosine',
        range:[.5, 2.5],
        dur: 8
      },
      // {
      //   name:'uvDisp',
      //   type:'mono',
      //   range:[0, 1],
      //   dur: 2
      // },
    ],
    '20': [
      {
        name:'thetaScale',
        type:'cosine',
        range:[Math.PI/8, Math.PI/4],
        dur: 3
      },
    ],
    '20.25':[
      {
        name:'hueShift',
        type:'mono',
        range:[.5, 1.5],
        dur: 16
      },
    ],
    '40':[
      {
        name:'ballX',
        type:'ease-in',
        range:[-1000, 0],
        dur: .01
      },
      {
        name:'rayOriginC',
        type:'const',
        val:[1,0]
      }
    ],
    '48':[
      {
        name:'rayOriginC',
        type:'ellipse',
        range:[1, 1],
        dur: 8
      },
    ],
    '56':[
      {
        name:'moonXY',
        type:'ellipse',
        range:[1, 1],
        dur: 2
      },
      {
        name:'ballY',
        type:'sine',
        range:[-1, 1],
        dur: 2
      },
    ],
    '64':[
      {
        name:'rayUp',
        type:'ellipse',
        range:[1,1],
        dur:6
      },
      {
        name:'moonLight',
        type:'const',
        val:1
      }
    ],
    '80':[
      {
        name:'renderDist',
        type:'linear',
        range:[15, 150],
        dur: 16
      }
    ],
    '88':[
      {
        name:'rayUp',
        type:'ellipse',
        range:[1,1],
        dur:2
      }
    ],
    '96':[
      {
        name:'rayUp',
        type:'const',
        val:[1,0]
      },
      {
        name:'uvDisp',
        type:'mono',
        range:[0, 1],
        dur: .5
      }
    ],
    '100':[
      {
        name:'rayUp',
        type:'ellipse',
        range: [1, 1],
        dur: 2.5
      },
      {
        name:'uvDisp',
        type:'mono',
        range:[0, 1],
        dur: .25
      },
      {
        name:'camDist',
        type:'cosine',
        range:[15, 10],
        dur: 16
      },
    ],
    '120':[
      {
        name:'uvDisp',
        type:'mono',
        range:[0, 1],
        dur: 1
      },
      {
        name:'rayUp',
        type:'const',
        val: [1, 0],
      },
    ],
    '128':[
      {
        name:'uvDisp',
        type:'mono',
        range:[0, 1],
        dur: .5
      },
      {
        name:'rayUp',
        type:'ellipse',
        range: [1, 1],
        dur: 16
      },
    ],
    '136':[
      {
        name:'rayUp',
        type:'const',
        val: [0, 1]
      },
      {
        name: 'rayOriginC',
        type:'const',
        val:[-1, 0]
      }
    ],
    '160': [
      {
        name:'camKal',
        type:'linear',
        range:[1, 2],
        dur: 16
      },
    ],
    '176':[
      {
        name:'rayUp',
        type:'ellipse',
        range: [1, 1],
        dur:8,
        phase: .5
      },
    ],
    '192':[
      {
        name:'moonLight',
        type:'linear',
        range: [1, 0],
        dur:1.5
      },
    ],
    '200.33':[
      {
        name:'moonLight',
        type:'const',
        val: 1,
      },
    ],
    // '8' : [
    //   {
    //     name:'rayUp',
    //     type:'ellipse',
    //     range:[1, 1],
    //     dur: 6
    //   }
    // ]
  }
 export default keyframes