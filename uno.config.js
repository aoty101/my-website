import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerVariantGroup,
  transformerDirectives,
  transformerCompileClass,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(), // 默认原子类预设
    presetAttributify(), // 属性模式支持
    presetIcons(), // 图标库支持
  ],
  rules: [
    // 动态规则（正则匹配）
    [/^text-(\d+)px$/, ([_, num]) => ({ fontSize: `${num}px` })],
  ],
  shortcuts: {
    'flex-center': 'flex justify-center items-center', // 组合类快捷方式
  },
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
    transformerCompileClass(),
  ],
})
