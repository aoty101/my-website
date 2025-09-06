export default [
  {
    name: 'base',
    data: {},
    items: [
      {
        name: 'particleMaskTexture',
        source: new URL('../../assets/particleMask.png', import.meta.url).href,
        type: 'texture',
      },
      {
        name: 'smokeTexture',
        source: new URL('../../assets/smoke.png', import.meta.url).href,
        type: 'texture',
      },
    ],
  },
]
