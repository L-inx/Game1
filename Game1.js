// --- Login ---
const loginScreen = document.getElementById('login-screen');
const game = document.getElementById('game');
const signinBtn = document.getElementById('signin-btn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginMsg = document.getElementById('login-msg');
const alreadyAccount = document.getElementById('already-account');
const logoutBtn = document.getElementById('logout-btn');
const users = [{username:'player1', password:'1234'}];

signinBtn.addEventListener('click', () => {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    if(user === '' || pass === '') { loginMsg.innerText='Enter username and password'; return; }
    const account = users.find(u => u.username === user);
    if(account){
        if(account.password === pass){
            loginScreen.style.display='none';
            game.style.display='block';
        } else { loginMsg.innerText = 'Incorrect password or username'; }
    } else {
        users.push({username:user,password:pass});
        loginScreen.style.display='none';
        game.style.display='block';
    }
});
alreadyAccount.addEventListener('click', () => { loginMsg.innerText = 'Please enter your existing account credentials.'; });
logoutBtn.addEventListener('click', () => {
    game.style.display='none';
    loginScreen.style.display='flex';
    usernameInput.value = '';
    passwordInput.value = '';
    loginMsg.innerText = '';
});

// --- Game Variables ---
let lives = 3, correctAnswers = 0, answering = false, currentAnswer = null;
const textbox = document.getElementById('textbox');
const questionText = document.getElementById('question-text');
const answerInput = document.getElementById('answer');
const submitBtn = document.getElementById('submit-btn');
const closeBtn = document.getElementById('close-btn');
const livesBox = document.getElementById('lives');
const doors = [
    document.getElementById('door-left'),
    document.getElementById('door-center'),
    document.getElementById('door-right')
];
const hand = document.getElementById('hand');
const endScreen = document.getElementById('end-screen');
const minimap = document.getElementById('minimap');
const ctx = minimap.getContext('2d');

const loseLifeSound = new Audio('https://www.soundjay.com/button/beep-07.wav');
const deathSound = new Audio('https://www.soundjay.com/misc/fail-buzzer-01.mp3');

// --- HUD ---
function updateHUD(){ livesBox.innerText = lives; drawMinimap(); }

// --- Algebra ---
function randomAlgebraProblem(){
    const a = Math.floor(Math.random()*8)+2;
    const x = Math.floor(Math.random()*10)+1;
    const b = Math.floor(Math.random()*10)+1;
    const result = a*x + b;
    return {question:`${a}x + ${b} = ${result}`, answer:x};
}

function showAlgebraScreen(){ textbox.style.display='flex'; answerInput.value=''; answerInput.focus(); }
function hideAlgebraScreen(){ textbox.style.display='none'; answering=false; }

function checkAnswer(val){
    val = val.trim().toLowerCase();
    if(!val.startsWith('x=')) { questionText.innerHTML='Format: x = <number>'; return; }
    const userAnswer = parseInt(val.split('=')[1].trim());
    if(isNaN(userAnswer)){ questionText.innerHTML='Format: x = <number>'; return; }
    if(userAnswer === currentAnswer){
        correctAnswers++;
        questionText.innerHTML = `Correct! x = ${currentAnswer}`;
        if(correctAnswers >= 10){ showWinScreen(); return; }
        lightNextRoom();
    } else {
        lives--; updateHUD();
        loseLifeSound.play();
        questionText.innerHTML = `Wrong! The correct answer was x = ${currentAnswer}`;
        if(lives <= 0) triggerDeathEffect();
    }
    answering=false;
}

submitBtn.addEventListener('click', ()=>{ checkAnswer(answerInput.value); });
closeBtn.addEventListener('click', hideAlgebraScreen);

// --- Door interaction ---
function openDoor(door){
    if(answering) return;
    answering=true;
    hand.style.display='block';
    let left = door.offsetLeft + door.offsetWidth/2 - 20;
    let top = door.offsetTop + door.offsetHeight/2 - 20;
    hand.style.left = left + 'px';
    hand.style.top = top + 'px';
    let doorProgress = 0;
    const interval = setInterval(()=>{
        doorProgress += 0.02;
        door.style.transform = `scale(1) translateY(${doorProgress*100}px)`;
        if(doorProgress >= 1){
            clearInterval(interval);
            hand.style.display='none';
            const prob = randomAlgebraProblem();
            currentAnswer = prob.answer;
            questionText.innerHTML = prob.question;
            showAlgebraScreen();
        }
    },30);
}

// --- Door hints ---
function addHints(){
    doors.forEach(d=>{
        if(Math.random()<0.2){
            d.title = `Hint: x is between 1 and 10`;
        } else { d.title = ''; }
    });
}
addHints();

doors.forEach(d => d.addEventListener('click', ()=>{ if(!answering) openDoor(d); }));
answerInput.addEventListener('keydown', e => { if(e.key==='Enter') checkAnswer(answerInput.value); });

// --- Death / Win ---
function triggerDeathEffect(){
    endScreen.style.background='red';
    endScreen.innerHTML='You Died!';
    endScreen.style.opacity='0.8';
    endScreen.style.pointerEvents='auto';
    doors.forEach(d => d.style.pointerEvents='none');
    hand.style.display='none';
    deathSound.play();
}

function showWinScreen(){
    endScreen.style.background='green';
    endScreen.innerHTML='Congratulations! You won the game!';
    endScreen.style.opacity='0.8';
    endScreen.style.pointerEvents='auto';
    doors.forEach(d => d.style.pointerEvents='none');
    hand.style.display='none';
}

// --- Mini-map ---
function drawMinimap(){
    ctx.clearRect(0,0,minimap.width,minimap.height);
    doors.forEach((door,i)=>{
        ctx.fillStyle = 'brown';
        ctx.fillRect(i*45+5,10,40,30);
        if(door.title) ctx.fillStyle='yellow';
        ctx.fillText(door.title || '', i*45+5, 50);
    });
}

updateHUD();
