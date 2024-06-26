const keyframes = {
    '0' : [
      {
        name:'fisheye',
        type:'cosine',
        range:[0, 1],
        dur: 4
      },
      // {
      //   name:'checker',
      //   type:'cosine',
      //   range:[1, 10],
      //   dur: 1
      // },
      {
        name:'tunnelWidth',
        type:'cosine',
        range:[10, 30],
        dur: 4
      },
      {
        name:'fairyTime',
        type:'mono',
        range:[null, 5],
        dur: 4
      },
    ],
    '8': [
      {
        name:'tunnelBase',
        type:'const',
        val:.01,
      },
      {
        name:'tunnelPos',
        type:'mono',
        range:[0, 60],
        dur: 1
      },
      {
        name:'fairyLight',
        type:'ease-in-out',
        range:[0, .5],
        dur: 8
      },
    ],
    '20': [
      {
        name:'fairyLight',
        type:'ease-in-out',
        range:['auto', 0],
        dur: 3.75
      },
    ],
    '22': [
      {
        name:'tunnelLight',
        type:'ease-in-out',
        range:[1, 0],
        dur: 1.825
      },
      {
        name:'tunnelBase',
        type:'ease-in-out',
        range:[.1, 0],
        dur: 1.75
      },
    ],
    '24':[
      {
        name:'creatureXY',
        type:'const',
        val:[0,0],
      },
      {
        name:'tunnelBase',
        type:'const',
        val: .01
      },
      {
        name:'tunnelPos',
        type:'mono',
        range:[0, 30],
        dur: 1
      },
      {
        name:'tunnelWidth',
        type:'const',
        val: 24
      },
    ],
    '32':[
      {
        name:'fairyLight',
        type:'const',
        val:1,
      },
    ],
    '36':[
      {
        name:'tunnelLight',
        type:'ease-in-out',
        range:[0, 1],
        dur:4,
      },
    ],
    '40': [
      {
        name:'tunnelLight',
        type:'ease-in-out',
        range:[1, 0],
        dur: 7.5
      },
      {
        name:'tunnelBase',
        type:'ease-in-out',
        range:['auto', 0],
        dur: 7.5
      },
      {
        name:'creatureLight',
        type:'cosine',
        range:[0, .5],
        dur: 4
      },
      {
        name:'rayUp',
        type:'ellipse',
        range: [1, -1],
        dur: 4
      },
      {
        name:'creatureTwist',
        type:'linear',
        range:[0, 2],
        dur: 8
      },
      // {
      //   name:'fisheye',
      //   type:'const',
      //   val: 0
      // },
    ],
    '48': [
      {
        name:'rayUp',
        type:'const',
        val: [1, 0],
      },
      {
        name:'tunnelLight',
        type:'const',
        val: .5
      },
      // {
      //   name:'tunnelBase',
      //   type:'ease-out',
      //   range: [0, .1],
      //   dur: 8
      // },
      {
        name:'creatureLight',
        type:'const',
        val: 1
      },
      {
        name:'tunnelPos',
        type:'mono',
        range:[null, 150],
        dur: 1
      },
      {
        name:'fisheye',
        type:'const',
        val: -.2
      },
      {
        name:'tunnelWonky',
        type:'linear',
        range: [0, -1],
        dur: 8
      },
      {
        name:'tunnelWidth',
        type:'ease-in',
        range:['auto', 30],
        dur: 2
      },
    ],
    '52' : [
      {
        name:'checker',
        type:'ease-in',
        range: ['auto', 25.99],
        dur: 4
      },
    ],
    '56': [
      {
        name:'tunnelBase',
        type:'ease-in-out',
        range: [.1, 0],
        dur: 8
      },
      {
        name:'wingRot',
        type:'ease-out',
        range: [0, -1],
        dur: .33
      },
      {
        name:'fairyLight',
        type:'const',
        val: 0
      },
      {
        name:'tunnelWonky',
        type:'cosine',
        range: [-1, 1],
        dur: 2
      },
      {
        name:'creatureFlip',
        type:'ease-in-out',
        range: [0, 1],
        dur: 2
      },
    ],
    '58' : [
      {
        name:'creatureFlip',
        type:'ease-in-out',
        range: [0, -1],
        dur: 2
      },
    ],
    '60': [
      {
        name:'creatureTwist',
        type:'ease-in-out',
        range: [0, -1],
        dur: .5
      },
    ],
    '61': [
      {
        name:'wingRot',
        type:'ease-in-out',
        range: [0, 1],
        dur: .5
      },
    ],
    '62': [
      {
        name:'creatureTwist',
        type:'ease-in-out',
        range: [0, 1],
        dur: 1
      },
    ],
    '63': [
      {
        name:'rayUp',
        type:'ellipse',
        range: [1, -1],
        dur: .5
      },
    ],
    '64': [
      {
        name:'rayUp',
        type:'const',
        val: [1, 0],
      },
      {
        name:'tunnelPos',
        type:'mono',
        range:[null, 50],
        dur: 1
      },
      {
        name:'creatureFlip',
        type:'ease-in-out',
        range: [0, -1],
        dur: 1
      },
      {
        name:'tunnelWonky',
        type:'cosine',
        range: [-1, 1],
        dur: 1
      },
      {
        name:'wingRot',
        type:'ease-in-out',
        range: [0, -1],
        dur: 1
      },
      {
        name:'rayUp',
        type:'const',
        val: [1, 0],
      },
    ],
    '66': [
      {
        name:'creatureTwist',
        type:'ease-in-out',
        range: [0, -1],
        dur: 2
      },
    ],
    '67': [
      {
        name:'wingRot',
        type:'ease-in-out',
        range: [0, 1],
        dur: 1
      },
    ],
    '68': [
      {
        name:'creatureTwist',
        type:'ease-in-out',
        range: [0, 1],
        dur: 1
      },
    ],
    '69': [
      {
        name:'creatureFlip',
        type:'ease-in-out',
        range: [0, -1],
        dur: 1
      },
    ],
    '70': [
      {
        name:'tunnelPos',
        type:'mono',
        range:[null, 100],
        dur: 1
      },
      {
        name:'checker',
        type:'ease-out',
        range: ['auto', .99],
        dur: 6
      },
      {
        name:'wingRot',
        type:'ease-in-out',
        range: [0, -1],
        dur: 3
      },
    ],
    '74' : [
      {
        name:'creatureFlip',
        type:'ease-in-out',
        range: [0, -2],
        dur: 2.75
      },
    ],
    '76.75': [
      {
        name:'creatureFlip',
        type:'ease-in-out',
        range: [0, 1],
        dur: .75
      },
      // {
      //   name:'creatureTwist',
      //   type:'ease-in-out',
      //   range: [0, 1],
      //   dur: .75
      // },
      {
        name:'wingRot',
        type:'ease-in-out',
        range: [0, -1],
        dur: .75
      },
    ],
    '78' : [
      {
        name:'creatureFlip',
        type:'ease-in-out',
        range: [0, 2],
        dur: 79.375 - 78
      },
    ],
    '79.375': [
      // {
      //   name:'creatureFlip',
      //   type:'ease-in-out',
      //   range: [0, -1],
      //   dur: .75
      // },
      {
        name:'creatureTwist',
        type:'ease-in-out',
        range: [0, -1],
        dur: .75
      },
      {
        name:'wingRot',
        type:'ease-in-out',
        range: [0, -1],
        dur: .75
      },
    ],
    '80':[
      {
        name:'fairyLight',
        type:'const',
        val:1,
      },
      {
        name:'tunnelWonky',
        type:'ease-in-out',
        range: ['auto', 0],
        dur:1,
      },
      {
        name:'tunnelPos',
        type:'mono',
        range:[null, 50],
        dur: 1
      },
      {
        name:'fairyTime',
        type:'mono',
        range:[null, 2.5],
        dur: 4
      },
    ],
    '88':[
      {
        name:'tunnelLight',
        type:'ease-in-out',
        range:['auto', .001],
        dur: 8
      },
    ],
    '96' : [
      {
        name:'rayUp',
        type:'ellipse',
        range:[1, -1],
        dur: 4
      },
      {
        name:'tunnelPos',
        type:'mono',
        range:[null, 25],
        dur: 1
      },
      {
        name:'fairyTime',
        type:'mono',
        range:[null, 1],
        dur: 4
      },
      
    ],
    '104' : [
      {
        name:'rayUp',
        type:'ellipse',
        range:[1, -1],
        dur: 2
      },
      {
        name:'fairyTime',
        type:'mono',
        range:[null, 2.5],
        dur: 4
      },
      {
        name:'checker',
        type:'ease-out',
        range: ['auto', 31.99],
        dur: 8
      },
      {
        name:'creatureTwist',
        type:'mono',
        range: [0, 1],
        dur: 2
      },
      {
        name:'tunnelWidth',
        type:'ease-in-out',
        range: ['auto', 40],
        dur: 8
      },
      {
        name:'tunnelPos',
        type:'mono',
        range:[null, 100],
        dur: 1
      },
      {
        name:'tunnelLight',
        type:'ease-in-out',
        range:['auto', 1],
        dur: 8
      },
    ],
    '112' : [
      {
        name:'rayUp',
        type:'ellipse',
        range:[1, 1],
        dur: 2
      },
      {
        name:'fairyTime',
        type:'mono',
        range:[null, 10],
        dur: 4
      },
      {
        name:'creatureFlip',
        type:'mono',
        range: [0, 1],
        dur: 1.5
      },
      // {
      //   name:'checker',
      //   type:'cosine',
      //   range: [0, 205.99],
      //   dur: 4
      // },
      {
        name:'fisheye',
        type:'cosine',
        range:[0, 4],
        dur: 1
      },
      {
        name:'tunnelWonky',
        type:'sine',
        range: [-2, 2],
        dur:3,
      },
      {
        name:'tunnelPos',
        type:'mono',
        range:[null, 200],
        dur: 1
      },
    ],
    '115':[
      {
        name:'wingRot',
        type:'ease-in-out',
        range: [0, -1],
        dur: .75
      },
    ],
    '117':[
      {
        name:'wingRot',
        type:'ease-in-out',
        range: [0, 1],
        dur: .75
      },
    ],
    '118.75':[
      {
        name:'wingRot',
        type:'ease-in-out',
        range: [0, -1],
        dur: .5
      },
    ],
    '120':[
      {
        name:'wingRot',
        type:'ease-in-out',
        range: [0, -1],
        dur: .75
      },
      {
        name:'fairyTime',
        type:'mono',
        range:[null, 6],
        dur: 8
      },
      {
        name:'fisheye',
        type:'const',
        val: 0
      },
      {
        name:'tunnelPos',
        type:'mono',
        range:[null, 100],
        dur: 1
      },
      {
        name:'rayUp',
        type:'ellipse',
        range:[1, 1],
        dur: 4
      },
    ]
  }

export default keyframes