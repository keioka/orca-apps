export let vocab = [
  {
    word: "Allegory",
    pronunce: "/ˈælɪɡɔːri/",
    meaning: "A story, poem, or picture that can be interpreted to reveal a hidden meaning, typically a moral or political one.",
    meaningTrans: "通常、道徳的または政治的な隠された意味を明らかにするために解釈できる物語、詩、または絵。",
    example: "The long poem is an allegory of love and jealousy.",
    image: "https://example.com/allegory.png"
  },
  {
    word: "Hypotenuse",
    pronunce: "/haɪˈpɒtənuːs/",
    meaning: "The longest side of a right-angled triangle, opposite the right angle.",
    meaningTrans: "直角三角形の最長の辺で、直角に対して反対側にある。",
    example: "In a right triangle, the square of the length of the hypotenuse equals the sum of the squares of the lengths of the other two sides.",
    image: "https://example.com/hypotenuse.png"
  },
  {
    word: "Metaphor",
    pronunce: "/ˈmɛtəfɔːr/",
    meaning: "A figure of speech in which a word or phrase is applied to an object or action to which it is not literally applicable.",
    meaningTrans: "言葉やフレーズが文字通り適用できないオブジェクトや行動に適用される修辞法。",
    example: "Her voice was music to his ears is an example of a metaphor.",
    image: "https://example.com/metaphor.png"
  },
  {
    word: "Osmosis",
    pronunce: "/ɒzˈmoʊsɪs/",
    meaning: "A process by which molecules of a solvent tend to pass from a less concentrated solution into a more concentrated one, thus equalizing the concentrations on each side of a membrane.",
    meaningTrans: "溶媒の分子がより濃度の低い溶液からより濃度の高い溶液に移動する傾向があり、結果として膜の両側の濃度を均等化する過程。",
    example: "Osmosis is a vital process in biological systems, as it allows cells to maintain an optimal concentration of solutes.",
    image: "https://example.com/osmosis.png"
  },
  {
    word: "Photosynthesis",
    pronunce: "/ˌfoʊtoʊˈsɪnθəsɪs/",
    meaning: "The process by which green plants and some other organisms use sunlight to synthesize foods with the aid of chlorophylls.",
    meaningTrans: "緑色の植物と一部の他の生物が光合成色素の助けを借りて太陽光を用いて食物を合成する過程。",
    example: "Photosynthesis in plants generally involves the green pigment chlorophyll and generates oxygen as a byproduct.",
    image: "https://example.com/photosynthesis.png"
  }
];

export let phrases = [
  {
    phrase: "I think this is a good idea.",
    paraphrase: "I believe this is a great concept.",
  },
  {
    phrase: "I'm not sure about this.",
    paraphrase: "I have doubts about this.",
  },
  {
    phrase: "I'm really happy today.",
    paraphrase: "I'm extremely joyful today.",
  },
  {
    phrase: "I've got a lot of work to do.",
    paraphrase: "I have a massive amount of work to accomplish.",
  },
  {
    phrase: "We should hang out sometime.",
    paraphrase: "We should spend time together at some point.",
  }
]

export let grammar = [
  {
    text: "Hollo wrld! Haw are yu?",
    items: [
      {
        "text": "wrld",
        "type": "Unknown word: wrld",
        "offset": 6,
        "length": 4,
        "suggestions": [
          {
            "suggestion": "world",
            "score": null
          },
          {
            "suggestion": "wild",
            "score": null
          },
          {
            "suggestion": "wold",
            "score": null
          },
          {
            "suggestion": "weld",
            "score": null
          },
          {
            "suggestion": "WRLD",
            "score": null
          }
        ]
      },
      {
        "text": "are",
        "type": "Possible subject-verb agreement error",
        "offset": 16,
        "length": 3,
        "suggestions": [
          {
            "suggestion": "is",
            "score": null
          }
        ]
      },
      {
        "text": "yu",
        "type": "Unknown word: yu",
        "offset": 20,
        "length": 2,
        "suggestions": [
          {
            "suggestion": "you",
            "score": null
          },
          {
            "suggestion": "ye",
            "score": null
          },
          {
            "suggestion": "ya",
            "score": null
          },
          {
            "suggestion": "YU",
            "score": null
          }
        ]
      }
    ]
  }]


export const feedItems = [
  {
    id: 1,
    title: 'UN ‘very concerned’ over widespread violence by police during protests in Kenya',
    url: 'https://edition.cnn.com/2023/07/14/africa/kenya-protests-united-nations-intl/index.html',
    imageUrl: 'https://media.cnn.com/api/v1/images/stellar/prod/230714150033-01-kenya-protests.jpg?c=16x9&q=h_540,w_960,c_fill/f_webp',
    publisher: 'CCC',
    date: '2021-01-01',
    type: 'article',
    summary: [
      {
        text: 'The smoke is expected to linger over the region through Thursday, according to the National Weather Service in Seattle.',
        level: 'B1'
      },
      {
        text: 'The smoke is expected to linger over the region through Thursday, according to the National Weather Service in Seattle.',
        level: 'B2'
      }
    ],
    vocabularies: []
  },
  {
    id: 2,
    title: 'A new outbreak of Canadian wildfires is sending a plume of unhealthy smoke into the US yet again',
    url: 'https://edition.cnn.com/2023/07/14/us/canada-wildfire-smoke-us-air-quality/index.html',
    imageUrl: 'https://media.cnn.com/api/v1/images/stellar/prod/230714160345-02-wildfire-smoke-air-quality-canada-0714.jpg?c=16x9&q=h_720,w_1280,c_fill/f_webp',
    publisher: 'CCC',
    date: '2021-01-01',
    type: 'article',
    summary: [
      {
        text: 'The smoke is expected to linger over the region through Thursday, according to the National Weather Service in Seattle.',
        level: 'B1'
      },
      {
        text: 'The smoke is expected to linger over the region through Thursday, according to the National Weather Service in Seattle.',
        level: 'B2'
      }
    ],
    vocabularies: []
  },
  {
    id: 3,
    title: 'Chemical imaging reveals hidden details in Egyptian paintings',
    url: 'https://edition.cnn.com/2023/07/13/style/ancient-egyptian-paintings-hide-secret-scn/index.html',
    imageUrl: 'https://media.cnn.com/api/v1/images/stellar/prod/230712113640-01-egyptian-art-hidden-details-setup.jpg?c=16x9&q=h_720,w_1280,c_fill/f_webp',
    publisher: 'CCC',
    date: '2021-01-01',
    type: 'article',
    summary: [
      {
        text: 'The smoke is expected to linger over the region through Thursday, according to the National Weather Service in Seattle.',
        level: 'B1'
      },
      {
        text: 'The smoke is expected to linger over the region through Thursday, according to the National Weather Service in Seattle.',
        level: 'B2'
      }
    ],
    vocabularies: []
  },
  {
    id: 4,
    title: "AI could 'undermine elections and democracy' Bill Gates says",
    url: 'https://www.youtube.com/embed/5vl9nEr5NUw',
    imageUrl: 'https://www.youtube.com/embed/5vl9nEr5NUw',
    publisher: 'CCC',
    date: '2021-01-01',
    type: 'video',
    summary: [
      {
        text: 'The smoke is expected to linger over the region through Thursday, according to the National Weather Service in Seattle.',
        level: 'B1'
      },
      {
        text: 'The smoke is expected to linger over the region through Thursday, according to the National Weather Service in Seattle.',
        level: 'B2'
      }
    ],
    vocabularies: []
  }
]

export const lessons = [
  {
    id: 1,
    articleId: 1,
    savedVocabs: [],
  },
  {
    id: 2,
    articleId: 2,
    savedVocabs: [],
  }
]

export const notes = {
  vocabs: [],
  phrases: [],
  grammar: [],
  fu: [],
}


export const messages = [
  {
    message: 'What do you think of this article?',
    role: 'ai',
  },
  {
    message: 'I think this is quite scary news to me.',
    role: 'user',
  },
  {
    message: 'What do you think of this article?',
    role: 'ai',
  },
  {
    message: 'I think this is quite scary news to me. This needs to be change.',
    role: 'user',
  },
]