// --- 圓的設定 ---
let circles = [];
const COLORS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
const NUM_CIRCLES = 20;
const SCORE_COLOR_HEX = '#ffca3a'; // 加分氣球的 HEX 顏色

// 新增：粒子系統（爆破碎片）
let particles = [];

// 可調整參數
const GRAVITY = 0.06;     // 粒子重力

// 新增：遊戲相關參數
let score = 0; // 遊戲分數
const TEXT_SIZE = 32; // 文字大小

// 注意：若要加入音效，您需要在 setup() 中加入 userStartAudio()
// 並且在 triggerBurst 函式中呼叫 popSound.play()。
// 這裡僅保留結構，未包含音效載入邏輯。

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始化圓
  circles = [];
  for (let i = 0; i < NUM_CIRCLES; i++) {
    const hex = random(COLORS);
    circles.push({
      x: random(width),
      y: random(height),
      r: random(50, 200),
      hex: hex,             // 儲存 Hex 顏色字串 (用於計分比對)
      color: color(hex),    // 儲存 p5.Color 物件 (用於繪圖)
      alpha: random(80, 255),
      speed: random(1, 5)
    });
  }

  // 設定文字對齊方式
  textAlign(LEFT, TOP);
  textSize(TEXT_SIZE);
  rectMode(CENTER); // 確保方形繪製模式正確
}

function draw() {
  background('#fcf6bd');
  noStroke();

  for (let c of circles) {
    // 上升
    c.y -= c.speed;

    // *** 移除隨機爆破邏輯，改由 mousePressed 處理爆破 ***

    // 若完全移出頂端，從底部重生 (非爆破，僅持續飄浮)
    if (c.y + c.r / 2 < 0) {
      respawnCircle(c);
      continue;
    }

    // 繪製圓
    c.color.setAlpha(c.alpha);
    fill(c.color);
    circle(c.x, c.y, c.r);

    // 繪製圓右上方的小方形
    let squareSize = c.r / 6;
    let angle = -PI / 4;
    let distance = c.r / 2 * 0.65;
    let squareCenterX = c.x + cos(angle) * distance;
    let squareCenterY = c.y + sin(angle) * distance;
    fill(255, 255, 255, 120);
    noStroke();
    rect(squareCenterX, squareCenterY, squareSize, squareSize);
  }

  // 更新並繪製粒子
  updateAndDrawParticles();
  
  // 繪製靜態文字與得分
  drawTextDisplay();
}

// *** 點擊爆破與計分邏輯 ***
function mousePressed() {
  // 倒序檢查圓形，以確保點擊到最上層的圓
  for (let i = circles.length - 1; i >= 0; i--) {
    let c = circles[i];
    
    // 檢查滑鼠是否在圓形範圍內
    let distance = dist(mouseX, mouseY, c.x, c.y);
    if (distance < c.r / 2) {
      
      // 1. 執行計分邏輯
      if (c.hex.toLowerCase() === SCORE_COLOR_HEX) {
        score += 1; // 點擊 ffca3a 氣球，加一分
      } else {
        score -= 1; // 點擊其他顏色氣球，扣一分
      }
      
      // 2. 觸發爆破特效
      triggerBurst(c);
      
      // 3. 重置氣球（從底部出現）
      respawnCircle(c); 
      
      // 4. 停止檢查，只處理一個圓形
      return; 
    }
  }
}

// 繪製左上角和右上角的文字
function drawTextDisplay() {
  fill(0); // 文字顏色設為黑色
  textSize(TEXT_SIZE);
  
  // 左上角文字 (置於 (10, 10))
  textAlign(LEFT, TOP);
  text("414730027", 10, 10);

  // 右上角文字 (置於右邊邊界 - 10)
  textAlign(RIGHT, TOP);
  text("得分分數: " + score, width - 10, 10);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新分布圓的位置
  for (let c of circles) {
    c.x = random(width);
    c.y = random(height);
  }
}

// 產生爆破粒子的函式（依氣球大小調整數量與速度）
function triggerBurst(circle) {
  // *** 若有音效，應在此處呼叫 popSound.play() ***
  
  let count = floor(map(circle.r, 50, 200, 12, 40));
  let baseColor = circle.color;
  let rCol = red(baseColor), gCol = green(baseColor), bCol = blue(baseColor);

  for (let i = 0; i < count; i++) {
    let angle = random(TWO_PI);
    let speed = random(1, map(circle.r, 50, 200, 2, 6));
    let vx = cos(angle) * speed;
    let vy = sin(angle) * speed - random(0.5, 2); // 部分向上初速
    particles.push({
      x: circle.x + random(-circle.r * 0.1, circle.r * 0.1),
      y: circle.y + random(-circle.r * 0.1, circle.r * 0.1),
      vx: vx,
      vy: vy,
      life: random(40, 120),
      size: random(circle.r * 0.03, circle.r * 0.12),
      color: color(rCol, gCol, bCol, 255)
    });
  }
}

// 更新並繪製粒子，並移除已消失的粒子
function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += GRAVITY;
    p.life -= 2;

    // 透明度依生命值漸變
    let a = map(p.life, 0, 120, 0, 255);
    p.color.setAlpha(a);

    noStroke();
    fill(p.color);
    ellipse(p.x, p.y, p.size);

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// 重生氣球（從底部出現）
function respawnCircle(c) {
  const hex = random(COLORS);
  c.x = random(width);
  c.y = height + c.r / 2; // 從底部重新出現
  c.r = random(50, 200);
  c.hex = hex;              // 更新 Hex 顏色字串
  c.color = color(hex);     // 更新 p5.Color 物件
  c.alpha = random(80, 255);
  c.speed = random(1, 5);
}