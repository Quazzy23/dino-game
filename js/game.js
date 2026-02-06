async function prepareGameData() {
    // Код для получения правильного порядка обработки баз остается без изменений
    const correctProcessingOrder = [...Object.keys(DEFAULT_DATABASES), ...getDbOrder()];
    const allActiveDbs = getActiveDbNames();
    const activeDbNames = correctProcessingOrder.filter(name => allActiveDbs.includes(name));

    if (activeDbNames.length === 0) {
        showCustomAlert(translations[currentLang].alert_noActiveDb);
        return false;
    }

    const customDbs = getStoredDbs();
    const storedDifficulties = JSON.parse(localStorage.getItem(DB_DIFFICULTY_KEY)) || {};
    const mergedDb = {};
    const genusTypeInfo = {};
    
    for (const name of activeDbNames) {
        const isDefault = !!DEFAULT_DATABASES[name];
        let data;
        
        try {
            if (isDefault) {
                const response = await fetch(`./default_databases/${DEFAULT_DATABASES[name].file}`);
                data = await response.text();
            } else {
                data = customDbs[name];
            }
            if (!data) continue;

            const totalDifficultyLevels = analyzeDatabaseDifficulty(data);
            const parsedDb = parseDatabase(data, totalDifficultyLevels || 1);
            const selectedDifficulty = storedDifficulties[name] || 1;
            
            for (const genus in parsedDb) {
                const filteredSpecies = parsedDb[genus].filter(species => {
                    if (totalDifficultyLevels) {
                        return species.difficulty <= parseInt(selectedDifficulty, 10);
                    }
                    return true;
                });

                if (filteredSpecies.length > 0) {
                    if (!mergedDb[genus]) {
                        mergedDb[genus] = [];
                        genusTypeInfo[genus] = { source: 'none', name: null };
                    }
                    
                    filteredSpecies.forEach(speciesObj => {
                        // УБРАЛИ ВСЮ ЛОГИКУ С imagePath. Просто добавляем объект как есть.
                        const enrichedSpeciesObj = { ...speciesObj };

                        if (!mergedDb[genus].some(s => s.species === enrichedSpeciesObj.species)) {
                            mergedDb[genus].push(enrichedSpeciesObj);
                        }
                        if (enrichedSpeciesObj.isType) {
                            // Логика для type остается без изменений
                            const currentStatus = genusTypeInfo[genus];
                            const newTypeName = enrichedSpeciesObj.species;
                            if (currentStatus.source === 'default') {} 
                            else if (currentStatus.source === 'none') {
                                currentStatus.source = isDefault ? 'default' : 'custom';
                                currentStatus.name = newTypeName;
                            } else if (isDefault && currentStatus.source === 'custom') {
                                currentStatus.source = 'default';
                                currentStatus.name = newTypeName;
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error(`Ошибка при загрузке или обработке базы данных "${name}":`, error);
        }
    }

    // ... остальной код функции без изменений ...
    for (const genus in mergedDb) {
        const finalStatus = genusTypeInfo[genus];
        if (finalStatus && (finalStatus.source === 'default' || finalStatus.source === 'custom')) {
            const typeSpeciesName = finalStatus.name;
            mergedDb[genus].forEach(speciesObj => {
                speciesObj.isType = (speciesObj.species === typeSpeciesName);
            });
        }
    }

    dinoDatabase = mergedDb;
    availableGenera = Object.keys(dinoDatabase);

    if (availableGenera.length === 0) {
        showCustomAlert(translations[currentLang].alert_emptyDb);
        return false;
    }
    return true;
}

function playEasterEgg() {
    unlockAchievement('funny_easter_egg');
    stopAllMusic(0);
    showScreen(easterEggScreen);

    // --- НАЧАЛО ИЗМЕНЕНИЙ ---
    
    // 1. Получаем нужные элементы
    const videoElement = document.getElementById('easter-egg-video');
    const videoSourceElement = document.getElementById('easter-egg-source');
    
    // 2. Определяем язык и выбираем правильный путь к файлу
    const lang = getSettings().language;
    let videoPath = './videos/puss_in_boots_ru.mp4'; // По умолчанию русский
    if (lang === 'en') {
        videoPath = './videos/puss_in_boots_en.mp4'; // Если язык английский, меняем путь
    }

    // 3. Устанавливаем правильный источник видео
    videoSourceElement.src = videoPath;

    // 4. ОБЯЗАТЕЛЬНО: говорим видео-плееру загрузить новый источник
    videoElement.load();
    
    // --- КОНЕЦ ИЗМЕНЕНИЙ ---

    videoElement.currentTime = 0;
    // --- НАЧАЛО ДОБАВЛЕНИЯ ---
    
    // 1. Получаем текущие настройки громкости
    const settings = getSettings();
    
    // 2. Устанавливаем громкость видео равной громкости эффектов
    videoElement.volume = settings.sfxVolume;
    
    // --- КОНЕЦ ДОБАВЛЕНИЯ ---
    videoElement.play().catch(error => {
        console.error("Video playback failed:", error);
        returnToMainMenu();
    });
}

async function startGame() {
    customImageWasShown = false; 
    blitzSkipStreak = 0;
    gameIsOver = false; 

    // 1. Сначала ПРОВЕРЯЕМ данные. 
    // Если баз нет, вылетит наше кастомное окно, но музыка меню продолжит играть.
    if (!await prepareGameData()) {
        startButton.disabled = false;
        settingsButton.disabled = false;
        updateStartButtonState();
        return; 
    }

    // 2. Только если базы выбраны и всё готово, начинаем гасить музыку меню
    fadeOutMusic(musicMenu, 500);

    // 3. Дальше идет логика отсчета и старта...
    const settings = getSettings();
    gameMode = settings.gameMode;
    
    // -> ПРОВЕРЯЕМ ПАСХАЛКУ В САМОМ НАЧАЛЕ
    if (gameMode === 'survival' && settings.survivalLives === '9') {
        playEasterEgg(); // Запускаем видео
        return;          // и немедленно выходим, минуя отсчет и запуск игры
    }

    // -> Отключаем кнопки на время отсчета
    startButton.disabled = true;
    settingsButton.disabled = true;

    showScreen(null);

    const showCountdown = (number) => {
        return new Promise(resolve => {
            const fxContainer = document.getElementById('fullscreen-fx-container');
            const countdownEl = document.createElement('div');
            countdownEl.className = 'countdown-text';
            countdownEl.textContent = number;
            fxContainer.appendChild(countdownEl);
            playSound(sfxCountdown);
            
            setTimeout(() => {
                countdownEl.remove();
                resolve();
            }, 1000);
        });
    };

    await showCountdown('3');
    await showCountdown('2');
    await showCountdown('1');

    // -> Включаем кнопки обратно после отсчета
    startButton.disabled = false;
    settingsButton.disabled = false;
    updateStartButtonState();

    // -> Дальнейшая логика без изменений
    playMusicForMode(gameMode);
    
    livesContainerEl.classList.remove('animate-almost', 'animate-incorrect', 'animate-bonus');
    blitzTimerDisplayEl.classList.remove('low-time', 'danger-time');
    
    totalScore = 0; 
    currentRound = 0;
    maxPossibleScore = 0;
    totalGameTime = 0;
    clearInterval(mainTimerInterval);
    clearInterval(timerInterval);

    gameHistory = []; 
    blitzIncompleteChains = {};
    blitzGenusHistory = {};
    blitzFailedQueue = [];

    showScreen(gameContainer);
    updateGameModeDisplay();

    if (gameMode === 'classic') {
        startClassicGame();
    } else if (gameMode === 'blitz') {
        startBlitzGame();
    } else if (gameMode === 'survival') {
        startSurvivalGame();
    }
}

function startClassicGame() {
    const settings = getSettings();
    const desiredRounds = settings.rounds === 'all' ? availableGenera.length : parseInt(settings.rounds, 10);
    TOTAL_ROUNDS = Math.min(desiredRounds, availableGenera.length);
    
    if (TOTAL_ROUNDS === 0) {
        alert(translations[currentLang].alert_emptyDb);
        returnToMainMenu();
        return;
    }
    
    progressBarContainer.style.display = 'block';
    roundCounterEl.style.display = 'inline';
    blitzTimerDisplayEl.style.display = 'none';
    
    loadNewRound();
}

function startBlitzGame() {
    const settings = getSettings();
    
    if (availableGenera.length === 0) {
        alert(translations[currentLang].alert_emptyDb);
        returnToMainMenu();
        return;
    }

    progressBarContainer.style.display = 'none';
    roundCounterEl.style.display = 'none';
    blitzTimerDisplayEl.style.display = 'block';

    const gameDuration = parseInt(settings.blitzDuration, 10) * 1000;
    blitzStartTime = Date.now();
    
    const updateBlitzTimer = (remainingTime) => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const timerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        blitzTimerDisplayEl.textContent = timerText;

        // --- Логика анимаций ---
        if (remainingTime <= 10 && remainingTime > 5) {
            blitzTimerDisplayEl.classList.add('low-time');
        } else if (remainingTime <= 5) {
            blitzTimerDisplayEl.classList.remove('low-time');
            blitzTimerDisplayEl.classList.add('danger-time');
        }

        if (remainingTime <= 5) {
            playSound(sfxTimerTick);
            const fxContainer = document.getElementById('fullscreen-fx-container');
            const originalTimerRect = blitzTimerDisplayEl.getBoundingClientRect();
            const zoomEffect = document.createElement('div');
            zoomEffect.className = 'timer-zoom-effect';
            zoomEffect.textContent = timerText;
            zoomEffect.style.top = `${originalTimerRect.top}px`;
            zoomEffect.style.left = `${originalTimerRect.left}px`;
            zoomEffect.style.width = `${originalTimerRect.width}px`;
            zoomEffect.style.height = `${originalTimerRect.height}px`;
            fxContainer.appendChild(zoomEffect);
            setTimeout(() => { zoomEffect.remove(); }, 1000);
        }
    };
    
    updateBlitzTimer(gameDuration / 1000); // Первоначальный вызов, чтобы показать полное время
    let blitzEnded = false;

    mainTimerInterval = setInterval(() => {
        if (gameIsOver) {
            clearInterval(mainTimerInterval);
            mainTimerInterval = null;
            return;
        }

        const elapsedTime = Date.now() - blitzStartTime;
        const remainingMilliseconds = gameDuration - elapsedTime;
        
        // --- Логика отображения таймера ---
        const remainingSeconds = Math.max(0, Math.ceil(remainingMilliseconds / 1000));
        const previousSecondsText = blitzTimerDisplayEl.textContent.split(':')[1];
        const previousSeconds = previousSecondsText ? parseInt(previousSecondsText, 10) : -1;

        if (remainingSeconds !== previousSeconds) {
                updateBlitzTimer(remainingSeconds);
        }
        
        // --- ИСПРАВЛЕННАЯ ЛОГИКА ЗАВЕРШЕНИЯ ---
        if (remainingMilliseconds <= -1000 && !blitzEnded) {
            // Время вышло + прошла 1 секунда "окна"
            blitzEnded = true; 

            if (!gameIsOver) {
                // Передаем точное время длительности игры, а не фактическое
                endBlitzGame('timeUp', gameDuration); 
            }
            
            clearInterval(mainTimerInterval);
            mainTimerInterval = null;
        }
    }, 50);

    loadNewRound();
}

function startSurvivalGame() {
    const settings = getSettings();
    
    if (availableGenera.length === 0) {
        alert(translations[currentLang].alert_emptyDb);
        returnToMainMenu();
        return;
    }

    // Инициализация состояния для выживания
    maxLives = parseInt(settings.survivalLives, 10);
    currentLives = maxLives;
    correctStreak = 0;
    
    progressBarContainer.style.display = 'none'; // Нет прогресс-бара
    roundCounterEl.style.display = 'inline';
    blitzTimerDisplayEl.style.display = 'none';
    timerDisplayEl.style.display = 'none'; // Нет таймера в выживании

    // В режиме "Все виды" в выживании подсчет баллов всегда идет за вид
    if (settings.multiSpeciesMode === 'nameAll') {
        settings.nameAllScoring = 'perSpecies';
        saveSettings(settings); // Сохраняем, чтобы результаты корректно отобразились
    }
    
    loadNewRound();
}

function loadNewRound() {
    isCheckingAnswer = false;
    if (gameMode === 'survival' && currentLives <= 0) {
        endSurvivalGame();
        return;
    }
        if (gameIsOver) {
        return;
    }

    if (gameMode === 'classic') {
        if (currentRound >= TOTAL_ROUNDS) { endClassicGame(); return; }
        currentRound++;
    } else if (gameMode === 'survival') {
        currentRound++;
    }

    isSecondAttempt = false;
    firstAttemptData = null;

    const settings = getSettings();
    const isChainMode = gameMode === 'blitz' && settings.multiSpeciesMode === 'nameAll';

    const noMoreGenera = availableGenera.length === 0;
    const noMoreChains = Object.keys(blitzIncompleteChains).length === 0;
    const noMoreFailed = blitzFailedQueue.length === 0;

    if (noMoreGenera && noMoreFailed && (!isChainMode || noMoreChains)) {
        if (gameMode === 'survival') {
            endSurvivalGame();
        } else if (gameMode === 'blitz') {
            endBlitzGame('allAnswered');
        } else {
            endClassicGame();
        }
        return;
    }

    let randomGenus;

    if (isChainMode && availableGenera.length === 0 && !noMoreChains) {
        loadIncompleteChain();
        return;
    }

    if (availableGenera.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableGenera.length);
        randomGenus = availableGenera.splice(randomIndex, 1)[0];
    } else if (blitzFailedQueue.length > 0) {
        randomGenus = blitzFailedQueue.shift();
    } else {
        if (gameMode === 'blitz') endBlitzGame('allAnswered');
        else endClassicGame();
        return;
    }

    const allSpeciesObjects = dinoDatabase[randomGenus];
    let targetSpeciesName;
    let isTypeSpeciesRound = false;
    let hint = '';

    if (settings.multiSpeciesMode === 'guessOne') {
        const typeSpeciesObject = allSpeciesObjects.find(s => s.isType);
        const canBeTypeSpeciesRound = allSpeciesObjects.length > 1 && typeSpeciesObject;

        if (canBeTypeSpeciesRound) {
            const choicePoolSize = allSpeciesObjects.length + TYPE_SPECIES_EVENT_WEIGHT;
            const randomChoiceIndex = Math.floor(Math.random() * choicePoolSize);
            if (randomChoiceIndex < allSpeciesObjects.length) {
                targetSpeciesName = allSpeciesObjects[randomChoiceIndex].species;
            } else {
                isTypeSpeciesRound = true;
                targetSpeciesName = typeSpeciesObject.species;
            }
        } else {
            const targetSpeciesObject = allSpeciesObjects[Math.floor(Math.random() * allSpeciesObjects.length)];
            targetSpeciesName = targetSpeciesObject.species;
        }
    } else {
        if (allSpeciesObjects.length > 0) {
            targetSpeciesName = allSpeciesObjects[0].species;
        }
    }

    if (gameMode === 'blitz' && settings.multiSpeciesMode === 'guessOne' && !isTypeSpeciesRound && allSpeciesObjects.length > 1) {
        const uniquePrefix = getMinimalUniquePrefix(targetSpeciesName, allSpeciesObjects.map(s => s.species));
        hint = translations[currentLang].gameInstructionHintPrefix.replace('{prefix}', uniquePrefix);
    }

    currentDino = {
        genus: randomGenus,
        allSpecies: allSpeciesObjects,
        targetSpecies: targetSpeciesName,
        isTypeSpeciesRound: isTypeSpeciesRound,
        hint: hint,
    };

    if (isChainMode) {
        currentDino.remainingSpecies = [...allSpeciesObjects.map(s => s.species)];
        currentDino.guessedSpecies = [];
        if (!blitzGenusHistory[randomGenus]) {
            blitzGenusHistory[randomGenus] = {
                genus: randomGenus,
                attempts: [],
                allSpecies: [...currentDino.remainingSpecies],
                completed: false
            };
        }
    }

    updateUIForNewRound();

    if (gameMode === 'classic') {
        let roundMaxScore = 1;
        if (settings.multiSpeciesMode === 'nameAll' && settings.nameAllScoring === 'perSpecies') {
            roundMaxScore = currentDino.allSpecies.length;
        }
        maxPossibleScore += (roundMaxScore * 10);
    }

    if (gameMode === 'classic' && settings.timerEnabled) {
        timerDisplayEl.style.display = 'block';
        clearInterval(timerInterval);
        roundStartTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsedTime = totalGameTime + (Date.now() - roundStartTime);
            timerDisplayEl.textContent = formatTime(elapsedTime);
        }, 10);
    } else {
        timerDisplayEl.style.display = 'none';
    }
}

function loadIncompleteChain() {
    const incompleteGenera = Object.keys(blitzIncompleteChains);
    const genusToContinue = incompleteGenera[0]; 
    const allSpeciesObjects = dinoDatabase[genusToContinue];
    const guessedSpecies = blitzIncompleteChains[genusToContinue];
    const remainingSpecies = allSpeciesObjects.map(s => s.species).filter(s => !guessedSpecies.includes(s));
    
    delete blitzIncompleteChains[genusToContinue];

    currentDino = {
        genus: genusToContinue,
        allSpecies: allSpeciesObjects,
        remainingSpecies: remainingSpecies,
        guessedSpecies: guessedSpecies,
        hint: ''
    };
    
    updateUIForNewRound();
}

async function checkAnswer() {
    // Если проверка уже идет, выходим
    if (isCheckingAnswer) return;
    
    const settings = getSettings();
    const inputs = Array.from(speciesInputContainer.querySelectorAll('.species-input'));
    const userAnswerRaw = inputs[0].value.trim();
    const lowerAnswer = userAnswerRaw.toLowerCase();
    if (lowerAnswer === 'fuck you' || lowerAnswer === 'иди нахуй' || lowerAnswer === 'пошел нахуй') {
        unlockAchievement('meta_rude_player');
    }

    if (gameMode === 'blitz') {
        // --- ИЗМЕНЕНИЕ 1: Блокируем в самом начале для блица ---
        isCheckingAnswer = true;

        if (!userAnswerRaw) { // Скип
            blitzSkipStreak++;
            if (blitzSkipStreak === 1) {
                blitzSkipStartTime = Date.now();
            } else if (blitzSkipStreak >= 20) { // 20 скипов подряд за 20 секунд. Исправить если надо
                if (Date.now() - blitzSkipStartTime < 20000) {
                    unlockAchievement('funny_skipper');
                }
                blitzSkipStreak = 0;
            }

            if (settings.multiSpeciesMode === 'nameAll') {
                playSound(sfxIncorrectBlitz);
                inputs[0].classList.add('flash-incorrect');
                setTimeout(() => breakBlitzChain('pass'), 500);
            } else {
                playSound(sfxIncorrectBlitz);
                blitzFailedQueue.push(currentDino.genus);
                inputs[0].classList.add('flash-incorrect');
                setTimeout(loadNewRound, 400);
            }
            return;
        }

        blitzSkipStreak = 0;
    }

    // --- ИЗМЕНЕНИЕ 2: Для не-блица блокируем здесь ---
    isCheckingAnswer = true;
    
    if (gameMode !== 'blitz') {
        const userAnswersRawForCheck = inputs.map(input => input.value.trim());
        if (userAnswersRawForCheck.some(answer => !answer)) {
            isCheckingAnswer = false; 
            playSound(sfxShake);
            inputs.forEach(input => { if (!input.value.trim()) input.classList.add('shake-input'); });
            return;
        }
        inputs.forEach(el => el.disabled = true);
        if (settings.multiSpeciesMode === 'nameAll') {
            await checkAllSpecies(inputs);
        } else {
            const singleCheckMode = settings.multiSpeciesMode === 'acceptAny' ? 'acceptAny' : 'guessOne';
            await checkSingleSpecies(inputs[0], singleCheckMode);
        }
        return;
    }

    // --- Логика для Блиц-режимов (только для НЕ-пустых ответов) ---
    // (Этот блок остается без изменений, так как isCheckingAnswer уже true)
    const inputElement = inputs[0];
    const multiSpeciesMode = settings.multiSpeciesMode;

    if (multiSpeciesMode === 'nameAll') {
        const result = evaluateSingleAnswer(userAnswerRaw, currentDino.remainingSpecies);
        blitzGenusHistory[currentDino.genus].attempts.push(result);
        if (result.isAccepted) {
            playSound(result.status === 'correct' ? sfxCorrectBlitz : sfxAlmostBlitz);
            continueBlitzChain(result, inputElement);
        } else {
            checkConfusedAchievement(userAnswerRaw, currentDino.genus);
            playSound(sfxIncorrectBlitz);
            inputElement.classList.add('flash-incorrect');
            setTimeout(() => breakBlitzChain('incorrect'), 500);
        }
    } else { // Режимы "Любой вид" и "Конкретный вид"
        let answerPool = (multiSpeciesMode === 'acceptAny')
            ? currentDino.allSpecies.map(s => s.species)
            : [currentDino.targetSpecies];

        const result = evaluateSingleAnswer(userAnswerRaw, answerPool);

        if (result.isAccepted) {
            playSound(result.status === 'correct' ? sfxCorrectBlitz : sfxAlmostBlitz);
            showScorePopup(result.score, result.status);
            totalScore += result.score;
            animateScore(totalScore);
            gameHistory.push({
                genus: currentDino.genus,
                finalStatus: result.status,
                scoreAwarded: result.score,
                answers: [result]
            });
            const flashClass = `flash-${result.status}`;
            inputElement.classList.add(flashClass);
            setTimeout(loadNewRound, 400);
        } else {
            checkConfusedAchievement(userAnswerRaw, currentDino.genus);
            playSound(sfxIncorrectBlitz);
            blitzFailedQueue.push(currentDino.genus);
            inputElement.classList.add('flash-incorrect');
            setTimeout(loadNewRound, 400);
        }
    }
}

function continueBlitzChain(result, inputElement) {
    showScorePopup(result.score, result.status);
    totalScore += result.score; // -> Простое сложение
    const lastAttempt = blitzGenusHistory[currentDino.genus].attempts.length - 1;
    if(lastAttempt >= 0) {
        blitzGenusHistory[currentDino.genus].attempts[lastAttempt].score = result.score;
    }
    animateScore(totalScore);
    // ... остальная часть функции без изменений
    currentDino.guessedSpecies.push(result.matched);
    currentDino.remainingSpecies = currentDino.remainingSpecies.filter(s => s.toLowerCase() !== result.matched.toLowerCase());

    const flashClass = `flash-${result.status}`;
    inputElement.classList.add(flashClass);
    
    setTimeout(() => {
        if (currentDino.remainingSpecies.length === 0) {
            completeBlitzChain();
        } else {
            inputElement.value = '';
            inputElement.classList.remove('flash-correct', 'flash-almost');
            userPreviousGuessDisplayEl.innerHTML = `<span style="font-size: 0.9em;">${translations[currentLang].blitzAlreadyNamed} <strong>${currentDino.guessedSpecies.join(', ')}</strong></span>`;
            gameInstructionEl.innerHTML = translations[currentLang].gameInstructionNextSpecies;
            inputElement.focus();
        }
    }, 400);
}

function breakBlitzChain(reason) {
    if (reason === 'pass') {
        blitzGenusHistory[currentDino.genus].attempts.push({ text: '', status: 'incorrect', score: 0 });
    }
    
    if (currentDino.remainingSpecies && currentDino.remainingSpecies.length > 0) {
        blitzIncompleteChains[currentDino.genus] = currentDino.guessedSpecies;
    } else if (blitzGenusHistory[currentDino.genus]) {
        blitzGenusHistory[currentDino.genus].completed = true;
    }
    
    loadNewRound();
}

function completeBlitzChain() {
    if (blitzGenusHistory[currentDino.genus]) {
        blitzGenusHistory[currentDino.genus].completed = true;
    }
    delete blitzIncompleteChains[currentDino.genus];
    loadNewRound();
}

function evaluateSingleAnswer(userAnswerRaw, answerPool) {
    if (!userAnswerRaw) { 
        return { text: '', status: 'incorrect', score: 0, isAccepted: false, levAccuracy: 0, jaroSimilarity: 0, matched: null };
    }
    const userAnswer = userAnswerRaw.toLowerCase();
    let bestMatch = { species: null, similarity: -1 };

    if (answerPool.length === 0) {
        return { text: userAnswerRaw, status: 'incorrect', score: 0, isAccepted: false, levAccuracy: 0, jaroSimilarity: 0, matched: null };
    }

    answerPool.forEach(correctSpecies => {
        const currentSimilarity = jaroWinklerSimilarity(userAnswer, correctSpecies.toLowerCase());
        if (currentSimilarity > bestMatch.similarity) {
            bestMatch.similarity = currentSimilarity;
            bestMatch.species = correctSpecies;
        }
    });

    const distance = levenshteinDistance(userAnswer, bestMatch.species.toLowerCase());
    const isLevenshteinOk = distance <= getSmartThreshold(bestMatch.species.length);
    const isJaroOk = bestMatch.similarity >= 0.85;
    const isAccepted = isLevenshteinOk && isJaroOk;
    const isPerfectMatch = (userAnswer === bestMatch.species.toLowerCase());

    const lenForPerc = Math.max(userAnswer.length, bestMatch.species.length);
    const levenshteinAccuracy = lenForPerc > 0 ? (1 - distance / lenForPerc) : 0;
    
    const status = isAccepted ? (isPerfectMatch ? 'correct' : 'almost') : 'incorrect';
    let score = 0;
    if (isAccepted) {
        if (isPerfectMatch) {
            // -> Идеальный ответ - 10 баллов (вместо 1.0)
            score = 10;
        } else {
            const rawScore = levenshteinAccuracy * bestMatch.similarity;
            // -> Умножаем на 10 и округляем до целого
            score = Math.round(rawScore * 10);
        }
    }
    
    return {
        text: userAnswerRaw,
        status: status,
        score: score, // -> Теперь здесь целое число (0-10)
        isAccepted: isAccepted,
        levAccuracy: levenshteinAccuracy,
        jaroSimilarity: bestMatch.similarity,
        matched: bestMatch.species
    };
}

function displaySingleFeedback(result) {
    const statusClass = result.status === 'correct' ? 'correct-text' : (result.isAccepted ? 'almost-text' : 'incorrect-text');

    // Добавляем ту же обертку с рамкой, что и в режиме "Все виды"
    feedbackDetailsContainer.innerHTML = `
    <div style="border: 1px solid var(--color-border); border-radius: 8px; padding: 10px;">
        <div class="feedback-details">
            <div class="metric">
                <span>${translations[currentLang].feedback_levenshtein}</span>
                <span class="metric-value ${statusClass}">${(result.levAccuracy * 100).toFixed(0)}%</span>
            </div>
            <div class="metric">
                <span>${translations[currentLang].feedback_jaro}</span>
                <span class="metric-value ${statusClass}">${(result.jaroSimilarity * 100).toFixed(0)}%</span>
            </div>
        </div>
    </div>`;
}

async function checkSingleSpecies(inputElement, mode) {
    const { genus, allSpecies, targetSpecies, isTypeSpeciesRound } = currentDino;
    const userAnswerRaw = inputElement.value.trim();

    if (mode === 'acceptAny') {
        const result = evaluateSingleAnswer(userAnswerRaw, allSpecies.map(s => s.species));
        const flashClass = result.isAccepted ? `flash-${result.status}` : 'flash-incorrect';
        // -> Воспроизводим звук в зависимости от результата
        if (gameMode !== 'blitz') {
            if(result.isAccepted) {
                playSound(result.status === 'correct' ? sfxCorrect : sfxAlmost);
            } else {
                playSound(sfxIncorrect);
            }
        }
        inputElement.classList.remove('flash-correct', 'flash-almost', 'flash-incorrect');
        void inputElement.offsetWidth;
        inputElement.classList.add(flashClass);
        displaySingleFeedback(result); // Здесь показ метрик корректен, т.к. раунд завершается
        let message;
        if (result.isAccepted) {
            message = result.status === 'correct'
                ? `<strong>${translations[currentLang].verdict_correct}</strong> ${translations[currentLang].its} ${genus} <strong>${result.matched}</strong>`
                : `<strong>${translations[currentLang].verdict_almost}</strong> ${translations[currentLang].correctAnswerSingle}: ${genus} <strong>${result.matched}</strong>`;
        } else {
            checkConfusedAchievement(userAnswerRaw, genus); // <--- ВЫЗОВ ЗДЕСЬ
            const answerText = allSpecies.length === 1 ? translations[currentLang].correctAnswerSingle : translations[currentLang].correctAnswersPlural;
            message = `<strong>${translations[currentLang].verdict_incorrect}</strong> ${answerText}: ${genus} <strong>${allSpecies.map(s => s.species).join(', ')}</strong>`;
        }
        await finalizeRound(result.score, result.status, message, [result]);

        // --- НАЧАЛО ВСТАВКИ: ПРОВЕРКА АЧИВКИ "ИНТУИЦИЯ" ---
        // Условия:
        // 1. Ответ верный (flashResult.isAccepted)
        // 2. Это была первая попытка (!isSecondAttempt)
        // 3. В роду 5 или более видов
        // 4. Не было прямой подсказки назвать типовой вид (!isTypeSpeciesRound)
        if (flashResult.isAccepted && !isSecondAttempt && allSpecies.length >= 5 && !isTypeSpeciesRound) {
            unlockAchievement('guess_one_intuition');
        }
        // --- КОНЕЦ ВСТАВКИ ---

    } else { // guessOne mode
        // Сначала оцениваем ответ относительно ЗАГАДАННОГО вида
        const flashResult = evaluateSingleAnswer(userAnswerRaw, [targetSpecies]);

        // === НАЧАЛО ИЗМЕНЕНИЙ (ВОЗВРАЩЕНИЕ ЛОГИКИ) ===

        // 1. Проверяем, является ли ответ правильным, но НЕ ТЕМ видом, что был загадан.
        const validityCheckResult = evaluateSingleAnswer(userAnswerRaw, allSpecies.map(s => s.species));
        const isCorrectButWrongSpecies = validityCheckResult.isAccepted && !flashResult.isAccepted;

        // 2. Если это сценарий "второй попытки"
        if ((gameMode === 'classic' || gameMode === 'survival') && isCorrectButWrongSpecies && !isSecondAttempt && !isTypeSpeciesRound) {
            isSecondAttempt = true;
            firstAttemptData = { text: userAnswerRaw, status: validityCheckResult.status };
            // -> Воспроизводим звук для правильного, но не того вида
            playSound(sfxHint);

            // НЕ показываем метрики, только подсвечиваем поле ввода
            const firstAttemptFlashClass = `flash-${validityCheckResult.status}`;
            inputElement.classList.remove('flash-correct', 'flash-almost', 'flash-incorrect');
            void inputElement.offsetWidth;
            inputElement.classList.add(firstAttemptFlashClass);

            // Показываем подсказку
            let finalInstruction;
            if (allSpecies.length === 2) {
                // -> Формируем составное сообщение: "Загадан другой." + "Попробуйте назвать второй."
                finalInstruction = `${translations[currentLang].secondAttempt_correctButWrong} ${translations[currentLang].secondAttempt_trySecond}`;
            } else {
                // -> Иначе, формируем подсказку с буквами
                const uniquePrefix = getMinimalUniquePrefix(targetSpecies, allSpecies.map(s => s.species));
                const hintTemplate = translations[currentLang].secondAttempt_hint_letters;
                const hintText = hintTemplate.replace('{chars}', `<strong>${uniquePrefix}</strong>`);
                finalInstruction = translations[currentLang].secondAttempt_hint.replace('{hint}', hintText);
            }

            gameInstructionEl.innerHTML = finalInstruction;

            userPreviousGuessDisplayEl.innerHTML = validityCheckResult.status === 'correct'
                ? translations[currentLang].secondAttempt_yourGuess.replace('{guess}', userAnswerRaw)
                : translations[currentLang].secondAttempt_yourGuessAcceptedAs.replace('{guess}', userAnswerRaw).replace('{match}', validityCheckResult.matched);

            // Сбрасываем поле и возвращаем фокус для второй попытки
            inputElement.value = '';
            inputElement.disabled = false;
            checkButton.disabled = false;
            inputElement.focus();
            isCheckingAnswer = false;

            return; // Завершаем выполнение функции, ждем второй попытки
        }

        // 3. Если это НЕ сценарий второй попытки (т.е. ответ либо верный, либо неверный)
        // Показываем подсветку поля и метрики, как и раньше
        // -> Воспроизводим финальный звук для загаданного вида
        if (gameMode !== 'blitz') {
            if(flashResult.isAccepted) {
                playSound(flashResult.status === 'correct' ? sfxCorrect : sfxAlmost);
            } else {
                playSound(sfxIncorrect);
            }
        }
        const finalFlashClass = flashResult.isAccepted ? `flash-${flashResult.status}` : 'flash-incorrect';
        inputElement.classList.remove('flash-correct', 'flash-almost', 'flash-incorrect');
        void inputElement.offsetWidth;
        inputElement.classList.add(finalFlashClass);

        displaySingleFeedback(flashResult); // Показываем метрики для финального ответа

        if (flashResult.isAccepted) {
            const message = flashResult.status === 'correct'
                ? `<strong>${translations[currentLang].verdict_correct}</strong> ${translations[currentLang].its} ${genus} <strong>${targetSpecies}</strong>`
                : `<strong>${translations[currentLang].verdict_almost}</strong> ${translations[currentLang].correctAnswerSingle}: ${genus} <strong>${targetSpecies}</strong>`;
            await finalizeRound(flashResult.score, flashResult.status, message, [flashResult]);
        } else {
            // Проверяем ачивку ТОЛЬКО если это была первая и единственная попытка
            if (!isSecondAttempt) {
                checkConfusedAchievement(userAnswerRaw, genus); // <--- ВЫЗОВ ЗДЕСЬ
            }
            const message = `<strong>${translations[currentLang].verdict_incorrect}</strong> ${translations[currentLang].correctAnswerSingle}: ${genus} <strong>${targetSpecies}</strong>`;
            await finalizeRound(0, 'incorrect', message, [flashResult]);
        }
        // === КОНЕЦ ИЗМЕНЕНИЙ ===
    }
}

async function checkAllSpecies(inputs) {
    const settings = getSettings();
    const { genus, allSpecies } = currentDino;
    const allSpeciesNames = allSpecies.map(s => s.species);
    let correctSpeciesPool = [...allSpeciesNames];
    const finalResults = [];

    inputs.forEach((input) => {
        const userAnswerRaw = input.value.trim();
        const result = evaluateSingleAnswer(userAnswerRaw, correctSpeciesPool);
        finalResults.push(result);
        if (result.isAccepted) {
            const poolIndex = correctSpeciesPool.findIndex(cs => cs.toLowerCase() === result.matched.toLowerCase());
            if (poolIndex > -1) { correctSpeciesPool.splice(poolIndex, 1); }
        }
    });
    
    // ... (блок с отрисовкой метрик остается без изменений) ...
    if (finalResults.length === 1) {
        const result = finalResults[0];
        const flashClass = `flash-${result.status}`;
        inputs[0].classList.remove('flash-correct', 'flash-almost', 'flash-incorrect');
        void inputs[0].offsetWidth;
        inputs[0].classList.add(flashClass);
        displaySingleFeedback(result);
    } else {
        let allMetricsHtml = '';
        finalResults.forEach((r, index) => {
            const flashClass = `flash-${r.status}`;
            inputs[index].classList.remove('flash-correct', 'flash-almost', 'flash-incorrect');
            void inputs[index].offsetWidth;
            inputs[index].classList.add(flashClass);
            const statusClass = r.status === 'correct' ? 'correct-text' : (r.isAccepted ? 'almost-text' : 'incorrect-text');
            const answerText = r.text || `<i>${translations[currentLang].feedback_empty}</i>`;
            const pStyle = 'text-align: center; margin-top: 0; margin-bottom: 5px; font-size: 0.9em;';
            const acceptedAsText = `<p style="${pStyle}">${translations[currentLang].feedback_yourAnswer.replace('{answer}', answerText)}</p>`;
            allMetricsHtml += `
        <div>
            ${acceptedAsText}
            <div class="feedback-details">
                <div class="metric">
                    <span>${translations[currentLang].feedback_levenshtein}</span>
                    <span class="metric-value ${statusClass}">${(r.levAccuracy * 100).toFixed(0)}%</span>
                </div>
                <div class="metric">
                    <span>${translations[currentLang].feedback_jaro}</span>
                    <span class="metric-value ${statusClass}">${(r.jaroSimilarity * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>
        ${index < finalResults.length - 1 ? '<hr style="border: 0; border-top: 1px solid var(--color-border); margin: 10px 0;">' : ''}
    `;
        });
        feedbackDetailsContainer.innerHTML = `
    <div style="border: 1px solid var(--color-border); border-radius: 8px; padding: 10px;">
        ${allMetricsHtml}
    </div>
`;
    }
    
    const hasIncorrect = finalResults.some(r => r.status === 'incorrect');
    const hasAlmost = finalResults.some(r => r.status === 'almost');
    const allCorrectlyNamed = !hasIncorrect && correctSpeciesPool.length === 0;

    let finalScore;
    if (settings.nameAllScoring === 'perSpecies') {
        finalScore = finalResults.reduce((sum, r) => sum + (r.isAccepted ? r.score : 0), 0);
    } else { // Режим "за раунд"
        if (!allCorrectlyNamed) {
            finalScore = 0;
        } else {
            const totalPossible = allSpeciesNames.length * 10;
            const userTotal = finalResults.reduce((sum, r) => sum + r.score, 0);

            if (hasAlmost) {
                // -> Считаем по формуле, но ограничиваем результат сверху девяткой
                const calculatedScore = Math.round(10 * userTotal / totalPossible);
                finalScore = Math.min(9, calculatedScore);
            } else {
                // -> Если опечаток нет, то это точно 10
                finalScore = 10;
            }
        }
    }

    let finalStatus, message;

    if (allCorrectlyNamed) {
        finalStatus = hasAlmost ? 'almost' : 'correct';
    } else {
        const atLeastOneCorrect = finalResults.some(r => r.isAccepted);
        if (atLeastOneCorrect && settings.nameAllScoring === 'perSpecies') {
            finalStatus = 'partially';
        } else {
            finalStatus = 'incorrect';
        }
    }
    
    if (gameMode !== 'blitz') {
        switch(finalStatus) {
            case 'correct': playSound(sfxCorrect); break;
            case 'almost': case 'partially': playSound(sfxAlmost); break;
            case 'incorrect': playSound(sfxIncorrect); break;
        }
    }

    const coloredSpeciesList = allSpeciesNames.map(cs => {
        const res = finalResults.find(r => r.isAccepted && r.matched.toLowerCase() === cs.toLowerCase());
        return res ? `<strong class="text-${res.status}">${cs}</strong>` : `<strong class="text-incorrect">${cs}</strong>`;
    }).join(', ');

    const answerText = allSpeciesNames.length === 1 ? translations[currentLang].correctAnswerSingle : translations[currentLang].correctAnswersPlural;

    if (finalStatus === 'correct') {
        message = `<strong>${translations[currentLang].verdict_correct}</strong> ${translations[currentLang].its} ${genus} ${coloredSpeciesList}`;
    } else if (finalStatus === 'almost') {
        message = `<strong>${translations[currentLang].verdict_almost}</strong> ${answerText}: ${genus} ${coloredSpeciesList}`;
    } else {
        message = `<strong>${translations[currentLang].verdict_incorrect}</strong> ${answerText}: ${genus} ${coloredSpeciesList}`;
    }

    await finalizeRound(finalScore, finalStatus, message, finalResults);
}

async function finalizeRound(scoreToAdd, resultStatus, verdictMessage, answers) {
    if (gameIsOver) return;
    let roundTime = 0;
    const settings = getSettings();
    if (settings.timerEnabled && gameMode === 'classic') {
        clearInterval(timerInterval);
        const preciseRoundTime = Date.now() - roundStartTime;
        roundTime = Math.round(preciseRoundTime / 10) * 10;
        totalGameTime += roundTime;
    }

    let livesChangeInRound = 0; 

    if (gameMode === 'survival') {
        // ... (логика жизней без изменений)
        let livesLostThisRound = 0;
        let roundIsPerfect = true;
        let hasIncorrect = false;
        let hasAlmost = false;

        answers.forEach(answer => {
            if (answer.status === 'incorrect') {
                livesLostThisRound += 1;
                roundIsPerfect = false;
                hasIncorrect = true;
            } else if (answer.status === 'almost') {
                livesLostThisRound += (maxLives === 1 ? 1.0 : 0.5);
                roundIsPerfect = false;
                hasAlmost = true;
            }
        });

        if (livesLostThisRound > 0) {
            playSound(sfxLifeLost);
        }
        currentLives -= livesLostThisRound;
        livesChangeInRound -= livesLostThisRound;

        if (hasIncorrect) {
            livesContainerEl.classList.add('animate-incorrect');
        } else if (hasAlmost) {
            livesContainerEl.classList.add('animate-almost');
        }

        if (roundIsPerfect) {
            const perfectAnswersInRound = answers.length;
            correctStreak += perfectAnswersInRound;
            if (settings.survivalBonus && correctStreak >= 20) { //бонус 20 жизней. Поменять на 2 для тестирования
                if (currentLives < maxLives) {
                    currentLives = Math.min(maxLives, currentLives + 1);
                    livesChangeInRound += 1;
                    livesContainerEl.classList.add('animate-bonus');
                    playSound(sfxLifeBonus);
                }
                correctStreak = 0;
            }
        } else {
            correctStreak = 0;
        }
        updateLivesDisplay();
    }

    if (gameMode === 'survival' && maxLives === 1 && resultStatus === 'almost') {
        const oldVerdict = translations[currentLang].verdict_almost;
        const newVerdict = translations[currentLang].verdict_fatal_almost;
        verdictMessage = verdictMessage.replace(oldVerdict, newVerdict);
        resultStatus = 'incorrect';
    }

    const historyEntry = {
        genus: currentDino.genus,
        finalStatus: resultStatus,
        scoreAwarded: scoreToAdd,
        answers: answers,
        time: roundTime
    };
    
    if (gameMode === 'survival') {
        historyEntry.livesChange = livesChangeInRound;
    }

    if (isSecondAttempt && firstAttemptData) {
        historyEntry.firstAttemptData = firstAttemptData;
    }
    
    totalScore += scoreToAdd; // -> Простое сложение
    gameHistory.push(historyEntry);
    showScorePopup(scoreToAdd, resultStatus);
    animateScore(totalScore);
    
    checkButton.style.display = 'none';

    let isFinalRound = false;
    if (gameMode === 'classic' && currentRound === TOTAL_ROUNDS) {
        isFinalRound = true;
    } else if (gameMode === 'survival') {
        // В режиме выживания игра заканчивается, если:
        // 1. Закончились жизни.
        // 2. Закончились все доступные вопросы в базе.
        if (currentLives <= 0 || availableGenera.length === 0) {
            isFinalRound = true;
            stopAllMusic(3000);
        }
    }

    if (isFinalRound) {
        nextButton.innerHTML = translations[currentLang].finishGameButton;
    }
    
    nextButton.style.display = 'inline-block';
    finalVerdictEl.innerHTML = verdictMessage;
    // -> Устанавливаем цвет вердикта, обрабатывая 'partially' как 'incorrect'
    let verdictColorStatus = resultStatus;
    if (resultStatus === 'partially') {
        verdictColorStatus = 'incorrect';
    }
    finalVerdictEl.style.color = `var(--color-${verdictColorStatus})`;
    feedbackPanel.classList.add('visible');
    
    await setupImageFeedback(resultStatus, answers);
}

async function endClassicGame() {
    gameIsOver = true;
    isClassicGameEndSequence = true; // <-- 1. ДОБАВИТЬ: ВКЛЮЧАЕМ ФЛАГ
    unlockAchievement('game_first_play');
    stopAllMusic();
    progressBar.style.width = '100%';
    clearInterval(timerInterval);

    // --- НАЧАЛО БЛОКА ОБРАБОТКИ РЕЗУЛЬТАТОВ ---
    const settings = getSettings();
    const exitedEarly = gameHistory.length < TOTAL_ROUNDS;
    // Берем только те базы, которые реально существуют сейчас
    const allStoredCustom = getStoredDbs();
    const activeDbNames = getActiveDbNames().filter(name => DEFAULT_DATABASES[name] || allStoredCustom[name]);
    const isOfficialGame = activeDbNames.length === 1 && DEFAULT_DATABASES[activeDbNames[0]];
    let isNewRecord = false;
    let unlockedAchievementsBatch = []; // <-- 1. Создаем пакет

    if (isOfficialGame) {
        const dbName = activeDbNames[0];
        const storedDifficulties = JSON.parse(localStorage.getItem(DB_DIFFICULTY_KEY)) || {};
        const difficultyLevel = storedDifficulties[dbName] || 1;
        const isPerSpeciesMode = settings.multiSpeciesMode === 'nameAll' && settings.nameAllScoring === 'perSpecies';
        const currentDenominator = isPerSpeciesMode ? maxPossibleScore : (TOTAL_ROUNDS * 10);
        const scorePercent = currentDenominator > 0 ? (totalScore / currentDenominator) * 100 : 0;

        // Получаем старый рекорд ПЕРЕД обновлением
        const oldBestPercent = gameProgress.records.official.classic?.[dbName]?.[difficultyLevel]?.bestPercent || 0;
        if (scorePercent > oldBestPercent) {
            isNewRecord = true;
        }
        // <- КОНЕЦ ИЗМЕНЕНИЙ

        // --- ШАГ 1 ... ---
        gameProgress.records.official.classic = gameProgress.records.official.classic || {};
        gameProgress.records.official.classic[dbName] = gameProgress.records.official.classic[dbName] || {};
        
        // Инициализируем или получаем запись для нужной сложности
        const currentRecord = gameProgress.records.official.classic[dbName][difficultyLevel] || {
            bestPercent: 0,
            marathonAllSpecies100: false,
            gamesPlayed: 0,
            totalPercentSum: 0,
            averagePercent: 0, // <-- НОВОЕ: Добавляем поле для среднего
            correctAnswers: 0, // <-- НОВОЕ
            almostAnswers: 0,  // <-- НОВОЕ
            incorrectAnswers: 0// <-- НОВОЕ
        };

        // Обновляем рекорды
        if (scorePercent > currentRecord.bestPercent) {
            currentRecord.bestPercent = scorePercent;
        }
        if (settings.rounds === 'all' && settings.multiSpeciesMode === 'nameAll' && scorePercent === 100) {
            currentRecord.marathonAllSpecies100 = true;
        }
        
        // Обновляем статистику
        currentRecord.gamesPlayed += 1;
        currentRecord.totalPercentSum += scorePercent;
        // <-- НОВОЕ: Каждый раз пересчитываем среднее по правильной формуле
        currentRecord.averagePercent = currentRecord.totalPercentSum / currentRecord.gamesPlayed;

        // --- НАЧАЛО ДОБАВЛЕНИЯ СЧЕТЧИКА ОТВЕТОВ ---
        gameHistory.forEach(round => {
            // В раунде может быть несколько ответов (режим "Все виды")
            round.answers.forEach(answer => {
                if (answer.status === 'correct') {
                    currentRecord.correctAnswers += 1;
                } else if (answer.status === 'almost') {
                    currentRecord.almostAnswers += 1;
                } else if (answer.status === 'incorrect') {
                    currentRecord.incorrectAnswers += 1;
                }
            });
        });
        // --- КОНЕЦ ДОБАВЛЕНИЯ ---

        gameProgress.records.official.classic[dbName][difficultyLevel] = currentRecord;
        // --- КОНЕЦ ИСПРАВЛЕННОЙ ЛОГИКИ ---

        // --- ШАГ 2: ПОТОМ ПРОВЕРЯЕМ АЧИВКИ, ИСПОЛЬЗУЯ УЖЕ ОБНОВЛЕННЫЕ ДАННЫЕ ---
        const gameResults = {
            mode: 'classic',
            dbName: dbName,
            difficulty: difficultyLevel,
            scorePercent: scorePercent,
            isMarathon: settings.rounds === 'all',
            multiSpeciesMode: settings.multiSpeciesMode,
            totalRounds: TOTAL_ROUNDS
        };
        await checkAchievements(gameResults, unlockedAchievementsBatch); // <-- 2. Передаем пакет
    }
    // --- КОНЕЦ БЛОКА ОБРАБОТКИ РЕЗУЛЬТАТОВ ---
    // --- НАЧАЛО ДОБАВЛЕНИЯ ---
    else {
        // Инициализируем объекты, если их еще нет
        gameProgress.records.custom = gameProgress.records.custom || {};
        gameProgress.records.custom.classic = gameProgress.records.custom.classic || { gamesPlayed: 0 };
        
        // Увеличиваем счетчик
        gameProgress.records.custom.classic.gamesPlayed += 1;
    }
    // --- КОНЕЦ ДОБАВЛЕНИЯ ---
    // --- НАЧАЛО ВСТАВКИ: ПРОВЕРКА АЧИВКИ "Я ТАК ВИЖУ" ---
    const allDbsAreCustom = activeDbNames.every(name => !DEFAULT_DATABASES[name]);
    if (allDbsAreCustom) {
        const isPerSpeciesMode = settings.multiSpeciesMode === 'nameAll' && settings.nameAllScoring === 'perSpecies';
        const currentDenominator = isPerSpeciesMode ? maxPossibleScore : (TOTAL_ROUNDS * 10);
        const scorePercent = currentDenominator > 0 ? (totalScore / currentDenominator) * 100 : 0;

        if (scorePercent === 100) {
            unlockedAchievementsBatch.push('meta_my_own_canon');
        }
    }
    // --- КОНЕЦ ВСТАВКИ ---

    // Проверка ачивки "Первооткрыватель"
    // Проверяем наличие пользовательских баз, исключая пустые или устаревшие ID
    const customDbs = getStoredDbs();
    const hasCustomDb = activeDbNames.some(name => !DEFAULT_DATABASES[name] && customDbs[name]);
    if (hasCustomDb) unlockedAchievementsBatch.push('meta_pioneer');
    // Проверка ачивки "Фотоохотник"
    const showImagesSettings = settings.showImages;
    if (hasCustomDb && customImageWasShown && showImagesSettings) {
        unlockedAchievementsBatch.push('meta_photohunter');
    }
    // <-- 3. Добавляем сортировку и вызов уведомлений -->
    unlockedAchievementsBatch.sort((a, b) => ACHIEVEMENT_DISPLAY_ORDER.indexOf(a) - ACHIEVEMENT_DISPLAY_ORDER.indexOf(b));
    unlockedAchievementsBatch.forEach(id => unlockAchievement(id));
    
    setTimeout(() => {
        showScreen(endScreen);

        // -> НАЧАЛО ИЗМЕНЕНИЙ
        const titleEl = endScreen.querySelector('h2');
        if (isNewRecord) {
            titleEl.textContent = translations[currentLang].newRecordTitle;
            // Можно добавить звук для рекорда
            // playSound(sfxNewRecord); 
        } else {
            titleEl.textContent = translations[currentLang].gameOverTitle;
        }
        // <- КОНЕЦ ИЗМЕНЕНИЙ
        
        let finalScoreText;
        let messageKey;
        
        const isPerSpeciesMode = settings.multiSpeciesMode === 'nameAll' && settings.nameAllScoring === 'perSpecies';

        // Логика финального сообщения не изменилась
        if (isPerSpeciesMode && exitedEarly) {
            messageKey = 'finalMessageUnknown';
            finalScoreText = translations[currentLang].finalScoreLabel
                .replace('{score}', (totalScore / 10).toFixed(1))
                .replace('{total}', '?');
            playSound(sfxFinishBad);
        } else {
            let denominator = isPerSpeciesMode ? maxPossibleScore : (TOTAL_ROUNDS * 10);
            const scorePercentage = denominator > 0 ? totalScore / denominator : 1;
            
            if (scorePercentage === 1 && totalScore > 0) {
                messageKey = 'finalMessagePerfect';
                playSound(sfxFinishPerfect);
            } else if (scorePercentage >= 0.9) {
                messageKey = 'finalMessageGood';
                playSound(sfxFinishGood);
            } else if (scorePercentage >= 0.5) {
                messageKey = 'finalMessageOkay';
                playSound(sfxFinishOk);
            } else {
                messageKey = 'finalMessageBad';
                playSound(sfxFinishBad);
            }
            finalScoreText = translations[currentLang].finalScoreLabel
                .replace('{score}', (totalScore / 10).toFixed(1))
                .replace('{total}', (denominator / 10).toFixed(1));
        }
        
        finalMessageEl.textContent = translations[currentLang][messageKey];
        
        if (settings.timerEnabled) {
            const totalTimeText = translations[currentLang].totalTimeLabel.replace('{time}', formatTime(totalGameTime));
            finalScoreText += ` <br> <span style="font-size: 0.5em; color: var(--color-text-light); font-weight: 400;">${totalTimeText}</span>`;
        }
        finalScoreEl.innerHTML = finalScoreText;

        generateResultsTable();
        blitzDurationRecapEl.textContent = '';
        blitzDurationRecapEl.style.display = 'none';
        // -> НАЧАЛО ИЗМЕНЕНИЙ
        document.getElementById('blitz-spm-recap').style.display = 'none';
        document.getElementById('survival-index-recap').style.display = 'none';
        // -> КОНЕЦ ИЗМЕНЕНИЙ
        isClassicGameEndSequence = false; // <-- 2. ДОБАВИТЬ: ВЫКЛЮЧАЕМ ФЛАГ
    }, 400);
    
    // Сохраняем весь прогресс в файл
    saveProgressToFile();
}

async function endSurvivalGame() {
    gameIsOver = true;
    unlockAchievement('game_first_play');

    const settings = getSettings();
    // Берем только те базы, которые реально существуют сейчас
    const allStoredCustom = getStoredDbs();
    const activeDbNames = getActiveDbNames().filter(name => DEFAULT_DATABASES[name] || allStoredCustom[name]);
    const isOfficialGame = activeDbNames.length === 1 && !!DEFAULT_DATABASES[activeDbNames[0]];
    const allQuestionsAnswered = availableGenera.length === 0;
    let isNewRecord = false; // -> НАЧАЛО ИЗМЕНЕНИЙ

    // --- ШАГ 1: Рассчитываем правильный индекс ОДИН РАЗ ---
    const lives = parseInt(settings.survivalLives, 10);
    let multiplier = 1;
    if (lives === 3) multiplier = 3;
    if (lives === 1) multiplier = 10;
    // <-- Используем ТОЛЬКО УСПЕШНЫЕ раунды для расчета
    const successfulRounds = gameHistory.filter(r => r.finalStatus === 'correct' || r.finalStatus === 'almost').length;
    const weightedScore = ((successfulRounds * 10 + totalScore) * multiplier) / 100;

    // --- НАЧАЛО ИЗМЕНЕНИЙ ---
    let unlockedAchievementsBatch = []; // <-- 1. Сначала создаем пакет

    if (weightedScore >= 100.0) {
        unlockedAchievementsBatch.push('ach_survival_mastery_100'); // <-- 2. Добавляем в пакет, а не вызываем напрямую
    }
    // --- КОНЕЦ ИЗМЕНЕНИЙ ---

    // --- ШАГ 2: Используем готовое значение для обновления рекордов ---
    if (isOfficialGame) {
        // --- НАЧАЛО ДОБАВЛЕНИЯ: ЛОГИКА СЕРИИ ПОБЕД ---
        
        // 1. Считаем максимальную серию в ТОЛЬКО ЧТО ЗАВЕРШЕННОЙ игре
        let currentSessionStreak = 0;
        let maxSessionStreak = 0;
        gameHistory.forEach(round => {
            // Серия продолжается, только если ВСЕ ответы в раунде идеальны
            const isPerfectRound = round.answers.every(ans => ans.status === 'correct');
            if (isPerfectRound) {
                currentSessionStreak += round.answers.length; // Учитываем все виды в режиме "Name All"
            } else {
                // Если серия прервалась, проверяем, не была ли она максимальной
                if (currentSessionStreak > maxSessionStreak) {
                    maxSessionStreak = currentSessionStreak;
                }
                currentSessionStreak = 0; // Сбрасываем счетчик
            }
        });
        // Финальная проверка после окончания цикла
        if (currentSessionStreak > maxSessionStreak) {
            maxSessionStreak = currentSessionStreak;
        }

        // 2. Сравниваем серию этой сессии с глобальным рекордом
        const globalBestStreak = gameProgress.records.official.longestSurvivalStreak || 0;
        if (maxSessionStreak > globalBestStreak) {
            gameProgress.records.official.longestSurvivalStreak = maxSessionStreak;
        }
        
        // --- КОНЕЦ ДОБАВЛЕНИЯ ---

        const dbName = activeDbNames[0];
        const storedDifficulties = JSON.parse(localStorage.getItem(DB_DIFFICULTY_KEY)) || {};
        const difficultyLevel = storedDifficulties[dbName] || 1;

        // Получаем старый рекорд ПЕРЕД обновлением
        const oldSurvivalScore = gameProgress.records.official.survival?.[dbName]?.[difficultyLevel]?.score || 0;
        if (weightedScore > oldSurvivalScore) {
            isNewRecord = true;
        }
        // <- КОНЕЦ ИЗМЕНЕНИЙ

        gameProgress.records.official.survival = gameProgress.records.official.survival || {};
        gameProgress.records.official.survival[dbName] = gameProgress.records.official.survival[dbName] || {};

        const currentRecord = gameProgress.records.official.survival[dbName][difficultyLevel] || {
            score: 0, wonWithOneLife: false, wonAllSpeciesOneLife: false,
            gamesPlayed: 0,       // <-- НОВОЕ
            totalIndexSum: 0,      // <-- НОВОЕ
            averageIndex: 0, // <-- НОВОЕ: Поле для среднего индекса
            correctAnswers: 0,   // <-- ДОБАВИТЬ
            almostAnswers: 0,    // <-- ДОБАВИТЬ
            incorrectAnswers: 0  // <-- ДОБАВИТЬ
        };

        if (weightedScore > currentRecord.score) {
            currentRecord.score = weightedScore;
        }
        if (lives === 1 && allQuestionsAnswered) { // <-- Добавил allQuestionsAnswered для точности
            currentRecord.wonWithOneLife = true;
            if (settings.multiSpeciesMode === 'nameAll') {
                currentRecord.wonAllSpeciesOneLife = true;
            }
        }
        // Обновляем новую статистику
        currentRecord.gamesPlayed += 1;
        currentRecord.totalIndexSum += weightedScore;
        // <-- НОВОЕ: Пересчитываем средний индекс
        currentRecord.averageIndex = currentRecord.totalIndexSum / currentRecord.gamesPlayed;

        // --- НАЧАЛО ДОБАВЛЕНИЯ СЧЕТЧИКА ОТВЕТОВ ---
        gameHistory.forEach(round => {
            // В раунде может быть несколько ответов
            round.answers.forEach(answer => {
                if (answer.status === 'correct') {
                    currentRecord.correctAnswers += 1;
                } else if (answer.status === 'almost') {
                    currentRecord.almostAnswers += 1;
                } else if (answer.status === 'incorrect') {
                    currentRecord.incorrectAnswers += 1;
                }
            });
        });
        // --- КОНЕЦ ДОБАВЛЕНИЯ ---

        gameProgress.records.official.survival[dbName][difficultyLevel] = currentRecord;

        await checkAchievements({
            mode: 'survival',
            dbName: dbName,
            difficulty: difficultyLevel,
            lives: lives,
            multiSpeciesMode: settings.multiSpeciesMode,
            allQuestionsAnswered: allQuestionsAnswered
        }, unlockedAchievementsBatch); // <-- 2. Передаем пакет

    } else {
        // --- НАЧАЛО ДОБАВЛЕНИЯ ---
        gameProgress.records.custom = gameProgress.records.custom || {};
        gameProgress.records.custom.survival = gameProgress.records.custom.survival || { gamesPlayed: 0 };
        gameProgress.records.custom.survival.gamesPlayed += 1;
        // --- КОНЕЦ ДОБАВЛЕНИЯ ---
        const allDbsAreCustom = activeDbNames.every(name => !DEFAULT_DATABASES[name]);
        if (allDbsAreCustom && allQuestionsAnswered) {
            unlockedAchievementsBatch.push('meta_my_own_canon');
        }
    }

    // Проверка ачивок по базам данных
    // Проверяем наличие пользовательских баз, исключая пустые или устаревшие ID
    const customDbs = getStoredDbs();
    const hasCustomDb = activeDbNames.some(name => !DEFAULT_DATABASES[name] && customDbs[name]);
    if (hasCustomDb) unlockedAchievementsBatch.push('meta_pioneer');
    const showImagesSettings = settings.showImagesSurvival;
    if (hasCustomDb && customImageWasShown && showImagesSettings) {
        unlockedAchievementsBatch.push('meta_photohunter');
    }

    // <-- 3. Добавляем сортировку и вызов уведомлений -->
    unlockedAchievementsBatch.sort((a, b) => ACHIEVEMENT_DISPLAY_ORDER.indexOf(a) - ACHIEVEMENT_DISPLAY_ORDER.indexOf(b));
    unlockedAchievementsBatch.forEach(id => unlockAchievement(id));

    // --- ШАГ 3: Отображаем всё на экране ---
    if (allQuestionsAnswered) {
        playSound(sfxFinishPerfect);
    } else {
        stopAllMusic();
        playSound(sfxFinishOk);
    }

    showScreen(endScreen);
    // -> НАЧАЛО ИЗМЕНЕНИЙ
    const titleEl = endScreen.querySelector('h2');
    if (isNewRecord) {
        titleEl.textContent = translations[currentLang].newRecordTitle;
        // playSound(sfxNewRecord);
    } else {
        titleEl.textContent = translations[currentLang].gameOverTitle;
    }
    // <- КОНЕЦ ИЗМЕНЕНИЙ

    const messageKey = allQuestionsAnswered ? 'finalMessageSurvivalAllClear' : 'finalMessageSurvival';
    finalMessageEl.textContent = translations[currentLang][messageKey];

    generateResultsTable();

    finalScoreEl.innerHTML = translations[currentLang].finalScoreSurvivalLabel
        .replace('{score}', (totalScore / 10).toFixed(1));

    // <-- Используем рассчитанный weightedScore для отображения
    const survivalIndexRecapEl = document.getElementById('survival-index-recap');
    survivalIndexRecapEl.innerHTML = translations[currentLang].survivalIndexRecap
        .replace('{value}', weightedScore.toFixed(1));
    survivalIndexRecapEl.style.display = 'block';

    document.getElementById('blitz-spm-recap').style.display = 'none';
    blitzDurationRecapEl.textContent = '';
    blitzDurationRecapEl.style.display = 'none';

    saveProgressToFile();
}

async function endBlitzGame(reason = 'timeUp', duration = null) {
    gameIsOver = true; // Установим флаг в начале
    unlockAchievement('game_first_play');

    // --- НАЧАЛО БЛОКА ОБРАБОТКИ РЕЗУЛЬТАТОВ ---
    const settings = getSettings();
    // Берем только те базы, которые реально существуют сейчас
    const allStoredCustom = getStoredDbs();
    const activeDbNames = getActiveDbNames().filter(name => DEFAULT_DATABASES[name] || allStoredCustom[name]);
    const isOfficialGame = activeDbNames.length === 1 && DEFAULT_DATABASES[activeDbNames[0]];
    let isNewRecord = false; // -> НАЧАЛО ИЗМЕНЕНИЙ
    let unlockedAchievementsBatch = []; // <-- 1. Создаем пакет

    // --- НАЧАЛО ВСТАВКИ: ПРОВЕРКА АЧИВКИ "Я ТАК ВИЖУ" ---
    if (reason === 'allAnswered') {
        const activeDbNames = getActiveDbNames();
        const allDbsAreCustom = activeDbNames.every(name => !DEFAULT_DATABASES[name]);
        if (allDbsAreCustom) {
            unlockedAchievementsBatch.push('meta_my_own_canon');
        }
    }
    // --- КОНЕЦ ВСТАВКИ ---

    if (isOfficialGame) {
        const dbName = activeDbNames[0];
        const storedDifficulties = JSON.parse(localStorage.getItem(DB_DIFFICULTY_KEY)) || {};
        const difficultyLevel = storedDifficulties[dbName] || 1;
        const durationInMinutes = (parseInt(settings.blitzDuration, 10) / 60);
        const spm = durationInMinutes > 0 ? totalScore / durationInMinutes : 0;

        // Получаем старый рекорд ПЕРЕД обновлением
        const oldBestSpm = gameProgress.records.official.blitz?.[dbName]?.[difficultyLevel]?.bestSpm || 0;
        if (spm > oldBestSpm) {
            isNewRecord = true;
        }
        // <- КОНЕЦ ИЗМЕНЕНИЙ

        // --- ШАГ 1 НОВАЯ ЛОГИКА СОХРАНЕНИЯ РЕКОРДОВ ДЛЯ БЛИЦА ---
        gameProgress.records.official.blitz = gameProgress.records.official.blitz || {};
        gameProgress.records.official.blitz[dbName] = gameProgress.records.official.blitz[dbName] || {};
        
        // --- ШАГ 1 ... ---
        if (!gameProgress.records.official.blitz[dbName][difficultyLevel]) {
            gameProgress.records.official.blitz[dbName][difficultyLevel] = {
                bestSpm: 0, highScore5min: 0,
                gamesPlayed: 0,
                totalSpmSum: 0,
                averageSpm: 0, // <-- НОВОЕ: Поле для среднего SPM
                correctAnswers: 0, // <-- НОВОЕ
                almostAnswers: 0,  // <-- НОВОЕ
                incorrectAnswers: 0// <-- НОВОЕ
            };
        }
        const currentRecord = gameProgress.records.official.blitz[dbName][difficultyLevel];
        
        if (spm > currentRecord.bestSpm) {
            currentRecord.bestSpm = spm;
        }
        if (settings.blitzDuration === '300' && totalScore > currentRecord.highScore5min) {
            currentRecord.highScore5min = totalScore;
        }
        // --- НАЧАЛО ДОБАВЛЕНИЯ ---
        if (reason === 'allAnswered') {
            currentRecord.won = true;
        }
        // --- КОНЕЦ ДОБАВЛЕНИЯ ---
        
        // Обновляем статистику
        currentRecord.gamesPlayed += 1;
        currentRecord.totalSpmSum += spm;
        // <-- НОВОЕ: Пересчитываем среднее SPM
        currentRecord.averageSpm = currentRecord.totalSpmSum / currentRecord.gamesPlayed;
        // --- КОНЕЦ ИСПРАВЛЕННОЙ ЛОГИКИ ---
        // --- НАЧАЛО ДОБАВЛЕНИЯ СЧЕТЧИКА ОТВЕТОВ ---
        gameHistory.forEach(round => {
            // В раунде может быть несколько ответов
            round.answers.forEach(answer => {
                if (answer.status === 'correct') {
                    currentRecord.correctAnswers += 1;
                } else if (answer.status === 'almost') {
                    currentRecord.almostAnswers += 1;
                } else if (answer.status === 'incorrect') {
                    currentRecord.incorrectAnswers += 1;
                }
            });
        });
        // --- КОНЕЦ ДОБАВЛЕНИЯ ---

        // --- ШАГ 2: ПОТОМ ПРОВЕРЯЕМ АЧИВКИ ---
        await checkAchievements({
            mode: 'blitz',
            dbName: dbName,
            spm: spm,
            finalScore: totalScore,
            blitzDuration: settings.blitzDuration
        }, unlockedAchievementsBatch); // <-- 2. Передаем пакет
    }
    // --- НАЧАЛО ДОБАВЛЕНИЯ ---
    else {
        gameProgress.records.custom = gameProgress.records.custom || {};
        gameProgress.records.custom.blitz = gameProgress.records.custom.blitz || { gamesPlayed: 0 };
        gameProgress.records.custom.blitz.gamesPlayed += 1;
    }
    // --- КОНЕЦ ДОБАВЛЕНИЯ ---
    // --- КОНЕЦ БЛОКА ОБРАБОТКИ РЕЗУЛЬТАТОВ ---

    // Проверка ачивки "Первооткрыватель"
    // Проверяем наличие пользовательских баз, исключая пустые или устаревшие ID
    const customDbs = getStoredDbs();
    const hasCustomDb = activeDbNames.some(name => !DEFAULT_DATABASES[name] && customDbs[name]);
    if (hasCustomDb) unlockedAchievementsBatch.push('meta_pioneer');
    // Для блица нет ачивки Фотоохотник, так как там нет картинок, но на всякий случай код лучше иметь

    // <-- 3. Добавляем сортировку и вызов уведомлений -->
    unlockedAchievementsBatch.sort((a, b) => ACHIEVEMENT_DISPLAY_ORDER.indexOf(a) - ACHIEVEMENT_DISPLAY_ORDER.indexOf(b));
    unlockedAchievementsBatch.forEach(id => unlockAchievement(id));
    
    // Музыка и звуки
    if (reason === 'allAnswered') {
        stopAllMusic(); // Останавливаем музыку, если все пройдено
        playSound(sfxFinishPerfect);
    } else if (reason === 'endedEarly') {
        stopAllMusic(); // Останавливаем музыку при досрочном выходе
        playSound(sfxFinishBad);
    } else if (reason === 'timeUp') {
        // НЕ останавливаем музыку блица, она должна доиграть до конца
        playSound(sfxTimerEnd); // Проигрываем звук финала МГНОВЕННО
    }

    if (mainTimerInterval) {
        clearInterval(mainTimerInterval);
        mainTimerInterval = null;
    }
    
    if (reason === 'timeUp' && currentDino && currentDino.genus && settings.multiSpeciesMode === 'nameAll') {
        breakBlitzChain('timeout');
    }
    
    const elapsedMilliseconds = duration !== null ? duration : Date.now() - blitzStartTime;

    setTimeout(() => {
        showScreen(endScreen);

        // -> НАЧАЛО ИЗМЕНЕНИЙ
        const titleEl = endScreen.querySelector('h2');
        if (isNewRecord) {
            titleEl.textContent = translations[currentLang].newRecordTitle;
            // playSound(sfxNewRecord);
        } else {
            let titleKey = (reason === 'allAnswered') ? 'blitzAllQuestionsAnswered' : (reason === 'endedEarly' ? 'blitzGameEndedEarly' : 'blitzTimeUp');
            titleEl.textContent = translations[currentLang][titleKey];
        }
        // <- КОНЕЦ ИЗМЕНЕНИЙ

        let titleKey = (reason === 'allAnswered') ? 'blitzAllQuestionsAnswered' : (reason === 'endedEarly' ? 'blitzGameEndedEarly' : 'blitzTimeUp');
        
        finalMessageEl.textContent = ''; 
        finalScoreEl.textContent = translations[currentLang].blitzFinalScoreCombined.replace('{score}', (totalScore / 10).toFixed(1));
        // -> НАЧАЛО ИЗМЕНЕНИЙ
        const blitzSpmRecapEl = document.getElementById('blitz-spm-recap');
        const durationInMinutes = (parseInt(settings.blitzDuration, 10) / 60);
        const spmValue = durationInMinutes > 0 ? (totalScore / 10) / durationInMinutes : 0;

        blitzSpmRecapEl.innerHTML = translations[currentLang].blitzSpmRecap
            .replace('{value}', spmValue.toFixed(1));
        blitzSpmRecapEl.style.display = 'block';

        // Прячем другой элемент на всякий случай
        document.getElementById('survival-index-recap').style.display = 'none';
        // -> КОНЕЦ ИЗМЕНЕНИЙ

        const recapText = translations[currentLang].blitzDurationRecap.replace('{time}', formatBlitzTime(elapsedMilliseconds));
        blitzDurationRecapEl.textContent = recapText;
        blitzDurationRecapEl.style.display = 'block';
        blitzDurationRecapEl.style.fontSize = '1.0em';
        blitzDurationRecapEl.style.fontWeight = '400';
        blitzDurationRecapEl.style.color = 'var(--color-text-light)';
        blitzDurationRecapEl.style.marginTop = '10px';
        
        generateResultsTable();
    }, 0);

    // --- НАЧАЛО ВСТАВКИ: ПРОВЕРКА АЧИВКИ "ОШИБКА ОКРУГЛЕНИЯ / НАЕБАЛ СИСТЕМУ" ---
    if (reason === 'endedEarly' || reason === 'allAnswered') {
        const intendedDuration = parseInt(settings.blitzDuration, 10) * 1000;
        // Используем фактическое время, которое уже посчитано в elapsedMilliseconds
        if (elapsedMilliseconds > intendedDuration) {
            unlockAchievement('funny_rounding_error');
        }
    }
    // --- КОНЕЦ ВСТАВКИ ---

    // Сохраняем весь прогресс в файл
    saveProgressToFile();
}

function determineBlitzGenusStatus(genusData) {
    const { attempts, allSpecies } = genusData;
    const totalSpeciesCount = allSpecies.length;
    const namedSpeciesCount = attempts.filter(a => a.isAccepted).length;
    const hasError = attempts.some(a => a.status === 'incorrect');
    const hasTypo = attempts.some(a => a.status === 'almost');

    if (namedSpeciesCount === totalSpeciesCount) {
            if (hasTypo) return { text: translations[currentLang].resultsTable_statusAlmost, class: "text-almost" };
            return { text: translations[currentLang].resultsTable_statusCorrect, class: "text-correct" };
    } else {
        if (namedSpeciesCount === 0 && hasError) {
            return { text: translations[currentLang].resultsTable_statusIncorrect, class: "text-incorrect" };
        }
        if (hasError) return { text: translations[currentLang].resultsTable_statusPartially, class: "text-incorrect" };
        return { text: translations[currentLang].resultsTable_statusPartially, class: "text-almost" };
    }
}

function generateResultsTable() {
    const settings = getSettings();
    if (gameMode === 'blitz' && settings.multiSpeciesMode === 'nameAll') {
        let header = `<thead><tr>
            <th>${translations[currentLang].resultsTable_genus}</th>
            <th>${translations[currentLang].resultsTable_yourAnswer}</th>
            <th>${translations[currentLang].resultsTable_result}</th>
            <th>${translations[currentLang].resultsTable_score}</th>
            </tr></thead>`;

        let tableHTML = `<table id="results-table">${header}<tbody>`;
        const historyData = Object.values(blitzGenusHistory);

        for (const genusData of historyData) {
            const acceptedAttempts = genusData.attempts.filter(a => a.isAccepted);
            if (acceptedAttempts.length === 0) {
                continue;
            }
            const finalStatus = determineBlitzGenusStatus(genusData);
            const userAnswerCellHtml = acceptedAttempts.map(a => {
                return `<span class="text-${a.status}">${a.matched}</span>`;
            }).join(', ');
            const scoreCellHtml = acceptedAttempts.map(a => {
                return `<span class="text-${a.status}">${(a.score / 10).toFixed(1)}</span>`; // -> Делим на 10
            }).join(', ');

            tableHTML += `<tr>
                <td>${genusData.genus}</td>
                <td>${userAnswerCellHtml}</td>
                <td class="${finalStatus.class}">${finalStatus.text}</td>
                <td class="score-cell">${scoreCellHtml}</td>
            </tr>`;
        }
        tableHTML += `</tbody></table>`; 
        resultsTableContainer.innerHTML = tableHTML;

    } else {
        let headerHtml = `<thead><tr>
            ${(gameMode === 'classic' || gameMode === 'survival') ? `<th>${translations[currentLang].resultsTable_round}</th>` : ''}
            <th>${translations[currentLang].resultsTable_genus}</th>
            <th>${translations[currentLang].resultsTable_yourAnswer}</th>
            <th>${translations[currentLang].resultsTable_result}</th>
            <th>${translations[currentLang].resultsTable_score}</th>
            ${(gameMode === 'classic' && settings.timerEnabled) ? `<th>${translations[currentLang].resultsTable_time}</th>` : ''}
            ${gameMode === 'survival' ? `<th>${translations[currentLang].resultsTable_lives}</th>` : ''}
        </tr></thead>`;

        let tableHTML = `<table id="results-table">${headerHtml}<tbody>`;

        const statusMap = {
            correct: { text: translations[currentLang].resultsTable_statusCorrect, class: "text-correct" },
            almost: { text: translations[currentLang].resultsTable_statusAlmost, class: "text-almost" },
            incorrect: { text: translations[currentLang].resultsTable_statusIncorrect, class: "text-incorrect" },
            partially: { text: translations[currentLang].resultsTable_statusPartially, class: "text-incorrect" }
        };

        for (let i = 0; i < gameHistory.length; i++) {
            const round = gameHistory[i];
            if (round) {
                const finalResultInfo = statusMap[round.finalStatus] || statusMap['incorrect'];
                let userAnswerCellHtml = round.answers.map(ans => `<span class="${(statusMap[ans.status] || statusMap['incorrect']).class}">${ans.text || `<i>${translations[currentLang].feedback_empty}</i>`}</span>`).join(', ');

                if (round.firstAttemptData) {
                    const firstAttemptResultInfo = statusMap[round.firstAttemptData.status];
                    const firstPart = `<span class="${firstAttemptResultInfo.class}">${round.firstAttemptData.text}</span>`;
                    const secondPart = `<span class="${(statusMap[round.answers[0].status] || statusMap['incorrect']).class}">${round.answers[0].text}</span>`;
                    userAnswerCellHtml = `${firstPart} <span class="text-neutral">-></span> ${secondPart}`;
                }

                let scoreCellHtml;
                const isMultiSpeciesPerScoreMode = round.answers.length > 1 && settings.nameAllScoring === 'perSpecies';

                if (isMultiSpeciesPerScoreMode) {
                    scoreCellHtml = round.answers.map(ans => {
                        const score = ans.isAccepted ? ans.score : 0;
                        return `<span class="${(statusMap[ans.status] || statusMap['incorrect']).class}">${(score / 10).toFixed(1)}</span>`; // -> Делим на 10
                    }).join(', ');
                } else {
                    scoreCellHtml = (round.scoreAwarded / 10).toFixed(1); // -> Делим на 10
                }

                let rowHtml = '<tr>';
                if (gameMode === 'classic' || gameMode === 'survival') rowHtml += `<td>${i + 1}</td>`;
                rowHtml += `<td>${round.genus}</td><td>${userAnswerCellHtml}</td><td class="${finalResultInfo.class}">${finalResultInfo.text}</td>`;
                rowHtml += `<td class="score-cell ${isMultiSpeciesPerScoreMode ? '' : finalResultInfo.class}">${scoreCellHtml}</td>`;
                if (gameMode === 'classic' && settings.timerEnabled) {
                    rowHtml += `<td class="text-neutral score-cell">${formatTime(round.time)}</td>`;
                }
                if (gameMode === 'survival') {
                    // ... (логика жизней без изменений)
                    let livesCellHtml = '<td class="score-cell';
                    const livesChange = round.livesChange || 0;
                    if (livesChange > 0) {
                        livesCellHtml += ' text-correct">';
                        livesCellHtml += `+${livesChange.toFixed(1)}`;
                    } else if (livesChange < 0) {
                        const hasIncorrectAnswer = round.answers.some(ans => ans.status === 'incorrect');
                        const colorClass = hasIncorrectAnswer ? 'text-incorrect' : 'text-almost';
                        livesCellHtml += ` ${colorClass}">`;
                        livesCellHtml += livesChange.toFixed(1);
                    } else {
                        livesCellHtml += ' text-neutral">';
                        livesCellHtml += '--';
                    }
                    livesCellHtml += '</td>';
                    rowHtml += livesCellHtml;
                }
                rowHtml += '</tr>';
                tableHTML += rowHtml;
            }
        }
        tableHTML += `</tbody></table>`;
        resultsTableContainer.innerHTML = tableHTML;
    }
}

function returnToMainMenu() {
    playMenuMusic();
    clearInterval(mainTimerInterval);
    clearInterval(timerInterval);
    showScreen(startScreen);
}

function exitGameInProgress() {
    showCustomConfirm(
        translations[currentLang].confirm_exitGame,
        () => returnToMainMenu()
    );
}

// --- НАЧАЛО ВСТАВКИ: НОВАЯ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ---
function checkConfusedAchievement(userAnswerRaw, currentGenus) {
    // Собираем все виды из всей базы данных, кроме текущего рода
    const allOtherSpecies = Object.keys(dinoDatabase)
        .filter(g => g.toLowerCase() !== currentGenus.toLowerCase())
        .flatMap(g => dinoDatabase[g].map(s => s.species));
    
    // Проверяем ответ пользователя по этому пулу
    if (allOtherSpecies.length > 0) {
        const crossCheckResult = evaluateSingleAnswer(userAnswerRaw, allOtherSpecies);
        if (crossCheckResult.isAccepted) {
            unlockAchievement('funny_confused');
        }
    }
}
// --- КОНЕЦ ВСТАВКИ ---