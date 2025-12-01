# AI Logo 下载指南

## 已下载的Logo

✅ **OpenAI Logo** - `public/logos/openai.svg`
✅ **Google Logo** - `public/logos/google.svg`

## 需要手动下载的Logo

### 1. Anthropic Claude Logo
**推荐来源：**
- 官方网站：https://www.anthropic.com
- 搜索关键词：`Anthropic logo PNG transparent`
- 推荐网站：
  - https://logos-world.net/anthropic-logo/
  - https://www.seekpng.com/ (搜索 "Anthropic")
  - Google Images 搜索 "Anthropic logo PNG"

### 2. xAI Grok Logo  
**推荐来源：**
- 官方网站：https://x.ai
- 搜索关键词：`xAI logo PNG transparent` 或 `Grok logo PNG`
- 推荐网站：
  - https://logos-world.net/xai-logo/
  - Google Images 搜索 "xAI logo PNG"
  - Twitter/X 官方账号头像

### 3. Google Gemini Logo (如果需要单独的Gemini logo)
**推荐来源：**
- Google AI 官网：https://deepmind.google/technologies/gemini/
- 搜索关键词：`Google Gemini logo PNG`
- 注意：通常使用Google的通用logo也可以

## SVG转PNG方法

### 方法1：在线转换工具（最简单）
1. 访问：https://cloudconvert.com/svg-to-png
2. 上传 `public/logos/*.svg` 文件
3. 设置尺寸：128x128 或 256x256
4. 确保选择 "Transparent background"
5. 下载PNG文件

### 方法2：使用macOS内置工具
```bash
# 使用 qlmanage (macOS自带)
qlmanage -t -s 1000 -o public/logos/ public/logos/openai.svg
# 然后手动转换为PNG，或使用预览应用导出为PNG
```

### 方法3：安装ImageMagick后转换
```bash
# 安装ImageMagick
brew install imagemagick

# 转换SVG到PNG
convert public/logos/openai.svg -resize 128x128 -background none public/logos/openai.png
convert public/logos/google.svg -resize 128x128 -background none public/logos/google.png
```

### 方法4：使用在线SVG编辑器
1. 访问：https://boxy-svg.com/ 或 https://vectr.com/
2. 打开SVG文件
3. 导出为PNG，选择透明背景

## 直接PNG下载链接（如果可用）

### OpenAI
- Simple Icons PNG: https://cdn.simpleicons.org/openai/10A37F (需要修改颜色)
- 或使用在线工具转换已下载的SVG

### Google
- Simple Icons PNG: https://cdn.simpleicons.org/google/4285F4
- 或使用在线工具转换已下载的SVG

## 文件命名建议

保存PNG文件为：
- `openai.png` (用于 GPT-4o 和 GPT-5)
- `google.png` 或 `gemini.png` (用于 Gemini)
- `anthropic.png` 或 `claude.png` (用于 Claude)
- `xai.png` 或 `grok.png` (用于 Grok)

## 下一步

1. 下载缺失的logo（Anthropic 和 xAI）
2. 将所有SVG转换为PNG格式（128x128px，透明背景）
3. 更新 `src/lib/insforge.ts` 使用logo图片而不是emoji
4. 在组件中使用 `<img>` 标签显示logo

