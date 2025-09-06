export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 16, // 假设设计稿宽度为 1920px
      propList: ['*'],
      minPixelValue: 2, // 忽略小于 2px 的转换
    },
  },
}
