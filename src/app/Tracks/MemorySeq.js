const keyframes = {
    '0' : [
      {
        name:'fisheye',
        type:'sine',
        range:[-2.2, 2.2],
        dur: 8
      },
      {
        name:'hueShift',
        type:'mono',
        range:[null, 1],
        dur: 4
      },
      {
        name:'rayPos',
        type:'mono',
        range:[null, 50],
        dur: 4
      },
      {
        name:'playTime',
        type:'mono',
        range:[null, 2],
        dur: 1
      },
    ],
    '8' : [
      {
        name:'upDir',
        type:'ellipse',
        range:[1, 1],
        dur: 8
      }
    ],
    '16' : [
      {
        name:'rayHeight',
        type:'sine',
        range:[-1, 1],
        dur: 8
      }
    ],
    '32' : [
      {
        name:'rayHeight',
        type:'const',
        val: 0
      }
    ],
    '40' : [
      {
        name:'upDir',
        type:'const',
        val: [1,0]
      }
    ],
    '44' : [
      {
        name:'upDir',
        type:'ellipse',
        range:[1, 1],
        dur: 2
      }
    ],
    '48' : [
      {
        name:'upDir',
        type:'ellipse',
        range:[1, 1],
        dur: 8
      },
      {
        name:'rayHeight',
        type:'sine',
        range:[-2, 2],
        dur: 8
      },
      {
        name:'targetDist',
        type:'sine',
        range:[-30, 70],
        dur: 4
      },
      {
        name:'warpy',
        type:'ease-in-out',
        range:['auto', 1],
        dur: 4
      }
    ],
    '52' : [
      {
        name:'warpy',
        type:'ease-in-out',
        range:['auto', 0],
        dur: 4
      }
    ],
    '56' : [
      {
        name:'upDir',
        type:'ellipse',
        range:[-1, 1],
        dur: 6
      },
      {
        name:'targetDist',
        type:'const',
        val:30
      },
      {
        name:'warpy',
        type:'cosine',
        range:[0, -1],
        dur: 3
      }
    ],
    '62' : [
      {
        name:'warpy',
        type:'cosine',
        range:['auto', 1.5],
        dur: 1
      },
      {
        name:'upDir',
        type:'ellipse',
        range:[1, 1],
        dur: 2
      },
      {
        name:'targetDist',
        type:'sine',
        range:[-5, 65],
        dur: 1
      }
    ],
    '70' : [
      {
        name:'warpy',
        type:'ease-in-out',
        range:['auto', 0],
        dur: 2
      },
      {
        name:'upDir',
        type:'ellipse',
        range:[1, 1],
        dur: 10
      },
      {
        name:'targetDist',
        type:'sine',
        range:[-10, 70],
        dur: 5
      }
    ],
    '80' : [
      {
        name:'twisty',
        type:'sine',
        range:[4, -4],
        dur: 8
      },
      {
        name:'rayHeight',
        type:'const',
        val: 0
      },
      {
        name:'upDir',
        type:'ellipse',
        range:[-1, 1],
        dur: 8
      },
      {
        name:'targetDist',
        type:'const',
        val: 30,
      },
      {
        name:'fisheye',
        type:'ease-in-out',
        range:['auto', -1],
        dur: 8
      },
    ],
    '88' : [
      {
        name:'fisheye',
        type:'cosine',
        range:[-1, 3],
        dur: 12
      },
      {
        name:'twisty',
        type:'sine',
        range:[4, -4],
        dur: 4
      },
      {
        name:'upDir',
        type:'ellipse',
        range:[1, 1],
        dur: 2
      },
      {
        name:'targetDist',
        type:'sine',
        range:[10, -10],
        dur: 1
      }
    ],
    '96' : [
      {
        name:'warpy',
        type:'sine',
        range:[.7, -.7],
        dur: 8
      },
      {
        name:'upDir',
        type:'ellipse',
        range:[1, 1],
        dur: 8
      },
      {
        name:'targetDist',
        type:'sine',
        range:[10, -10],
        dur: 2
      }
    ],
    '112' : [
      {
        name:'targetDist',
        type:'linear',
        range:[0, 30],
        dur: 4
      },
      {
        name:'upDir',
        type:'const',
        val: [-1, 0]
      },
    ],
    '116' : [
      {
        name:'upDir',
        type:'ellipse',
        range:[-1, 1],
        dur: 2
      },
      {
        name:'rayHeight',
        type:'sine',
        range: [-2, 2],
        dur: 16
      },
      {
        name:'targetDist',
        type:'sine',
        range:[-10, 70],
        dur: 8
      }
    ],
    '128' : [
      {
        name:'twisty',
        type:'ease-in-out',
        range:['auto', 0],
        dur: 4
      },
      {
        name:'warpy',
        type:'ease-in-out',
        range:['auto', 0],
        dur: 4
      },
    ],
    '132' : [
      {
        name:'twisty',
        type:'cosine',
        range:[0, -2],
        dur: 7
      },
      {
        name:'warpy',
        type:'sine',
        range:[1, -1],
        dur: 8
      },
      {
        name:'upDir',
        type:'ellipse',
        range:[-1, 1],
        dur: 8
      },
      {
        name:'targetDist',
        type:'sine',
        range:[-30, 70],
        dur: 16
      }
    ],
    '148' : [
      {
        name:'rayPos',
        type:'mono',
        range:[null, 50],
        dur: 2
      },
      {
        name:'rayHeight',
        type:'sine',
        range: [-1.25, 1.25],
        dur: 8
      },
      {
        name:'fisheye',
        type:'ease-in-out',
        range:['auto', 0],
        dur: 4
      },
    ],
    '152' : [
      {
        name:'fisheye',
        type:'sine',
        range:[-3, 3],
        dur: 12
      },
    ],
    '160' : [
      {
        name:'twisty',
        type:'ease-in-out',
        range:['auto', 0],
        dur: 4
      },
      {
        name:'warpy',
        type:'ease-in-out',
        range:['auto', 0],
        dur: 4
      },
      {
        name:'fisheye',
        type:'ease-in-out',
        range:['auto', -1],
        dur: 4
      },
    ]
  }

 export default keyframes