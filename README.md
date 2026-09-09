# 🐸 青蛙過馬路 (Frogger 1981) 經典街機網頁復刻版

本專案高精度復刻了 1981 年 Konami 經典街機遊戲《青蛙過馬路》（Frogger），支援電腦與行動裝置（手機/平板），包含原汁原味 8-bit 像素畫面、街機調色盤、Web Audio API 程序化合成音效與背景音樂、完整河流物理與車流碰撞，並可零門檻免費部署至公開網路。

---

## 🎮 遊戲特色

1. **經典像素還原**：
   - 14 欄 × 16 行經典街機網格佈局。
   - 5 道馬路車流（黃色小轎車、綠色拖拉機、粉紅跑車、紅白高速賽車、重型貨櫃卡車）。
   - 5 道河流（小型浮木、中型浮木、大型浮木、2 連與 3 連潛水烏龜、鱷魚）。
   - 紫磚安全島、中央人行道、5 個青蛙目標洞穴（Home Bays）。
   - 隨機出現的獎勵蒼蠅、粉紅母青蛙、鱷魚張嘴等經典機制。

2. **8-bit Web Audio 晶片音效**：
   - 跳躍音（Hop）、落水噗通聲（Splash）、撞車壓扁聲（Squash）、進洞成功得分音（Trill）、吃蒼蠅音、最後 5 秒警告嘀嗒聲、通關勝利號角、Game Over 旋律。
   - 內建經典輕快主題背景音樂（支援一鍵靜音切換）。
   - **完全純 Web Audio API 程序化合成，無需下載或加載外部音訊檔案，保證零延遲、離線即播、永不失效！**

3. **街機框體與復古 CRT 濾鏡**：
   - 經典街機燈箱與微凸外框設計。
   - 可一鍵開啟/關閉 CRT 掃描線與微光特效。
   - 支援全螢幕沈浸模式。

4. **自由調整遊戲難度（4 段級別）**：
   - **簡單**：車速減緩 25%、烏龜不下潛、無鱷魚、45 秒充裕時間、5 條生命，新手輕鬆上手！
   - **普通**：1981 街機原汁原味設定，烏龜週期下潛，30 秒倒數，3 條生命。
   - **困難**：車速加快 35%、烏龜快速下潛、鱷魚頻出、22 秒生死時速、得分加成 1.5 倍！
   - **地獄**：極速狂飆 70%、烏龜幾乎全下潛、大量鱷魚、僅 16 秒生死時速、2 條命、得分雙倍 2.0 倍！
   - 可在工具列點擊「⚙ 難度」按鈕即時切換，系統會自動記住您的難度設定。

5. **跨平台操作支援**：
   - **電腦端**：
     - 方向鍵 `↑` `↓` `←` `→` 或 `W` `A` `S` `D`：跳躍移動。
     - `空白鍵 (Space)`：開始遊戲 / 暫停。
     - `M` 鍵：音效切換（靜音/開啟）。
     - `D` 鍵：在標題畫面時快速切換難度。
   - **手機 / 平板**：
     - 螢幕手勢滑動（上下左右滑動跳躍）。
     - 畫面下方虛擬十字鍵（D-pad）。

---

## 🌐 免費部署至網路上面的空間（供所有人遊玩）

本遊戲為純前端靜態專案（無需編譯安裝 npm，開啟即可遊玩），以下推薦三種最簡單快速的免費上線方式：

### 方式一：GitHub Pages + GitHub Actions 自動部署（最推薦）

本專案已內建 `.github/workflows/deploy.yml` 自動部署腳本。

1. 到 [GitHub.com](https://github.com) 登入並「New repository」建立一個新的公開倉庫（例如命名為 `frogger-game`）。
2. 在此專案資料夾下打開終端機，執行以下指令將代碼推送至 GitHub：
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 1981 Frogger Arcade Game"
   git branch -M main
   git remote add origin https://github.com/<您的GitHub帳號>/frogger-game.git
   git push -u origin main
   ```
3. 前往您 GitHub 倉庫的 **Settings** -> **Pages**：
   - 在 **Build and deployment** 下方的 **Source** 選擇 **GitHub Actions**。
4. 稍等約 1 分鐘，GitHub Actions 完成後即可在該頁面頂部看到您的公開遊戲網址：
   `https://<您的GitHub帳號>.github.io/frogger-game/`

---

### 方式二：Netlify Drop（免打指令、30 秒即時上線）

1. 打開瀏覽器前往 [Netlify Drop](https://app.netlify.com/drop)。
2. 直接將此專案資料夾拖曳（Drag & Drop）進該網頁中。
3. 數秒後就會自動生成一組免費且全球可訪問的公開網址（例如：`https://xxxx.netlify.app`），即可立即把連結分享給任何人！

---

### 方式三：Vercel 免費部署

1. 安裝或使用 [Vercel](https://vercel.com/)。
2. 連結您的 GitHub 倉庫，點擊 Deploy 即可自動發布上線。

---

## 💻 本地離線預覽

如果您想在本地電腦直接測試：
- 直接在瀏覽器中雙擊打開 `index.html` 即可遊玩！
- 或使用 Python 快速架設本地伺服器：
  ```bash
  python -m http.server 8080
  ```
  打開瀏覽器造訪 `http://localhost:8080`。
