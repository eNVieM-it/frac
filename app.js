// Fraction State
let vatA = { num: 1, den: 2 };
let vatB = { num: 1, den: 3 };
let isSynced = false;

// Math Utilities
const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
const lcm = (a, b) => (a * b) / gcd(a, b);

function updateVatUI(target, frac) {
    document.getElementById(`num-${target}`).innerText = frac.num;
    document.getElementById(`den-${target}`).innerText = frac.den;
}

function drawVat(target, frac, targetDen = null) {
    const box = document.getElementById(`vat-${target}`);
    box.innerHTML = '';
    
    const partsCount = targetDen ? targetDen : frac.den;
    const multiplier = targetDen ? (targetDen / frac.den) : 1;
    const filledCount = frac.num * multiplier;

    for (let i = 0; i < partsCount; i++) {
        const cell = document.createElement('div');
        cell.className = 'v-cell';
        if (i >= partsCount - filledCount) {
            cell.classList.add('filled');
        }
        box.appendChild(cell);
    }
}

function renderVats() {
    drawVat('a', vatA);
    drawVat('b', vatB);
}

function changeVat(target, part, amount) {
    if (isSynced) desyncVats();

    let v = target === 'a' ? vatA : vatB;
    
    if (part === 'num') {
        v.num += amount;
        if (v.num < 1) v.num = 1;
        if (v.num > v.den) v.num = v.den; 
    } else {
        v.den += amount;
        if (v.den < 2) v.den = 2;
        if (v.den > 12) v.den = 12; 
        if (v.num > v.den) v.num = v.den;
    }

    updateVatUI(target, v);
    renderVats();
}

function desyncVats() {
    isSynced = false;
    document.getElementById('sync-result').classList.add('hidden');
    document.getElementById('btn-sync').innerText = "СИНХРОНІЗУВАТИ ВИМІРИ";
    document.getElementById('btn-sync').classList.remove('text-red');
    renderVats();
}

document.getElementById('btn-sync').addEventListener('click', () => {
    if (isSynced) {
        desyncVats();
        return;
    }

    const commonDen = lcm(vatA.den, vatB.den);
    
    // Draw with new subdivision
    drawVat('a', vatA, commonDen);
    drawVat('b', vatB, commonDen);
    
    // Calculate new numerators
    const multA = commonDen / vatA.den;
    const multB = commonDen / vatB.den;
    const newNumA = vatA.num * multA;
    const newNumB = vatB.num * multB;

    // Fill the sync result card
    document.getElementById('lcm-value').innerText = commonDen;
    
    document.getElementById('orig-num-a').innerText = vatA.num;
    document.getElementById('orig-den-a').innerText = vatA.den;
    document.getElementById('new-num-a').innerText = newNumA;
    document.getElementById('new-den-a').innerText = commonDen;

    document.getElementById('orig-num-b').innerText = vatB.num;
    document.getElementById('orig-den-b').innerText = vatB.den;
    document.getElementById('new-num-b').innerText = newNumB;
    document.getElementById('new-den-b').innerText = commonDen;

    document.getElementById('sync-result').classList.remove('hidden');
    
    const btn = document.getElementById('btn-sync');
    btn.innerText = "РОЗІРВАТИ ЗВ'ЯЗОК";
    btn.classList.add('text-red');
    
    isSynced = true;
});

// Battle State
let score = 0;
let anomalyA = { num: 1, den: 2 };
let anomalyB = { num: 1, den: 3 };

function spawnAnomaly() {
    const den1 = Math.floor(Math.random() * 8) + 2;
    const num1 = Math.floor(Math.random() * (den1 - 1)) + 1;
    
    const den2 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * (den2 - 1)) + 1;
    
    anomalyA = { num: num1, den: den1 };
    anomalyB = { num: num2, den: den2 };
    
    document.querySelector('#game-frac-a .g-num').innerText = anomalyA.num;
    document.querySelector('#game-frac-a .g-den').innerText = anomalyA.den;
    document.querySelector('#game-frac-b .g-num').innerText = anomalyB.num;
    document.querySelector('#game-frac-b .g-den').innerText = anomalyB.den;
    
    const log = document.getElementById('battle-log');
    log.innerText = "> ВИЯВЛЕНО НОВУ АНОМАЛІЮ. ОЧІКУВАННЯ ВВОДУ...";
    log.style.color = "#888";
    
    document.getElementById('btn-next').classList.add('hidden');
    document.querySelectorAll('.sign-btn').forEach(btn => btn.disabled = false);
}

function checkAnomaly(sign) {
    const valA = anomalyA.num / anomalyA.den;
    const valB = anomalyB.num / anomalyB.den;
    
    let isCorrect = false;
    if (sign === '>' && valA > valB) isCorrect = true;
    if (sign === '<' && valA < valB) isCorrect = true;
    if (sign === '=' && valA === valB) isCorrect = true;

    const log = document.getElementById('battle-log');
    if (isCorrect) {
        log.innerText = "> УСПІХ: СТАБІЛЬНІСТЬ ВСЕСВІТУ ВІДНОВЛЕНО. +10 ОЧОК";
        log.style.color = "var(--neon-green)";
        score += 10;
    } else {
        log.innerText = "> КРИТИЧНА ПОМИЛКА: КОЛАПС ПРОСТОРУ! -5 ОЧОК";
        log.style.color = "var(--neon-red)";
        score -= 5;
        if (score < 0) score = 0;
    }
    
    document.getElementById('score').innerText = score;
    checkPortalGunUnlock();
    
    document.querySelectorAll('.sign-btn').forEach(btn => btn.disabled = true);
    document.getElementById('btn-next').classList.remove('hidden');
}

function nextAnomaly() {
    spawnAnomaly();
}

// Перевірка досягнення 100 очок для секретної портальної пушки
let isPortalGunUnlocked = false;
let isSecretPortalOpen = false;

function checkPortalGunUnlock() {
    const rewardEl = document.getElementById('portal-gun-reward');
    if (score >= 100 && !isPortalGunUnlocked) {
        isPortalGunUnlocked = true;
        rewardEl.classList.remove('hidden');
    }
}

// Стрільба портальною пушкою: відкриває/закриває портал з крабом Гошею
function toggleSecretPortal() {
    const portal = document.getElementById('gosha-portal');
    const btn = document.getElementById('btn-fire-portal');
    if (!portal || !btn) return;

    const label = btn.querySelector('.portal-gun-label');

    isSecretPortalOpen = !isSecretPortalOpen;
    if (isSecretPortalOpen) {
        portal.classList.add('portal-active');
        if (label) label.innerText = "💥 ЗАКРИТИ ПОРТАЛ";
        btn.classList.add('active');
    } else {
        portal.classList.remove('portal-active');
        if (label) label.innerText = "КЛІКНИ НА ПУШКУ!";
        btn.classList.remove('active');
    }
}

// Easter Egg: Crab Gosha Interactions (ніяких авто-вилізань на мобілках)
function initGoshaEasterEgg() {
    const portal = document.getElementById('gosha-portal');
    if (!portal) return;

    // Клік по самому крабу (коли портал відкритий) змушує його помахати
    portal.addEventListener('click', () => {
        const crab = document.getElementById('gosha-img');
        if (crab) {
            crab.style.transform = "rotate(20deg) scale(1.15)";
            setTimeout(() => {
                crab.style.transform = "";
            }, 600);
        }
    });
}

window.onload = () => {
    updateVatUI('a', vatA);
    updateVatUI('b', vatB);
    renderVats();
    spawnAnomaly();
    initGoshaEasterEgg();
};
