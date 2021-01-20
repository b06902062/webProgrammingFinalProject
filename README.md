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

## 分工
- b06902062 陳法熏 - 整個前端
- b06902080 吳士綸 - 後端、資料庫、部分前端設計與效果

## 心得
這次報告深刻體會到有系統地進行的重要性。
首先，雖然知道函式不要寫太大，盡量拆成多個 component 去寫，但是若沒有一定程度的事先規劃或工作分配，
常常會為了方便而直接將相關卻屬於不同功能的 code 寫在同一個檔案，大幅增加後續維護的困難度。

再者便是外觀的部分，一開始雖然知道最好先把主要架構刻出來，
卻因為我們用到了 canvas 這個十分乖張的元素，導致我們希望畫面與裡面的內容可依據視窗大小作調整時，吃了十足的苦頭。
同時，畫面也多次因應各種功能的需求做了排版上的調整，若能事先規劃好可能可以少走許多冤枉路。

如果可以回到當初重頭寫起，可能不需要一半的時間便可以完成，還可以避免寫出一堆很醜的 code ，
但這也說明了這次報告所獲得的，不僅是作品與分數，更多的是那些無法取代也很難從其他管道獲得的寶貴經驗。
