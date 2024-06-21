const keyframes = {
    '0' : [
      {
        name:'feedback1',
        type:'sine',
        range:[-.001, .002],
        dur: 2.5
      },
      {
        name:'feedback2',
        type:'cosine',
        range:[.001, .000],
        dur: 3.5
      },
      {
        name:'lightXY',
        type:'ellipse',
        range:[1, 1],
        dur: 4
      },
      {
        name:'specularHardness',
        type:'sine',
        range:[55, 85],
        dur: 6
      },
      {
        name:'lightHue',
        type:'mono',
        range:[.5, 1.5],
        dur: 7
      },
    ],
    '64':[
      {
        name:'satMult',
        type:'const',
        val:0,
      },
      {
        name:'hueShift',
        type:'mono',
        range:[0,1],
        dur:16,
      },
    ],
    '80':[
      {
        name:'satMult',
        type:'ease-in-out',
        range:[0,.5],
        dur:16,
      },
      {
        name:'secondLight',
        type:'linear',
        range:[0,1],
        dur:.1
      },
    ],
    '96':[
      {
        name:'hueShift',
        type:'mono',
        range:[0,1],
        dur:16,
      },
    ],
    '98':[
      {
        name:'feedbackScale',
        type:'cosine',
        range:[.996, .998],
        dur: .6666
      },
      {
        name:'satMult',
        type:'const',
        val:1,
      },
    ],
    '110':[
      {
        name:'feedbackScale',
        type:'ease-in-out',
        range:['auto', .991],
        dur: 4
      },
    ],
    '114':[
      {
        name:'feedbackScale',
        type:'ease-in-out',
        range:['auto',1],
        dur:.5
      },
      {
        name:'satMult',
        type:'ease-in-out',
        range:[1,0],
        dur:4
      },
    ],
    '130':[
      {
        name:'feedbackScale',
        type:'ease-in-out',
        range:[1,1.008],
        dur:30
      },
    ]
  }

export default keyframes