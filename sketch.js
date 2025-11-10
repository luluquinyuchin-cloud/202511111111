// reference[function lines's formula and code]:uila(@muilavalium) https://twitter.com/muilavalium/status/1407907000575565825
// reference [resize]: Bárbara Almeida https://openprocessing.org/crayon/9/1
const palettes = [
    ['#413e4a', '#73626e', '#b38184', '#f0b49e', '#f7e4be'],
    ['#e8ddcb', '#cdb380', '#036564', '#033649', '#031634'],
    ['#223843', '#e9dbce', '#eff1f3', '#dbd3d8', '#d8b4a0', '#d77a61'],
    ['#e29578', '#ffffff', '#006d77', '#83c5be', '#ffddd2', '#edf6f9'],
    ['#594f4f', '#547980', '#45ada8', '#9de0ad', '#e5fcc2'],
    ['#333333', '#8bc9c3', '#ffae43', '#ea432c', '#228345', '#d1d7d3', '#524e9c', '#9dc35e', '#f0a1a1'],
    ['#e3cd98', '#c37c2b', '#f6ecce', '#333333', '#386a7a']
];
let a, d, x, y, h, s;
let t = 0.0;
let vel = 0.02;
let bg;
let palette_selected;
let pg, cc;

/** OPC START **/
let seed, formation, colors, fluctuation, star_shape, star_size, ghosts;
if (typeof OPC !== 'undefined') {
    OPC.slider('seed', ~~(Math.random() * 1000), 0, 1000);
    OPC.slider('formation', ~~(Math.random() * (4-1)+1), 1, 3, 1);
    OPC.slider('colors', ~~(Math.random() * palettes.length), 0, palettes.length-1, 1);
    OPC.slider('fluctuation', ~~(Math.random() * 5), 0, 5,1);
    OPC.slider('star_shape', (Math.random().toFixed(2)), 0, 1, 0.01);
    OPC.slider('star_size', ~~(Math.random()*(10-(-10)+(-10))), -10, 10, 0.1);
    OPC.slider('ghosts', (Math.random().toFixed(1)), 0, 1, 0.1);
} else {
    // 后备默认值（可根据需要调整）
    seed = ~~(Math.random() * 1000);
    formation = Math.floor(Math.random() * 3) + 1; // 1..3
    colors = Math.floor(Math.random() * palettes.length);
    fluctuation = Math.floor(Math.random() * 6); // 0..5
    star_shape = parseFloat(Math.random().toFixed(2));
    star_size = (Math.random() * 20) - 10; // -10..10
    ghosts = parseFloat(Math.random().toFixed(1)); // 0.0..1.0
}
/** OPC END **/

// 全局變數用於測驗系統
let quizP5Instance; // 儲存測驗 P5 實例的變數
let quizModalContainer; // 測驗畫面的 DOM 容器

function setup() {
    createCanvas(windowWidth, windowHeight);
    pg = createGraphics(width, height)
    pg.fill(220, 80);
    pg.noStroke();
    bg = min(windowWidth*0.8, windowHeight*0.8)
    let bgStarNum = bg * 2
    let bgStarSize = bg * 0.001;
    for (let i = 0; i < bgStarNum; i++) {
        pg.ellipse(random(width), random(height), random(1) < 0.95 ? random(bgStarSize, bgStarSize * 3) : random(bgStarSize * 6, bgStarSize * 8))
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    //reset();
}

function mouseClicked() {
    // 避免點擊測驗畫面時觸發背景 P5 畫布的 shuffle
    if (!quizModalContainer || quizModalContainer.style.display !== 'block') {
      shuffle(palette_selected, true);
    }
}

function draw() {
    randomSeed(seed);
    palette_selected = palettes[colors];
    background(palette_selected[0]);
    image(pg, 0, 0)
    noStroke();
    translate(width/2,height/2)
    if (formation == 1) {
        lines();
    } else if (formation == 2) {
        spiral();
    } else if (formation == 3) {
        tile();
    }
    t += vel;
}

function lines() {
    for (let j = -bg/2; j < bg/2; j += bg/4) {
        push();
        translate(-bg / 2-bg*0.1, j)
        let a = PI /12
        rotate(-a / 2);
        push();
        x = bg /4;
        y = x * tan(a / 2);
        h = sqrt(sq(x) + sq(y));
        s = (h + y) / (h - y);

        while (x < bg) {
            let colNum = int(random(1, palette_selected.length));
            cc = color(palette_selected[colNum]);
            if (random(1) < ghosts) {
                ghost(x, y+bg*0.04, (1.5 * y),(1.5 * y)* 1.5, random(1) > 0.5 ? 1 : 2, a)
            } else {
                star(x, y+bg*0.04, (1.5 * y)*0.35, cc)
            }
            push();
            translate(bg * 0.15, bg*0.32)
            if (random(1) < ghosts) {
                ghost(bg-x, -y, (1.5 * y), (1.5 * y) * 1.5, random(1) > 0.5 ? 1 : 2, a)
            } else {
                star(bg-x, -y, (1.5 * y) * 0.35, cc)
            }
            pop();
            x = x * s;
            y = y * s;
        }
        pop();
        pop();
    }
}

function spiral() {
    push();
    let pos = createVector(0, 0)
    let step = 2 * PI * 0.08;
    let num2 = (TWO_PI * 10) + PI
    let radius = width * 0.02;
    let pnum = 1.1;
    for (let i = 0; i < num2; i += step) {
        let colNum = int(random(1, palette_selected.length));
        cc = color(palette_selected[colNum]);
        push();
        pos.x = radius * pow(pnum, i) * sin(i);
        pos.y = radius * pow(pnum, i) * cos(i)
        let d = abs(pow(pnum, i) * (bg * 0.018));
        let angle = pos.heading();

        translate(pos.x, pos.y);
        fill(255)
        if (random(1) < ghosts) {
            ghost(0, 0, d, d * 1.5, random(1) > 0.5 ? 1 : 2, angle * 2)
        } else {
            star(0, 0, d * 0.3, cc)
        }
        pop();
    }
    pop();
}

function tile() {
    let count = 6;
    let w =bg / count;
    for (var j = 0; j < count; j++) {
        for (var i = 0; i < count; i++) {
            let colNum = int(random(1, palette_selected.length));
            cc = color(palette_selected[colNum]);
            let x = -bg / 2 + i * w+ w / 2;
            let y = -bg / 2 + j * w+ w / 2;
            push();
            translate( x, y )
            if (random(1) < ghosts) {
                ghost(0, 0, w, w * 1.5, random(1) > 0.5 ? 1 : 2, 0)
            } else {
                star(0, 0, w * 0.35, cc);
            }
            pop();

        }
    }
}

function star(x, y, d, cc) {
    push();
    fill(cc);
    noStroke();
    push();
    translate(x, y)
    let points = int(random(3, 12))
    let angle = TAU / points;
    let rBase = d + (d*star_size)*0.1
    let xInit = -10;
    let yInit = -10
    let rDiv = width * 0.01;

    beginShape();
    // 修正：為每次迭代計算 radian，避免未初始化導致 NaN
    for (let i = 0; i < points + 3; i++) {
        let radian = i / points;
        let pN = noise(xInit + (rBase) * cos(TAU * radian) * 0.2, yInit + (rBase) * sin(TAU * radian) * 0.5, t*fluctuation);
        let pR = (rBase) + rDiv * noise(pN);
        let pX = xInit + pR * cos(TAU * radian);
        let pY = yInit + pR * sin(TAU * radian); 
        curveVertex(pX, pY); 
        pX = xInit + (pR * star_shape) * cos(TAU * radian + (angle * 0.5)); 
        pY = yInit + (pR * star_shape) * sin(TAU * radian + (angle * 0.5)); 
        curveVertex(pX, pY);
    }
    endShape(CLOSE);
    pop();
    pop();
}

function ghost(x, y, w, h, ran, a) {
    let size = 5;
    let hW = w / (size * 0.8);
    let hH = h / (size);
    let eyecol = color(100, 10, 10)
    let bodycol = ["#ffffff", "#fbfefb"];
    noStroke();
    push();
    translate(x , y - hH * 0.5);
    rotate(a / 2)
    push();
    //leg_shadow-----
    fill(100);
    beginShape();
    vertex(-hW * 0.95, 0);
    vertex(hW * 0.95, 0);
    for (let i = hW; i > -hW + 1; i -= 1) {
        let y = hH + hH / 10 * cos(radians(i / (hW / 500)) + t);
        vertex(i, y);
    }
    vertex(-hW, hH);
    endShape();

    //ghost_body-----
    fill(random(bodycol));
    beginShape();
    vertex(hW, 0);
    bezierVertex(hW * 1.1, -hH * 1.35, -hW * 1.1, -hH * 1.35, -hW, 0);
    vertex(-hW, hH);
    for (let i = -hW; i < hW + 1; i += 1) {
        let y = hH + hH / 10 * sin(radians(i / (hW / 500)) - t);
        vertex(i, y);
    }
    vertex(hW, 0);
    endShape();
    pop();
    //eye
    let rannum = random(1) > 0.5 ? 1 : 2
    if (ran == 1) {

        fill(eyecol);
        strokeCap(ROUND)
        if (rannum == 1) {
            ellipse(-hW / 2, -hH / 2, hW / 5);
            ellipse(hW / 5, -hH / 2, hW / 5);
        } else {
            ellipse(hW / 2, -hH / 2, hW / 5);
            ellipse(-hW / 5, -hH / 2, hW / 5);
        }

    } else {
        stroke(eyecol);
        strokeWeight(hW / 10)
        noFill();
        if (rannum == 1) {
            arc(-hW / 2, -hH / 2, hW / 5, hW / 5, TWO_PI, PI);
            arc(hW / 5, -hH / 2, hW / 5, hW / 5, TWO_PI, PI);
        } else {
            arc(hW / 2, -hH / 2, hW / 5, hW / 5, TWO_PI, PI);
            arc(-hW / 5, -hH / 2, hW / 5, hW / 5, TWO_PI, PI);
        }
    }
    pop();
}


// ==========================================================
// === 核心測驗功能 (QuizApp) - 封裝您的測驗邏輯 ===
// ==========================================================
class QuizApp {
    // 💥 修正：將內部類別 ShineParticle 定義為 QuizApp 的靜態屬性或使用 Class Expression 
    // 這樣在 constructor 之後才能使用 'new this.ShineParticle(...)'
    ShineParticle = class {
        constructor(p, x, y) {
            this.p = p;
            this.pos = p.createVector(x, y); 
            this.vel = p.p5.Vector.random2D().mult(p.random(1, 3)); 
            this.lifespan = p.random(100, 200); 
            this.maxLifespan = this.lifespan;
            this.size = p.random(3, 6);
            this.particleColor = p.color(255, 255, 100); 
        }

        update() {
            this.pos.add(this.vel);
            this.lifespan -= 3; 
        }

        display() {
            this.p.push();
            this.p.noStroke();
            let alpha = this.p.map(this.lifespan, 0, this.maxLifespan, 0, 255);
            this.particleColor.setAlpha(alpha);
            this.p.fill(this.particleColor);
            this.p.ellipse(this.pos.x, this.pos.y, this.size);
            this.p.pop();
        }

        isFinished() {
            return this.lifespan < 0;
        }
    }

    constructor(p) {
        this.p = p; // p5 實例
        this.initializeData();
        // 綁定 p5 核心函式
        this.p.setup = this.setup.bind(this);
        this.p.draw = this.draw.bind(this);
        this.p.mousePressed = this.mousePressed.bind(this);
    }

    initializeData() {
        this.allQuestions = [
            {
                question: "p5.js 中的 draw() 函數會如何運行？",
                options: ["A. 只運行一次", "B. 每秒運行一次", "C. 重複循環運行", "D. 只有點擊鼠標時運行"],
                answer: "C",
                explanation: "draw() 函式是 p5.js 程式的核心，它會被主循環（Loop）持續調用，通常每秒 60 次。"
            },
            {
                question: "在 p5.js 中，什麼是用來改變背景顏色的函數？",
                options: ["A. color()", "B. stroke()", "C. fill()", "D. background()"],
                answer: "D",
                explanation: "background() 用於設定畫布的背景顏色，fill() 用於設定圖形內部的顏色。"
            },
            {
                question: "在 JavaScript 中，用於宣告變數的關鍵字是什麼？",
                options: ["A. var", "B. let", "C. const", "D. 以上皆是"],
                answer: "D",
                explanation: "var, let, const 都是用於宣告變數的有效關鍵字。"
            },
            {
                question: "p5.js 中，畫筆顏色設定的函數是？",
                options: ["A. fill()", "B. stroke()", "C. color()", "D. line()"],
                answer: "B",
                explanation: "stroke() 設定圖形邊框（畫筆）的顏色，fill() 設定內部填充顏色。"
            },
            {
                question: "在 JavaScript 中，if 條件判斷的正確語法結構是？",
                options: ["A. if (condition) { ... }", "B. if condition then { ... }", "C. if condition { ... }", "D. if condition()"],
                answer: "A",
                explanation: "標準的 JavaScript 條件語法是 if 後面跟著括號包圍的條件。"
            },
            {
                question: "p5.js 中哪個函數用於在畫布上繪製一個圓形？",
                options: ["A. rect()", "B. circle()", "C. ellipse()", "D. point()"],
                answer: "C",
                explanation: "ellipse() 是最通用的繪製橢圓/圓形的函數，雖然 circle() 也存在，但 ellipse() 更基礎。"
            },
            {
                question: "在 JavaScript 中，'+=' 運算子代表什麼？",
                options: ["A. 加法並賦值", "B. 數組拼接", "C. 僅加法", "D. 錯誤的運算子"],
                answer: "A",
                explanation: "a += b 相當於 a = a + b。"
            },
            {
                question: "p5.js 函數 setup() 執行於何時？",
                options: ["A. 在 draw() 之前", "B. 在 draw() 之後", "C. draw() 循環的每一步", "D. 當滑鼠被按下時"],
                answer: "A",
                explanation: "setup() 只會執行一次，在程式碼開始和 draw() 循環開始前執行。"
            },
            {
                question: "以下哪種結構在 p5.js 中用於定義一個可重複使用的功能塊？",
                options: ["A. class", "B. object", "C. function", "D. let"],
                answer: "C",
                explanation: "function 用於定義可重複執行的代碼塊，class 則用於定義物件藍圖。"
            },
            {
                question: "在 for 迴圈中，要讓它永遠執行，應該如何設定條件？",
                options: ["A. for (let i = 0; i < 1; i++)", "B. for (let i = 0; ; i++)", "C. for (let i = 0; i < infinity; i++)", "D. for (let i = 0; i < 100; i++)"],
                answer: "B",
                explanation: "for (let i = 0; ; i++) 的中間條件部分留空，表示條件永遠為 true，形成無限循環。"
            }
        ];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizState = 'start'; // 'start', 'question', 'feedback', 'result'
        this.feedbackText = "";
        this.feedbackY = -450;
        this.isAnswerCorrect = false;
        this.particles = [];
        this.quizSet = []; // 本次測驗的 5 道題目副本
    }

    // 核心方法 (綁定到 P5 實例)
    setup() {
        this.p.createCanvas(650, 450); 
        this.p.textAlign(this.p.CENTER, this.p.CENTER); 
        this.p.rectMode(this.p.CENTER);        
        this.p.textSize(20);
    }

    draw() {
        this.p.background(240); 

        if (this.quizState === 'start') {
            this.drawStartScreen();
        } else if (this.quizState === 'question') {
            this.drawQuestion();
        } else if (this.quizState === 'result') {
            this.drawResultScreen();
        }

        if (this.quizState === 'feedback') {
            this.drawFeedbackScreen();
        }
        
        // 粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            this.particles[i].display();
            if (this.particles[i].isFinished()) {
                this.particles.splice(i, 1); 
            }
        }
    }

    // 輔助方法 (必須用 this.p. 開頭調用所有 p5 函數)
    checkClick(x, y, w, h) {
        const p = this.p;
        return p.mouseX > x - w / 2 && p.mouseX < x + w / 2 &&
             p.mouseY > y - h / 2 && p.mouseY < y + h / 2;
    }

    drawButton(x, y, w, h, label) {
        const p = this.p;
        let isHover = this.checkClick(x, y, w, h); 
        let boxColor = p.color(200); 

        if (isHover && (this.quizState === 'question' || this.quizState === 'start')) {
            boxColor = p.color(180, 220, 255); 
            if (p.frameCount % 3 === 0) { 
                // 使用修正後的內部類別名稱
                this.particles.push(new this.ShineParticle(p, p.mouseX, p.mouseY)); 
            }
        } 

        p.push(); 
        p.noStroke(); 
        p.fill(boxColor); 
        p.rect(x, y, w, h, 10); 
        p.fill(0); 
        p.text(label, x, y); 
        p.pop(); 
    }

    drawTextButton(x, y, label, state) {
        const p = this.p;
        let isHover = this.checkClick(x, y, p.textWidth(label) + 20, 30); 
        
        p.push();
        if (isHover && this.quizState === state) {
            p.fill(state === 'feedback' ? 255 : 0, state === 'feedback' ? 255 : 100, 0); 
            p.text("— " + label + " —", x, y); 
            
            if (p.frameCount % 2 === 0) { 
                // 使用修正後的內部類別名稱
                this.particles.push(new this.ShineParticle(p, p.mouseX, p.mouseY));
            }
        } else {
            p.fill(state === 'feedback' ? 255 : 50); 
            p.text(label, x, y);
        }
        p.pop();
    }

    // 繪圖函數
    drawStartScreen() {
        const p = this.p;
        p.textSize(32);
        p.fill(50);
        p.text("p5.js 程式設計測驗", p.width / 2, p.height / 3);
        p.textSize(24);
        this.drawButton(p.width / 2, p.height / 2 + 50, 180, 60, "點擊開始"); 
    }

    drawQuestion() {
        const p = this.p;
        let q = this.quizSet[this.currentQuestionIndex];
        
        p.textSize(16);
        p.fill(100);
        p.text(`問題 ${this.currentQuestionIndex + 1} / ${this.quizSet.length}`, p.width / 2, 20); 

        p.textSize(24);
        p.fill(0);
        p.text(q.question, p.width / 2, 100); 

        p.textSize(20);
        let startY = p.height / 2 - 50; 
        for (let i = 0; i < q.options.length; i++) {
            let y = startY + i * 70; 
            this.drawButton(p.width / 2, y, 400, 50, q.options[i]);
        }
    }

    drawFeedbackScreen() {
        const p = this.p;
        let targetY = 0; 
        this.feedbackY = p.lerp(this.feedbackY, targetY, 0.1); 

        p.push();
        p.fill(0, 0, 0, 200); 
        p.rect(p.width / 2, p.height / 2 + this.feedbackY, p.width, p.height); 
        p.pop();

        p.push();
        p.translate(0, this.feedbackY); 

        let isCorrect = this.isAnswerCorrect; 

        p.textSize(48);
        p.fill(isCorrect ? p.color(0, 200, 0) : p.color(255, 50, 50)); 
        p.text(isCorrect ? "回答正確！🎉" : "回答錯誤！😔", p.width / 2, p.height / 2 - 50);

        p.textSize(20);
        p.fill(255); 
        if (!isCorrect) {
            p.text(this.feedbackText, p.width / 2, p.height / 2 + 20); 
        } else {
            p.text("點擊繼續進行下一題。", p.width / 2, p.height / 2 + 20);
        }
        
        p.textSize(24);
        let buttonY = p.height - 30; 
        
        this.drawTextButton(p.width / 2, buttonY, "點擊繼續", 'feedback');
        
        p.pop(); 
    }

    drawResultScreen() {
        const p = this.p;
        p.textSize(36);
        p.fill(0, 100, 150);
        p.text("測驗完成！成績結算", p.width / 2, p.height / 3);

        p.textSize(30);
        p.fill(50);
        p.text(`您的最終得分是：${this.score} / ${this.quizSet.length}`, p.width / 2, p.height / 2); 
        
        p.textSize(24);
        let buttonY = p.height * 0.7;
        this.drawTextButton(p.width / 2, buttonY, "點擊重新開始", 'result');

        // 新增關閉按鈕
        p.textSize(18);
        this.drawTextButton(p.width / 2, p.height * 0.85, "關閉測驗", 'resultClose');
    }


    // 邏輯函數
    initializeQuizSet() {
        let shuffledQuestions = [...this.allQuestions];
        this.p.shuffle(shuffledQuestions, true);
        this.quizSet = shuffledQuestions.slice(0, 5);
    }

    checkAnswer(selected) {
        let q = this.quizSet[this.currentQuestionIndex];

        const userAnswer = selected.trim().toUpperCase(); 
        const correctAnswer = q.answer.trim().toUpperCase(); 

        if (userAnswer === correctAnswer) {
            this.score++;
            this.feedbackText = "回答正確！"; 
            this.isAnswerCorrect = true; 
        } else {
            this.feedbackText = q.explanation;
            this.isAnswerCorrect = false; 
        }

        this.quizState = 'feedback';
        this.feedbackY = -450; 
    }

    resetQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizState = 'start'; 
        this.feedbackText = "";
        this.feedbackY = -450;
        this.isAnswerCorrect = false;
        this.quizSet = []; 
    }

    mousePressed() {
        const p = this.p;
        if (this.quizState === 'start') {
            if (this.checkClick(p.width / 2, p.height / 2 + 50, 180, 60)) {
                this.initializeQuizSet();
                this.quizState = 'question';
            }
        } else if (this.quizState === 'question') {
            let q = this.quizSet[this.currentQuestionIndex];
            let startY = p.height / 2 - 50; 
            for (let i = 0; i < q.options.length; i++) {
                let optionY = startY + i * 70;
                if (this.checkClick(p.width / 2, optionY, 400, 50)) { 
                    let selectedOptionLetter = String.fromCharCode(65 + i); 
                    this.checkAnswer(selectedOptionLetter);
                    return; 
                }
            }
        } 
        
        else if (this.quizState === 'feedback') {
            let textButtonY = p.height - 30; 
            
            if (this.checkClick(p.width / 2, textButtonY, 200, 30)) { 
                this.currentQuestionIndex++;
                this.feedbackText = "";
                if (this.currentQuestionIndex < this.quizSet.length) { 
                    this.quizState = 'question';
                } else {
                    this.quizState = 'result'; 
                }
            }
        }
        
        else if (this.quizState === 'result') {
            let restartButtonY = p.height * 0.7; 
            let closeButtonY = p.height * 0.85; 

            if (this.checkClick(p.width / 2, restartButtonY, 300, 30)) { 
                this.resetQuiz(); 
            } else if (this.checkClick(p.width / 2, closeButtonY, 200, 30)) {
                // 關閉按鈕邏輯
                closeQuizModal(); 
            }
        }
    }
}


// ==========================================================
// === 測驗彈窗控制邏輯 (DOM/JS) ===
// ==========================================================

function createQuizModal() {
    // 創建一個 DOM 元素作為 P5 測驗畫布的容器
    quizModalContainer = document.createElement('div');
    quizModalContainer.id = 'quiz-modal-container';
    document.body.appendChild(quizModalContainer);
    
    // 設置容器樣式 (使其成為中央彈窗)
    quizModalContainer.style.position = 'fixed';
    quizModalContainer.style.top = '50%';
    quizModalContainer.style.left = '50%';
    quizModalContainer.style.transform = 'translate(-50%, -50%)';
    quizModalContainer.style.zIndex = '2000'; // 確保在頂層
    quizModalContainer.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    quizModalContainer.style.borderRadius = '10px';
    quizModalContainer.style.overflow = 'hidden';
    quizModalContainer.style.display = 'none'; // 預設隱藏

    // 創建一個新的 P5 實例並放入容器
    // 💥 修正：將 QuizApp 實例化邏輯從內聯函式中取出，確保作用域正確
    quizP5Instance = new p5(function(p) {
        // 將 QuizApp 的實例保存到 p.app，方便以後訪問狀態
        p.app = new QuizApp(p);
    }, 'quiz-modal-container');
}

function launchP5Quiz() {
    if (!quizModalContainer) {
        createQuizModal();
    }

    // 確保 P5 實例的繪圖循環正在運行
    if (quizP5Instance && !quizP5Instance.isLooping()) {
        quizP5Instance.loop();
    }
    
    // 顯示彈窗並隱藏漢堡選單 (可選)
    quizModalContainer.style.display = 'block';
    // 確保彈窗出現時，背景的 P5 畫布暫停
    noLoop(); 
    
    // 重新初始化測驗狀態，確保從開始畫面開始
    // 💥 修正：訪問 QuizApp 實例的 resetQuiz 函式
    if (quizP5Instance && quizP5Instance.app && quizP5Instance.app.resetQuiz) {
      quizP5Instance.app.resetQuiz();
    }
}

function closeQuizModal() {
    if (quizModalContainer) {
        quizModalContainer.style.display = 'none';
    }
    
    // 恢復背景 P5 畫布的繪圖循環
    loop(); 
    
    // 停止測驗 P5 實例的繪圖循環
    if (quizP5Instance && quizP5Instance.isLooping()) {
      // 💥 修正：確保 noLoop() 在 P5 實例上被調用
      quizP5Instance.noLoop(); 
    }
}


// ==========================================================
// === 漢堡選單 DOM/CSS/JS 邏輯 (無語法錯誤，保留) ===
// ==========================================================

// 創建全局變量來追蹤選單狀態
let isMenuOpen = false;
let globalMenuWidth = 0;
let menuContainerRef = null;

document.addEventListener('DOMContentLoaded', function() {

    // 定義選單項目內容及對應的連結 (將 '測驗系統' 的 action 設為 launchP5Quiz)
    const menuItems = [
        { name: '作品一 泡泡', url: 'https://luluquinyuchin-cloud.github.io/20251014_1/', isAction: false, submenu: null },
        { name: '作品二 泡泡筆記', url: 'https://hackmd.io/@tVINjW-9Sh-zy8GAA_LLcg/HJBgKd12xg', isAction: false, submenu: null },
        { name: '作品三 測驗系統', url: '#', isAction: true, action: launchP5Quiz, submenu: null }, 
        { name: '作品四 自我介紹', url: '', isAction: false, submenu: null },
        { name: '作品五 期中筆記', url: 'https://hackmd.io/@tVINjW-9Sh-zy8GAA_LLcg/1234567', isAction: false, submenu: null },
        { 
            name: '淡江大學', 
            url: 'https://www.tku.edu.tw/', 
            isAction: false,
            submenu: [
                { name: '教育科技', url: 'https://www.et.tku.edu.tw/' }
            ]
        }
    ];

    // --- 1. 動態創建選單結構 ---
    let menuContainer = document.getElementById('menu-container');
    if (!menuContainer) {
        menuContainer = document.createElement('div');
        menuContainer.id = 'menu-container';
        document.body.appendChild(menuContainer);
    }
    menuContainerRef = menuContainer;
    
    const menuToggle = document.createElement('div');
    menuToggle.id = 'menu-toggle';
    menuToggle.innerHTML = '&#9776;'; 
    document.body.appendChild(menuToggle); 
    
    const menuList = document.createElement('ul');
    menuList.id = 'main-menu';
    menuContainer.appendChild(menuList);
    
    // --- 2. 處理選單項目的點擊事件 ---
    menuItems.forEach(item => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.textContent = item.name; 
        
        if (item.isAction && item.action) {
            link.href = '#';
            link.addEventListener('click', function(e) {
                e.preventDefault();
                item.action(); 
                toggleMenu(false); // 執行動作後自動關閉選單
            });
        } else {
            link.href = item.url;
        }

        listItem.style.position = 'relative'; 
        listItem.appendChild(link);
        
        // --- 處理二級選單 (保留原有邏輯) ---
        if (item.submenu) {
            const subMenuList = document.createElement('ul');
            subMenuList.className = 'sub-menu';
            
            subMenuList.style.position = 'absolute'; 
            subMenuList.style.top = '0'; 
            subMenuList.style.left = '100%'; 
            subMenuList.style.zIndex = '1001';
            subMenuList.style.backgroundColor = 'rgba(200, 200, 200, 0.95)'; 
            subMenuList.style.padding = '0';
            subMenuList.style.minWidth = '100%';
            subMenuList.style.display = 'none'; 

            item.submenu.forEach(subItem => {
                const subListItem = document.createElement('li');
                const subLink = document.createElement('a');
                subLink.textContent = subItem.name;
                subLink.href = subItem.url;
                subLink.style.padding = '10px';
                subLink.style.fontSize = '18px';
                subLink.style.color = '#333';
                subListItem.appendChild(subLink);
                subMenuList.appendChild(subListItem);
            });
            
            listItem.appendChild(subMenuList);
            
            // 設置滑鼠懸停事件來顯示子選單
            listItem.addEventListener('mouseenter', function() { subMenuList.style.display = 'block'; });
            listItem.addEventListener('mouseleave', function() { subMenuList.style.display = 'none'; });
        }
        
        menuList.appendChild(listItem);
    });

    // --- 3. 漢堡選單開/關邏輯 ---
    const showMenu = () => {
        menuContainerRef.style.transform = 'translateX(0)';
        menuToggle.textContent = '✖'; 
        isMenuOpen = true;
    };
    
    const hideMenu = () => {
        menuContainerRef.style.transform = `translateX(-${globalMenuWidth}px)`;
        menuToggle.innerHTML = '&#9776;'; 
        isMenuOpen = false;
    };

    const toggleMenu = (shouldOpen) => {
        if (typeof shouldOpen === 'boolean') {
            if (shouldOpen) {
                showMenu();
            } else {
                hideMenu();
            }
        } else {
            if (isMenuOpen) {
                hideMenu();
            } else {
                showMenu();
            }
        }
    };

    menuToggle.addEventListener('click', () => {
        toggleMenu();
    });

    // --- 4. 應用所有 CSS 樣式 (漢堡選單) ---

    menuToggle.style.position = 'fixed';
    menuToggle.style.top = '15px';
    menuToggle.style.left = '15px';
    menuToggle.style.zIndex = '1002'; 
    menuToggle.style.fontSize = '30px';
    menuToggle.style.fontWeight = 'bold';
    menuToggle.style.color = '#333';
    menuToggle.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    menuToggle.style.width = '40px';
    menuToggle.style.height = '40px';
    menuToggle.style.lineHeight = '40px';
    menuToggle.style.textAlign = 'center';
    menuToggle.style.borderRadius = '5px';
    menuToggle.style.cursor = 'pointer';
    menuToggle.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    menuToggle.style.transition = 'color 0.3s, background-color 0.3s';
    
    menuContainer.style.position = 'fixed';
    menuContainer.style.top = '0';
    menuContainer.style.left = '0';
    menuContainer.style.height = '100vh';
    menuContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; 
    menuContainer.style.zIndex = '1000';
    menuContainer.style.boxShadow = '2px 0 5px rgba(0, 0, 0, 0.3)';
    menuContainer.style.transition = 'transform 0.3s ease-in-out'; 
    menuContainer.style.paddingTop = '60px'; 

    menuList.style.listStyleType = 'none';
    menuList.style.padding = '0'; 
    menuList.style.margin = '0';
    
    menuContainer.querySelectorAll('li a').forEach(link => {
        link.style.display = 'block';
        link.style.textDecoration = 'none';
        link.style.color = '#333';
        link.style.fontSize = '20px';
        link.style.transition = 'background-color 0.2s, color 0.2s';
        
        if (link.parentElement.parentElement.id === 'main-menu') {
            link.style.padding = '15px 20px'; 
        }

        link.addEventListener('mouseenter', function() {
            this.style.color = 'white';
            this.style.backgroundColor = '#4CAF50'; 
        });
        link.addEventListener('mouseleave', function() {
            this.style.color = '#333';
            this.style.backgroundColor = 'transparent';
        });
    });

    menuContainer.style.width = '250px'; 

    setTimeout(() => {
        globalMenuWidth = menuContainer.getBoundingClientRect().width; 
        hideMenu(); 
    }, 0);
});

// 防止重复加载导致的重复声明错误
if (window.__sketch_js_loaded) {
    console.warn('sketch.js 已经加载，跳过重复执行。');
} else {
    window.__sketch_js_loaded = true;

    // reference[function lines's formula and code]:uila(@muilavalium) https://twitter.com/muilavalium/status/1407907000575565825
    // reference [resize]: Bárbara Almeida https://openprocessing.org/crayon/9/1
    const palettes = [
        ['#413e4a', '#73626e', '#b38184', '#f0b49e', '#f7e4be'],
        ['#e8ddcb', '#cdb380', '#036564', '#033649', '#031634'],
        ['#223843', '#e9dbce', '#eff1f3', '#dbd3d8', '#d8b4a0', '#d77a61'],
        ['#e29578', '#ffffff', '#006d77', '#83c5be', '#ffddd2', '#edf6f9'],
        ['#594f4f', '#547980', '#45ada8', '#9de0ad', '#e5fcc2'],
        ['#333333', '#8bc9c3', '#ffae43', '#ea432c', '#228345', '#d1d7d3', '#524e9c', '#9dc35e', '#f0a1a1'],
        ['#e3cd98', '#c37c2b', '#f6ecce', '#333333', '#386a7a']
    ];
    let a, d, x, y, h, s;
    let t = 0.0;
    let vel = 0.02;
    let bg;
    let palette_selected;
    let pg, cc;

    /** OPC START **/
    let seed, formation, colors, fluctuation, star_shape, star_size, ghosts;
    if (typeof OPC !== 'undefined') {
        OPC.slider('seed', ~~(Math.random() * 1000), 0, 1000);
        OPC.slider('formation', ~~(Math.random() * (4-1)+1), 1, 3, 1);
        OPC.slider('colors', ~~(Math.random() * palettes.length), 0, palettes.length-1, 1);
        OPC.slider('fluctuation', ~~(Math.random() * 5), 0, 5,1);
        OPC.slider('star_shape', (Math.random().toFixed(2)), 0, 1, 0.01);
        OPC.slider('star_size', ~~(Math.random()*(10-(-10)+(-10))), -10, 10, 0.1);
        OPC.slider('ghosts', (Math.random().toFixed(1)), 0, 1, 0.1);
    } else {
        // 后备默认值（可根据需要调整）
        seed = ~~(Math.random() * 1000);
        formation = Math.floor(Math.random() * 3) + 1; // 1..3
        colors = Math.floor(Math.random() * palettes.length);
        fluctuation = Math.floor(Math.random() * 6); // 0..5
        star_shape = parseFloat(Math.random().toFixed(2));
        star_size = (Math.random() * 20) - 10; // -10..10
        ghosts = parseFloat(Math.random().toFixed(1)); // 0.0..1.0
    }
    /** OPC END **/

    // 全局變數用於測驗系統
    let quizP5Instance; // 儲存測驗 P5 實例的變數
    let quizModalContainer; // 測驗畫面的 DOM 容器

    function setup() {
        createCanvas(windowWidth, windowHeight);
        pg = createGraphics(width, height)
        pg.fill(220, 80);
        pg.noStroke();
        bg = min(windowWidth*0.8, windowHeight*0.8)
        let bgStarNum = bg * 2
        let bgStarSize = bg * 0.001;
        for (let i = 0; i < bgStarNum; i++) {
            pg.ellipse(random(width), random(height), random(1) < 0.95 ? random(bgStarSize, bgStarSize * 3) : random(bgStarSize * 6, bgStarSize * 8))
        }
    }

    function windowResized() {
        resizeCanvas(windowWidth, windowHeight);
        //reset();
    }

    function mouseClicked() {
        // 避免點擊測驗畫面時觸發背景 P5 畫布的 shuffle
        if (!quizModalContainer || quizModalContainer.style.display !== 'block') {
          shuffle(palette_selected, true);
        }
    }

    function draw() {
        randomSeed(seed);
        palette_selected = palettes[colors];
        background(palette_selected[0]);
        image(pg, 0, 0)
        noStroke();
        translate(width/2,height/2)
        if (formation == 1) {
            lines();
        } else if (formation == 2) {
            spiral();
        } else if (formation == 3) {
            tile();
        }
        t += vel;
    }

    function lines() {
        for (let j = -bg/2; j < bg/2; j += bg/4) {
            push();
            translate(-bg / 2-bg*0.1, j)
            let a = PI /12
            rotate(-a / 2);
            push();
            x = bg /4;
            y = x * tan(a / 2);
            h = sqrt(sq(x) + sq(y));
            s = (h + y) / (h - y);

            while (x < bg) {
                let colNum = int(random(1, palette_selected.length));
                cc = color(palette_selected[colNum]);
                if (random(1) < ghosts) {
                    ghost(x, y+bg*0.04, (1.5 * y),(1.5 * y)* 1.5, random(1) > 0.5 ? 1 : 2, a)
                } else {
                    star(x, y+bg*0.04, (1.5 * y)*0.35, cc)
                }
                push();
                translate(bg * 0.15, bg*0.32)
                if (random(1) < ghosts) {
                    ghost(bg-x, -y, (1.5 * y), (1.5 * y) * 1.5, random(1) > 0.5 ? 1 : 2, a)
                } else {
                    star(bg-x, -y, (1.5 * y) * 0.35, cc)
                }
                pop();
                x = x * s;
                y = y * s;
            }
            pop();
            pop();
        }
    }

    function spiral() {
        push();
        let pos = createVector(0, 0)
        let step = 2 * PI * 0.08;
        let num2 = (TWO_PI * 10) + PI
        let radius = width * 0.02;
        let pnum = 1.1;
        for (let i = 0; i < num2; i += step) {
            let colNum = int(random(1, palette_selected.length));
            cc = color(palette_selected[colNum]);
            push();
            pos.x = radius * pow(pnum, i) * sin(i);
            pos.y = radius * pow(pnum, i) * cos(i)
            let d = abs(pow(pnum, i) * (bg * 0.018));
            let angle = pos.heading();

            translate(pos.x, pos.y);
            fill(255)
            if (random(1) < ghosts) {
                ghost(0, 0, d, d * 1.5, random(1) > 0.5 ? 1 : 2, angle * 2)
            } else {
                star(0, 0, d * 0.3, cc)
            }
            pop();
        }
        pop();
    }

    function tile() {
        let count = 6;
        let w =bg / count;
        for (var j = 0; j < count; j++) {
            for (var i = 0; i < count; i++) {
                let colNum = int(random(1, palette_selected.length));
                cc = color(palette_selected[colNum]);
                let x = -bg / 2 + i * w+ w / 2;
                let y = -bg / 2 + j * w+ w / 2;
                push();
                translate( x, y )
                if (random(1) < ghosts) {
                    ghost(0, 0, w, w * 1.5, random(1) > 0.5 ? 1 : 2, 0)
                } else {
                    star(0, 0, w * 0.35, cc);
                }
                pop();

            }
        }
    }

    function star(x, y, d, cc) {
        push();
        fill(cc);
        noStroke();
        push();
        translate(x, y)
        let points = int(random(3, 12))
        let angle = TAU / points;
        let rBase = d + (d*star_size)*0.1
        let xInit = -10;
        let yInit = -10
        let rDiv = width * 0.01;

        beginShape();
        // 修正：為每次迭代計算 radian，避免未初始化導致 NaN
        for (let i = 0; i < points + 3; i++) {
            let radian = i / points;
            let pN = noise(xInit + (rBase) * cos(TAU * radian) * 0.2, yInit + (rBase) * sin(TAU * radian) * 0.5, t*fluctuation);
            let pR = (rBase) + rDiv * noise(pN);
            let pX = xInit + pR * cos(TAU * radian);
            let pY = yInit + pR * sin(TAU * radian); 
            curveVertex(pX, pY); 
            pX = xInit + (pR * star_shape) * cos(TAU * radian + (angle * 0.5)); 
            pY = yInit + (pR * star_shape) * sin(TAU * radian + (angle * 0.5)); 
            curveVertex(pX, pY);
        }
        endShape(CLOSE);
        pop();
        pop();
    }

    function ghost(x, y, w, h, ran, a) {
        let size = 5;
        let hW = w / (size * 0.8);
        let hH = h / (size);
        let eyecol = color(100, 10, 10)
        let bodycol = ["#ffffff", "#fbfefb"];
        noStroke();
        push();
        translate(x , y - hH * 0.5);
        rotate(a / 2)
        push();
        //leg_shadow-----
        fill(100);
        beginShape();
        vertex(-hW * 0.95, 0);
        vertex(hW * 0.95, 0);
        for (let i = hW; i > -hW + 1; i -= 1) {
            let y = hH + hH / 10 * cos(radians(i / (hW / 500)) + t);
            vertex(i, y);
        }
        vertex(-hW, hH);
        endShape();

        //ghost_body-----
        fill(random(bodycol));
        beginShape();
        vertex(hW, 0);
        bezierVertex(hW * 1.1, -hH * 1.35, -hW * 1.1, -hH * 1.35, -hW, 0);
        vertex(-hW, hH);
        for (let i = -hW; i < hW + 1; i += 1) {
            let y = hH + hH / 10 * sin(radians(i / (hW / 500)) - t);
            vertex(i, y);
        }
        vertex(hW, 0);
        endShape();
        pop();
        //eye
        let rannum = random(1) > 0.5 ? 1 : 2
        if (ran == 1) {

            fill(eyecol);
            strokeCap(ROUND)
            if (rannum == 1) {
                ellipse(-hW / 2, -hH / 2, hW / 5);
                ellipse(hW / 5, -hH / 2, hW / 5);
            } else {
                ellipse(hW / 2, -hH / 2, hW / 5);
                ellipse(-hW / 5, -hH / 2, hW / 5);
            }

        } else {
            stroke(eyecol);
            strokeWeight(hW / 10)
            noFill();
            if (rannum == 1) {
                arc(-hW / 2, -hH / 2, hW / 5, hW / 5, TWO_PI, PI);
                arc(hW / 5, -hH / 2, hW / 5, hW / 5, TWO_PI, PI);
            } else {
                arc(hW / 2, -hH / 2, hW / 5, hW / 5, TWO_PI, PI);
                arc(-hW / 5, -hH / 2, hW / 5, hW / 5, TWO_PI, PI);
            }
        }
        pop();
    }


    // ==========================================================
    // === 核心測驗功能 (QuizApp) - 封裝您的測驗邏輯 ===
    // ==========================================================
    class QuizApp {
        // 💥 修正：將內部類別 ShineParticle 定義為 QuizApp 的靜態屬性或使用 Class Expression 
        // 這樣在 constructor 之後才能使用 'new this.ShineParticle(...)'
        ShineParticle = class {
            constructor(p, x, y) {
                this.p = p;
                this.pos = p.createVector(x, y); 
                this.vel = p.p5.Vector.random2D().mult(p.random(1, 3)); 
                this.lifespan = p.random(100, 200); 
                this.maxLifespan = this.lifespan;
                this.size = p.random(3, 6);
                this.particleColor = p.color(255, 255, 100); 
            }

            update() {
                this.pos.add(this.vel);
                this.lifespan -= 3; 
            }

            display() {
                this.p.push();
                this.p.noStroke();
                let alpha = this.p.map(this.lifespan, 0, this.maxLifespan, 0, 255);
                this.particleColor.setAlpha(alpha);
                this.p.fill(this.particleColor);
                this.p.ellipse(this.pos.x, this.pos.y, this.size);
                this.p.pop();
            }

            isFinished() {
                return this.lifespan < 0;
            }
        }

        constructor(p) {
            this.p = p; // p5 實例
            this.initializeData();
            // 綁定 p5 核心函式
            this.p.setup = this.setup.bind(this);
            this.p.draw = this.draw.bind(this);
            this.p.mousePressed = this.mousePressed.bind(this);
        }

        initializeData() {
            this.allQuestions = [
                {
                    question: "p5.js 中的 draw() 函數會如何運行？",
                    options: ["A. 只運行一次", "B. 每秒運行一次", "C. 重複循環運行", "D. 只有點擊鼠標時運行"],
                    answer: "C",
                    explanation: "draw() 函式是 p5.js 程式的核心，它會被主循環（Loop）持續調用，通常每秒 60 次。"
                },
                {
                    question: "在 p5.js 中，什麼是用來改變背景顏色的函數？",
                    options: ["A. color()", "B. stroke()", "C. fill()", "D. background()"],
                    answer: "D",
                    explanation: "background() 用於設定畫布的背景顏色，fill() 用於設定圖形內部的顏色。"
                },
                {
                    question: "在 JavaScript 中，用於宣告變數的關鍵字是什麼？",
                    options: ["A. var", "B. let", "C. const", "D. 以上皆是"],
                    answer: "D",
                    explanation: "var, let, const 都是用於宣告變數的有效關鍵字。"
                },
                {
                    question: "p5.js 中，畫筆顏色設定的函數是？",
                    options: ["A. fill()", "B. stroke()", "C. color()", "D. line()"],
                    answer: "B",
                    explanation: "stroke() 設定圖形邊框（畫筆）的顏色，fill() 設定內部填充顏色。"
                },
                {
                    question: "在 JavaScript 中，if 條件判斷的正確語法結構是？",
                    options: ["A. if (condition) { ... }", "B. if condition then { ... }", "C. if condition { ... }", "D. if condition()"],
                    answer: "A",
                    explanation: "標準的 JavaScript 條件語法是 if 後面跟著括號包圍的條件。"
                },
                {
                    question: "p5.js 中哪個函數用於在畫布上繪製一個圓形？",
                    options: ["A. rect()", "B. circle()", "C. ellipse()", "D. point()"],
                    answer: "C",
                    explanation: "ellipse() 是最通用的繪製橢圓/圓形的函數，雖然 circle() 也存在，但 ellipse() 更基礎。"
                },
                {
                    question: "在 JavaScript 中，'+=' 運算子代表什麼？",
                    options: ["A. 加法並賦值", "B. 數組拼接", "C. 僅加法", "D. 錯誤的運算子"],
                    answer: "A",
                    explanation: "a += b 相當於 a = a + b。"
                },
                {
                    question: "p5.js 函數 setup() 執行於何時？",
                    options: ["A. 在 draw() 之前", "B. 在 draw() 之後", "C. draw() 循環的每一步", "D. 當滑鼠被按下時"],
                    answer: "A",
                    explanation: "setup() 只會執行一次，在程式碼開始和 draw() 循環開始前執行。"
                },
                {
                    question: "以下哪種結構在 p5.js 中用於定義一個可重複使用的功能塊？",
                    options: ["A. class", "B. object", "C. function", "D. let"],
                    answer: "C",
                    explanation: "function 用於定義可重複執行的代碼塊，class 則用於定義物件藍圖。"
                },
                {
                    question: "在 for 迴圈中，要讓它永遠執行，應該如何設定條件？",
                    options: ["A. for (let i = 0; i < 1; i++)", "B. for (let i = 0; ; i++)", "C. for (let i = 0; i < infinity; i++)", "D. for (let i = 0; i < 100; i++)"],
                    answer: "B",
                    explanation: "for (let i = 0; ; i++) 的中間條件部分留空，表示條件永遠為 true，形成無限循環。"
                }
            ];
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.quizState = 'start'; // 'start', 'question', 'feedback', 'result'
            this.feedbackText = "";
            this.feedbackY = -450;
            this.isAnswerCorrect = false;
            this.particles = [];
            this.quizSet = []; // 本次測驗的 5 道題目副本
        }

        // 核心方法 (綁定到 P5 實例)
        setup() {
            this.p.createCanvas(650, 450); 
            this.p.textAlign(this.p.CENTER, this.p.CENTER); 
            this.p.rectMode(this.p.CENTER);        
            this.p.textSize(20);
        }

        draw() {
            this.p.background(240); 

            if (this.quizState === 'start') {
                this.drawStartScreen();
            } else if (this.quizState === 'question') {
                this.drawQuestion();
            } else if (this.quizState === 'result') {
                this.drawResultScreen();
            }

            if (this.quizState === 'feedback') {
                this.drawFeedbackScreen();
            }
            
            // 粒子
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update();
                this.particles[i].display();
                if (this.particles[i].isFinished()) {
                    this.particles.splice(i, 1); 
                }
            }
        }

        // 輔助方法 (必須用 this.p. 開頭調用所有 p5 函數)
        checkClick(x, y, w, h) {
            const p = this.p;
            return p.mouseX > x - w / 2 && p.mouseX < x + w / 2 &&
                 p.mouseY > y - h / 2 && p.mouseY < y + h / 2;
        }

        drawButton(x, y, w, h, label) {
            const p = this.p;
            let isHover = this.checkClick(x, y, w, h); 
            let boxColor = p.color(200); 

            if (isHover && (this.quizState === 'question' || this.quizState === 'start')) {
                boxColor = p.color(180, 220, 255); 
                if (p.frameCount % 3 === 0) { 
                    // 使用修正後的內部類別名稱
                    this.particles.push(new this.ShineParticle(p, p.mouseX, p.mouseY)); 
                }
            } 

            p.push(); 
            p.noStroke(); 
            p.fill(boxColor); 
            p.rect(x, y, w, h, 10); 
            p.fill(0); 
            p.text(label, x, y); 
            p.pop(); 
        }

        drawTextButton(x, y, label, state) {
            const p = this.p;
            let isHover = this.checkClick(x, y, p.textWidth(label) + 20, 30); 
            
            p.push();
            if (isHover && this.quizState === state) {
                p.fill(state === 'feedback' ? 255 : 0, state === 'feedback' ? 255 : 100, 0); 
                p.text("— " + label + " —", x, y); 
                
                if (p.frameCount % 2 === 0) { 
                    // 使用修正後的內部類別名稱
                    this.particles.push(new this.ShineParticle(p, p.mouseX, p.mouseY));
                }
            } else {
                p.fill(state === 'feedback' ? 255 : 50); 
                p.text(label, x, y);
            }
            p.pop();
        }

        // 繪圖函數
        drawStartScreen() {
            const p = this.p;
            p.textSize(32);
            p.fill(50);
            p.text("p5.js 程式設計測驗", p.width / 2, p.height / 3);
            p.textSize(24);
            this.drawButton(p.width / 2, p.height / 2 + 50, 180, 60, "點擊開始"); 
        }

        drawQuestion() {
            const p = this.p;
            let q = this.quizSet[this.currentQuestionIndex];
            
            p.textSize(16);
            p.fill(100);
            p.text(`問題 ${this.currentQuestionIndex + 1} / ${this.quizSet.length}`, p.width / 2, 20); 

            p.textSize(24);
            p.fill(0);
            p.text(q.question, p.width / 2, 100); 

            p.textSize(20);
            let startY = p.height / 2 - 50; 
            for (let i = 0; i < q.options.length; i++) {
                let y = startY + i * 70; 
                this.drawButton(p.width / 2, y, 400, 50, q.options[i]);
            }
        }

        drawFeedbackScreen() {
            const p = this.p;
            let targetY = 0; 
            this.feedbackY = p.lerp(this.feedbackY, targetY, 0.1); 

            p.push();
            p.fill(0, 0, 0, 200); 
            p.rect(p.width / 2, p.height / 2 + this.feedbackY, p.width, p.height); 
            p.pop();

            p.push();
            p.translate(0, this.feedbackY); 

            let isCorrect = this.isAnswerCorrect; 

            p.textSize(48);
            p.fill(isCorrect ? p.color(0, 200, 0) : p.color(255, 50, 50)); 
            p.text(isCorrect ? "回答正確！🎉" : "回答錯誤！😔", p.width / 2, p.height / 2 - 50);

            p.textSize(20);
            p.fill(255); 
            if (!isCorrect) {
                p.text(this.feedbackText, p.width / 2, p.height / 2 + 20); 
            } else {
                p.text("點擊繼續進行下一題。", p.width / 2, p.height / 2 + 20);
            }
            
            p.textSize(24);
            let buttonY = p.height - 30; 
            
            this.drawTextButton(p.width / 2, buttonY, "點擊繼續", 'feedback');
            
            p.pop(); 
        }

        drawResultScreen() {
            const p = this.p;
            p.textSize(36);
            p.fill(0, 100, 150);
            p.text("測驗完成！成績結算", p.width / 2, p.height / 3);

            p.textSize(30);
            p.fill(50);
            p.text(`您的最終得分是：${this.score} / ${this.quizSet.length}`, p.width / 2, p.height / 2); 
            
            p.textSize(24);
            let buttonY = p.height * 0.7;
            this.drawTextButton(p.width / 2, buttonY, "點擊重新開始", 'result');

            // 新增關閉按鈕
            p.textSize(18);
            this.drawTextButton(p.width / 2, p.height * 0.85, "關閉測驗", 'resultClose');
        }


        // 邏輯函數
        initializeQuizSet() {
            let shuffledQuestions = [...this.allQuestions];
            this.p.shuffle(shuffledQuestions, true);
            this.quizSet = shuffledQuestions.slice(0, 5);
        }

        checkAnswer(selected) {
            let q = this.quizSet[this.currentQuestionIndex];

            const userAnswer = selected.trim().toUpperCase(); 
            const correctAnswer = q.answer.trim().toUpperCase(); 

            if (userAnswer === correctAnswer) {
                this.score++;
                this.feedbackText = "回答正確！"; 
                this.isAnswerCorrect = true; 
            } else {
                this.feedbackText = q.explanation;
                this.isAnswerCorrect = false; 
            }

            this.quizState = 'feedback';
            this.feedbackY = -450; 
        }

        resetQuiz() {
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.quizState = 'start'; 
            this.feedbackText = "";
            this.feedbackY = -450;
            this.isAnswerCorrect = false;
            this.quizSet = []; 
        }

        mousePressed() {
            const p = this.p;
            if (this.quizState === 'start') {
                if (this.checkClick(p.width / 2, p.height / 2 + 50, 180, 60)) {
                    this.initializeQuizSet();
                    this.quizState = 'question';
                }
            } else if (this.quizState === 'question') {
                let q = this.quizSet[this.currentQuestionIndex];
                let startY = p.height / 2 - 50; 
                for (let i = 0; i < q.options.length; i++) {
                    let optionY = startY + i * 70;
                    if (this.checkClick(p.width / 2, optionY, 400, 50)) { 
                        let selectedOptionLetter = String.fromCharCode(65 + i); 
                        this.checkAnswer(selectedOptionLetter);
                        return; 
                    }
                }
            } 
            
            else if (this.quizState === 'feedback') {
                let textButtonY = p.height - 30; 
                
                if (this.checkClick(p.width / 2, textButtonY, 200, 30)) { 
                    this.currentQuestionIndex++;
                    this.feedbackText = "";
                    if (this.currentQuestionIndex < this.quizSet.length) { 
                        this.quizState = 'question';
                    } else {
                        this.quizState = 'result'; 
                    }
                }
            }
            
            else if (this.quizState === 'result') {
                let restartButtonY = p.height * 0.7; 
                let closeButtonY = p.height * 0.85; 

                if (this.checkClick(p.width / 2, restartButtonY, 300, 30)) { 
                    this.resetQuiz(); 
                } else if (this.checkClick(p.width / 2, closeButtonY, 200, 30)) {
                    // 關閉按鈕邏輯
                    closeQuizModal(); 
                }
            }
        }
    }


    // ==========================================================
    // === 測驗彈窗控制邏輯 (DOM/JS) ===
    // ==========================================================

    function createQuizModal() {
        // 創建一個 DOM 元素作為 P5 測驗畫布的容器
        quizModalContainer = document.createElement('div');
        quizModalContainer.id = 'quiz-modal-container';
        document.body.appendChild(quizModalContainer);
        
        // 設置容器樣式 (使其成為中央彈窗)
        quizModalContainer.style.position = 'fixed';
        quizModalContainer.style.top = '50%';
        quizModalContainer.style.left = '50%';
        quizModalContainer.style.transform = 'translate(-50%, -50%)';
        quizModalContainer.style.zIndex = '2000'; // 確保在頂層
        quizModalContainer.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
        quizModalContainer.style.borderRadius = '10px';
        quizModalContainer.style.overflow = 'hidden';
        quizModalContainer.style.display = 'none'; // 預設隱藏

        // 創建一個新的 P5 實例並放入容器
        // 💥 修正：將 QuizApp 實例化邏輯從內聯函式中取出，確保作用域正確
        quizP5Instance = new p5(function(p) {
            // 將 QuizApp 的實例保存到 p.app，方便以後訪問狀態
            p.app = new QuizApp(p);
        }, 'quiz-modal-container');
    }

    function launchP5Quiz() {
        if (!quizModalContainer) {
            createQuizModal();
        }

        // 確保 P5 實例的繪圖循環正在運行
        if (quizP5Instance && !quizP5Instance.isLooping()) {
            quizP5Instance.loop();
        }
        
        // 顯示彈窗並隱藏漢堡選單 (可選)
        quizModalContainer.style.display = 'block';
        // 確保彈窗出現時，背景的 P5 畫布暫停
        noLoop(); 
        
        // 重新初始化測驗狀態，確保從開始畫面開始
        // 💥 修正：訪問 QuizApp 實例的 resetQuiz 函式
        if (quizP5Instance && quizP5Instance.app && quizP5Instance.app.resetQuiz) {
          quizP5Instance.app.resetQuiz();
        }
    }

    function closeQuizModal() {
        if (quizModalContainer) {
            quizModalContainer.style.display = 'none';
        }
        
        // 恢復背景 P5 畫布的繪圖循環
        loop(); 
        
        // 停止測驗 P5 實例的繪圖循環
        if (quizP5Instance && quizP5Instance.isLooping()) {
          // 💥 修正：確保 noLoop() 在 P5 實例上被調用
          quizP5Instance.noLoop(); 
        }
    }

} // 關閉 if (window.__sketch_js_loaded) 的外層大括號