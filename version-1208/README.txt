国产影视静态电影网站

生成内容：
- 首页：index.html，包含 Hero 轮播首屏、分类入口、最新入库、排行榜、横向推荐。
- 分类总览：categories.html。
- 独立分类页：category/*.html，共 8 个。
- 排行榜：ranking.html。
- 搜索筛选：search.html。
- 影片详情页：movies/movie-0001.html 至 movies/movie-2000.html，共 2000 个。
- 静态资源：assets/site.css、assets/app.js、assets/movies-data.js。

封面图片：
页面已按规则引用站点根目录 1.jpg 到 150.jpg：
第 N 条影片使用 ((N - 1) % 150) + 1.jpg。
当前上传素材包未包含这些 JPG 图片，因此没有额外生成或替换图片。部署时请把 1.jpg 到 150.jpg 放在 index.html 同级目录。

播放器：
播放器区域已写入 HLS 初始化逻辑，点击“立即播放”后绑定 m3u8 播放源。m3u8 地址来自上传 JS 文件中解析出的播放源，共 20 条，并按影片顺序循环绑定。

部署方式：
将本目录整体上传到静态空间即可。所有 HTML 页面均已插入百度统计脚本，并且统计代码不会显示为页面文字。
