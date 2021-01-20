# [109-1] Web Programming Final
### (Group 99) MuseOptimus
#### Deployed: https://musicai.citi.sinica.edu.tw/museoptimus
#### Demo 影片: https://www.facebook.com/100002809540176/videos/3060221340748154/
#### 投影片: https://slides.com/slseanwu/museoptimus/fullscreen#/2/3
#### 使用/操作方式: 點擊連結即可開始

## Project Goal
1. 透過可調旋鈕讓使用者參與 AI 創作音樂的過程
2. 透過評分 & 推薦增加優秀創作的曝光度，
3. 讓使用者瞭解 AI 音樂的潛能，評分結果可作為模型訓練資料的 Crowdsourcing

## 介紹
#### 這邊主要介紹此服務對於AI創作音樂的可調參數與對應效果。
### 以Song #4作為範例:
![Alt text](./graph/originExample.png "Original Song #4")
#### 可以看到每個小結底下都有兩個參數，分別是控制**節奏緊湊度**的 Rhythm 與 控制**和聲飽滿度**的 Polyph。
#### 分別會對原曲的該個小節造成不同影響，將其調到各種極端值後可見以下結果。
![Alt text](./graph/composedExample.png "Composed Result")
#### 有些人可能已經感受到這兩個參數的影響了，還看不出效果的話沒有關係，我們進一步看下去。

### 我們將兩張圖放在一起比較會發現:
#### 第一個小節，可以明顯地看到新的曲子照著原曲的脈絡*長胖了*，也就是一次按下去的音變多了、和聲變得飽和
![Alt text](./graph/bar1compare.png "bar 1")
#### 第二個小節大致與原曲脈絡一致，但是音符長度變得很長
  ![Alt text](./graph/bar2compare.png "bar 2")
#### 第三個小節，音符變得短而急促
  ![Alt text](./graph/bar3compare.png "bar 3")
#### 第四個小節，每個音符都形單影薄
  ![Alt text](./graph/bar4compare.png "bar 4")
#### 整個比較下來可以發現，創作出來的歌與原曲脈絡相仿，但隨著 Rhythm(節奏/橫向) 與 Polyph(和聲/縱向) 的調整，歌曲會跟著出現與對應的變化

## 使用工具
### Front end
  1. React
  2. HTML5 Canvas
  3. Soundfont Player
  4. Ant Design
  5. Material-UI
  6. Axios
### Back end
  1. Python
  2. Flask
  3. PyTorch
  4. FluidSynth
### Database
  1. MongoDB
  2. PyMongo

## 心得:
寫報告寫到還沒選課，有人有推薦的課嗎?
