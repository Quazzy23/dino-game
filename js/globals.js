// Состояние для слайдера изображений
let imageSliderState = {
    speciesList: [],
    currentIndex: 0,
    container: null,
    imageEl: null,
    captionEl: null,
    prevBtn: null,
    nextBtn: null
};

let blitzSkipStreak = 0;
let blitzSkipStartTime = 0;

let notificationQueue = [];
let isClassicGameEndSequence = false; // <-- ДОБАВЬТЕ ЭТУ СТРОКУ

let gameIsOver = false;
let dinoDatabase; 
let availableGenera = [], currentDino, totalScore = 0, currentRound = 0, gameHistory = [], TOTAL_ROUNDS = 10, maxPossibleScore = 0;
let isSecondAttempt = false;
let firstAttemptData = null;
let currentLang = 'ru';
let timerInterval = null;
let roundStartTime = 0;
let totalGameTime = 0;
let gameMode = 'classic';
let mainTimerInterval = null;
let blitzStartTime = 0;
let isCheckingAnswer = false; // Флаг для предотвращения двойной проверки
let sessionStartTime; // <-- ДОБАВЬ ЭТУ СТРОКУ

let blitzIncompleteChains = {};
let blitzGenusHistory = {};
let blitzFailedQueue = [];

let currentLives = 0, maxLives = 0, correctStreak = 0;
let activeFadeOutIntervals = [];
let customImageWasShown = false;

// --- НАЧАЛО ИЗМЕНЕНИЙ: ФИНАЛЬНАЯ СТРУКТУРА РЕКОРДОВ ---


// Основные экраны игры
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const endScreen = document.getElementById('end-screen');
const settingsScreen = document.getElementById('settings-screen');
// Кнопки управления
const startButton = document.getElementById('start-button');
const settingsButton = document.getElementById('settings-button');
const checkButton = document.getElementById('check-button');
const nextButton = document.getElementById('next-button');
const restartButton = document.getElementById('restart-button');
// Игровые показатели и контейнеры
const roundCounterEl = document.getElementById('round-counter');
const scoreCounterEl = document.getElementById('score-counter');
const genusNameEl = document.getElementById('genus-name');
const speciesInputContainer = document.getElementById('species-input-container');
const progressBar = document.getElementById('progress-bar');
// Панель обратной связи (результаты раунда)
const feedbackPanel = document.getElementById('feedback-panel');
const feedbackDetailsContainer = document.getElementById('feedback-details-container');
const finalVerdictEl = document.getElementById('final-verdict');
// Элементы экрана завершения
const finalScoreEl = document.getElementById('final-score');
const finalMessageEl = document.getElementById('final-message');
const resultsTableContainer = document.getElementById('results-table-container');
// Прочее
const csvUpload = document.getElementById('csv-upload');
const dbManagementButton = document.getElementById('db-management-button');
const gameInstructionEl = document.getElementById('game-instruction');
const userPreviousGuessDisplayEl = document.getElementById('user-previous-guess-display');
const gameModeHeaderEl = document.getElementById('game-mode-header');
const timerDisplayEl = document.getElementById('timer-display');
const blitzTimerDisplayEl = document.getElementById('blitz-timer-display');
const blitzDurationRecapEl = document.getElementById('blitz-duration-recap');
const backToMenuButton = document.getElementById('back-to-menu-button');
const backToMenuFromSettings = document.getElementById('back-to-menu-from-settings');
const defaultDbListEl = document.getElementById('default-db-list');
const customDbListEl = document.getElementById('custom-db-list');
const exitToMenuGameButton = document.getElementById('exit-to-menu-game-button');
const endGameEarlyButton = document.getElementById('end-game-early-button');
const roundsSelect = document.getElementById('rounds-select');
const languageSelect = document.getElementById('language-select');
const themeSwitch = document.getElementById('theme-switch');
const themeText = document.getElementById('theme-text');
const multiSpeciesModeSelect = document.getElementById('multi-species-mode');
const timerSwitch = document.getElementById('timer-switch');
const gameModeSelect = document.getElementById('game-mode-select');
const classicSettingsEl = document.getElementById('classic-settings');
const blitzSettingsEl = document.getElementById('blitz-settings');
const blitzDurationSelect = document.getElementById('blitz-duration-select');
const progressBarContainer = document.querySelector('.progress-bar-container');
const nameAllScoringSettings = document.getElementById('name-all-scoring-settings');
const imageToggleSwitch = document.getElementById('image-toggle-switch');
const survivalSettingsEl = document.getElementById('survival-settings');
const imageToggleSwitchSurvival = document.getElementById('image-toggle-switch-survival');
const livesContainerEl = document.getElementById('lives-container');

// НАЧАЛО НОВЫХ КОНСТАНТ
const easterEggScreen = document.getElementById('easter-egg-screen');
const easterEggVideo = document.getElementById('easter-egg-video');
const backFromEasterEggBtn = document.getElementById('back-from-easter-egg');

// --- НАЧАЛО ВСТАВКИ: УПРАВЛЕНИЕ ВКЛАДКАМИ РЕКОРДОВ/ДОСТИЖЕНИЙ ---
const tabBtnRecords = document.getElementById('tab-btn-records');
const tabBtnAchievements = document.getElementById('tab-btn-achievements');
const tabContentRecords = document.getElementById('tab-content-records');
const tabContentAchievements = document.getElementById('tab-content-achievements');

// --- НАЧАЛО ВСТАВКИ: УПРАВЛЕНИЕ ВКЛАДКАМИ НАСТРОЕК ---
const tabBtnSettings = document.getElementById('tab-btn-settings');
const tabBtnDatabases = document.getElementById('tab-btn-databases');
const tabContentSettings = document.getElementById('tab-content-settings');
const tabContentDatabases = document.getElementById('tab-content-databases');

const customImagesListEl = document.getElementById('custom-images-list');
// КОНЕЦ НОВЫХ КОНСТАНТ
// НОВЫЕ КОНСТАНТЫ
const aboutScreen = document.getElementById('about-screen');
const aboutButton = document.getElementById('about-button');
const backFromAboutButton = document.getElementById('back-from-about-button');
const aboutContentEl = document.getElementById('about-content');

const sfxCorrect = new Audio('./sounds/sfx/correct.mp3');
const sfxAlmost = new Audio('./sounds/sfx/almost.mp3');
const sfxIncorrect = new Audio('./sounds/sfx/incorrect.mp3');
const sfxHint = new Audio('./sounds/sfx/hint.mp3');
const sfxCorrectBlitz = new Audio('./sounds/sfx/correct_blitz.mp3');
const sfxAlmostBlitz = new Audio('./sounds/sfx/almost_blitz.mp3');
const sfxIncorrectBlitz = new Audio('./sounds/sfx/incorrect_blitz.wav');
const sfxCountdown = new Audio('./sounds/sfx/countdown.mp3');
const sfxScore = new Audio('./sounds/sfx/score_counter.mp3');
const sfxFinishGood = new Audio('./sounds/sfx/finish_good.mp3');
const sfxFinishOk = new Audio('./sounds/sfx/finish_ok.mp3');
const sfxFinishBad = new Audio('./sounds/sfx/finish_bad.mp3');
const sfxFinishPerfect = new Audio('./sounds/sfx/finish_perfect.mp3');
const sfxShake = new Audio('./sounds/sfx/shake.mp3');
const sfxLifeLost = new Audio('./sounds/sfx/life_lost.mp3');
const sfxLifeBonus = new Audio('./sounds/sfx/life_bonus.mp3');
const sfxTimerTick = new Audio('./sounds/sfx/timer_tick.mp3');
const sfxTimerEnd = new Audio('./sounds/sfx/timer_end.mp3');
const sfxNext = new Audio('./sounds/sfx/next.mp3');
const sfxAchievement = new Audio('./sounds/sfx/achievement.mp3');
const musicMenu = new Audio('./sounds/music/music_menu.mp3');
// -> Фоновая музыка для режимов
const musicClassic = new Audio('./sounds/music/music_classic.mp3');
const musicSurvival = new Audio('./sounds/music/music_survival.mp3');
// -> Отдельные треки для Блица (не зацикленные)
const musicBlitz1 = new Audio('./sounds/music/music_blitz_1min.mp3');
const musicBlitz3 = new Audio('./sounds/music/music_blitz_3min.mp3');
const musicBlitz5 = new Audio('./sounds/music/music_blitz_5min.mp3');
musicClassic.loop = true;
musicSurvival.loop = true;
musicMenu.loop = true;