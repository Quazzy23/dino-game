// --- ФУНКЦИИ-ГЕТТЕРЫ ---
function getRecords() {
    return gameProgress.records;
}

function getUnlockedAchievements() {
    return gameProgress.achievements;
}

// --- ФУНКЦИИ-СЕТТЕРЫ ---
// Сохраняет весь объект gameProgress в файл
async function saveProgressToFile() {
    try {
        const dataToSave = JSON.stringify(gameProgress, null, 2);
        await window.electronAPI.saveUserData(dataToSave);
    } catch (error) {
        console.error("Failed to save progress:", error);
    }
}

// --- НАЧАЛО ВСТАВКИ: НОВАЯ СИСТЕМА УВЕДОМЛЕНИЙ С ОЧЕРЕДЬЮ ---
async function unlockAchievement(id) {
    const unlocked = getUnlockedAchievements();
    if (unlocked.includes(id)) return;

    unlocked.push(id);
    gameProgress.achievements = unlocked;
    await saveProgressToFile();

    // --- НАЧАЛО ИЗМЕНЕНИЙ ---
    // Проверяем, активен ли флаг завершения классической игры
    const delay = isClassicGameEndSequence ? 1000 : 500;
    // --- КОНЕЦ ИЗМЕНЕНИЙ ---

    setTimeout(() => {
        if (!notificationQueue.includes(id)) {
            notificationQueue.push(id);
            if (notificationQueue.length === 1) {
                showNextNotification();
            }
        }
    }, delay); // <-- Используем нашу новую переменную для задержки
}

function showNextNotification() {
    // Если очередь пуста, ничего не делаем
    if (notificationQueue.length === 0) return;

    // Берем первое ID из очереди, но НЕ удаляем его пока
    const achievementId = notificationQueue[0];
    
    const container = document.getElementById('notification-container');
    const achievement = ALL_ACHIEVEMENTS[achievementId];
    if (!achievement) {
        // Если ачивка не найдена, убираем ее из очереди и пробуем следующую
        notificationQueue.shift();
        showNextNotification();
        return;
    }

    const lang = getSettings().language;
    const title = translations[lang].tabAchievements || 'Достижение';
    const message = translations[lang][achievement.nameKey] || achievement.nameKey;

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <div class="notification-toast-icon">🏆</div>
        <div class="notification-toast-content">
            <p class="title">${title}</p>
            <p class="message">${message}</p>
        </div>
    `;

    container.prepend(toast);
    playSound(sfxAchievement);

    // Длительность показа уведомления
    const notificationDuration = 5000;
    // Задержка перед показом следующего
    const nextNotificationDelay = 2000;

    // Когда анимация уведомления почти закончилась...
    setTimeout(() => {
        toast.remove();
    }, notificationDuration);

    // ...запускаем показ следующего из очереди с задержкой
    setTimeout(() => {
        // Удаляем только что показанное уведомление из очереди
        notificationQueue.shift();
        // И запускаем показ следующего
        showNextNotification();
    }, nextNotificationDelay);
}
// --- КОНЕЦ ВСТАВКИ ---

// --- ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ПРОГРЕССА ---
async function initializeProgress() {
    const fileContent = await window.electronAPI.loadUserData();
    if (fileContent) {
        try {
            const loaded = JSON.parse(fileContent);
            
            // 1. Загружаем простые поля
            if (loaded.version) gameProgress.version = loaded.version;
            if (loaded.achievements) gameProgress.achievements = loaded.achievements;
            if (loaded.totalPlaytimeSeconds) gameProgress.totalPlaytimeSeconds = loaded.totalPlaytimeSeconds;
            
            // 2. Загружаем рекорды (самое важное)
            if (loaded.records) {
                // Прямое копирование подобъектов, чтобы не потерять структуру
                if (loaded.records.official) {
                    gameProgress.records.official = loaded.records.official;
                }
                if (loaded.records.custom) {
                    gameProgress.records.custom = loaded.records.custom;
                }
            }
            
            console.log("Система: Прогресс успешно загружен из файла.");
        } catch (e) {
            console.error("Ошибка при чтении файла прогресса:", e);
        }
    }
}

// --- КОНЕЦ ВСТАВКИ ---

function getStoredDbs() {
    return JSON.parse(localStorage.getItem(DB_STORAGE_KEY)) || {};
}

function saveStoredDbs(dbs) {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dbs));
}

function getActiveDbNames() { 
    const stored = localStorage.getItem(ACTIVE_DBS_KEY);
    if (stored === null) {
        // Теперь по умолчанию будет активна только одна база
        return ['dinos-classic']; // <-- ИСПРАВЛЕНО
    }
    return JSON.parse(stored);
}

function getCustomImageFolders() {
    return JSON.parse(localStorage.getItem(CUSTOM_IMAGES_KEY)) || [];
}

function saveCustomImageFolders(folders) {
    localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(folders));
}

function getActiveImageFolders() {
    return JSON.parse(localStorage.getItem(ACTIVE_IMAGES_KEY)) || [];
}

function saveActiveImageFolders(folders) {
    localStorage.setItem(ACTIVE_IMAGES_KEY, JSON.stringify(folders));
}

function renderCustomImageFolders() {
    const listEl = document.getElementById('custom-images-list');
    listEl.innerHTML = '';
    const folders = getCustomImageFolders();
    const activeFolders = getActiveImageFolders();

    if (folders.length === 0) {
        // Используем ключ перевода для консистентности
        listEl.innerHTML = `<li>${translations[getSettings().language].noCustomImageFolders || "Папки с изображениями не загружены."}</li>`;
        return;
    }

    folders.forEach(folder => {
        const li = document.createElement('li');
        li.draggable = true;
        const isChecked = activeFolders.includes(folder.path);
        
        // Используем ТОЧНО ТАКУЮ ЖЕ структуру, как у баз данных
        li.innerHTML = `
            <input type="checkbox" class="db-select-checkbox image-folder-checkbox" data-path="${folder.path}" ${isChecked ? 'checked' : ''}>
            <div class="db-name-with-path">
                <span class="db-name">${folder.name}</span>
                <small class="db-path">${folder.path}</small>
            </div>
            <div class="db-item-controls">
                <button class="delete-db-btn delete-image-folder-btn" data-path="${folder.path}">×</button>
            </div>
        `;
        listEl.appendChild(li);
    });
}

function saveActiveDbNames(names) {
    localStorage.setItem(ACTIVE_DBS_KEY, JSON.stringify(names));
}

function getSettings() {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored === null) {
        // Если настроек нет (первый запуск), сразу записываем дефолты в память
        saveSettings(DEFAULT_SETTINGS);
        return { ...DEFAULT_SETTINGS };
    }
    // Если настройки есть, объединяем их с дефолтными (на случай появления новых полей)
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
}

function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function getDbOrder() {
    return JSON.parse(localStorage.getItem(DB_ORDER_KEY)) || [];
}

function saveDbOrder(order) {
    localStorage.setItem(DB_ORDER_KEY, JSON.stringify(order));
}

// --- НАЧАЛО ЗАМЕНЫ: ФИНАЛЬНАЯ ВЕРСИЯ ПРОВЕРКИ АЧИВОК ---
async function checkAchievements(gameResults, unlockedAchievementsBatch) {
    // --- 1. Получаем все данные о сложностях ОДИН РАЗ ---
    const allDbDifficulties = {};
    for (const dbName of Object.keys(DEFAULT_DATABASES)) {
        try {
            const response = await fetch(`./default_databases/${DEFAULT_DATABASES[dbName].file}`);
            const data = await response.text();
            allDbDifficulties[dbName] = analyzeDatabaseDifficulty(data) || 1;
        } catch (e) {
            allDbDifficulties[dbName] = 1;
        }
    }

    const { mode, dbName, difficulty, scorePercent, isMarathon, multiSpeciesMode, lives, allQuestionsAnswered, totalRounds, spm, finalScore, blitzDuration } = gameResults;

    // --- 2. Основные проверки по результатам текущей игры ---
    if (mode === 'classic') {
        if (scorePercent >= 90) unlockedAchievementsBatch.push('classic_good');
        if (scorePercent === 100) unlockedAchievementsBatch.push('classic_perfect');
        if (isMarathon && multiSpeciesMode === 'nameAll' && scorePercent === 100) {
            unlockedAchievementsBatch.push('classic_marathon_perfect');
            if (difficulty === allDbDifficulties[dbName]) unlockedAchievementsBatch.push('classic_marathon_perfect_hard');
        }
        if (totalRounds > 0 && scorePercent === 0) unlockedAchievementsBatch.push('funny_fiasco');
    } 
    else if (mode === 'survival' && allQuestionsAnswered) {
        unlockedAchievementsBatch.push('survival_win');
        if (lives === 1 && multiSpeciesMode === 'nameAll') {
            unlockedAchievementsBatch.push('survival_win_1life');
            if (difficulty === allDbDifficulties[dbName]) unlockedAchievementsBatch.push('survival_win_1life_hard');
        }
        if (currentLives === 0.5) {
            unlockedAchievementsBatch.push('survival_on_the_edge');
        }
    } 
    else if (mode === 'blitz') {
        const currentSpm = spm / 10;
        if (currentSpm >= 15.0) unlockedAchievementsBatch.push('blitz_adrenaline');
        if (currentSpm >= 20.0) unlockedAchievementsBatch.push('blitz_supersonic');
        if (blitzDuration === '300' && finalScore > 600) {
            unlockedAchievementsBatch.push('blitz_clockmaster');
        }
    }

    // --- 3. Мета-проверки, которые смотрят на ВЕСЬ прогресс ---
    const records = getRecords().official;
    if (!records) return;

    const playedOnAllDbs = Object.keys(DEFAULT_DATABASES).every(dbKey => 
        (records.classic && records.classic[dbKey]) || 
        (records.blitz && records.blitz[dbKey]) || 
        (records.survival && records.survival[dbKey])
    );
    if (playedOnAllDbs) unlockedAchievementsBatch.push('meta_explorer');

    let isChampion = true;
    for (const dbKey of Object.keys(DEFAULT_DATABASES)) {
        const maxDiff = allDbDifficulties[dbKey];
        for (let i = 1; i <= maxDiff; i++) {
            const classicRecord = records.classic?.[dbKey]?.[i];
            if (!classicRecord || classicRecord.bestPercent < 100) {
                isChampion = false; break;
            }
            const survivalRecord = records.survival?.[dbKey]?.[i];
            if (!survivalRecord) {
                isChampion = false; break;
            }
        }
        if (!isChampion) break;
    }
    if (isChampion) unlockedAchievementsBatch.push('meta_champion');
    
    let isLorekeeper = true;
    for (const dbKey of Object.keys(DEFAULT_DATABASES)) {
        const maxDiff = allDbDifficulties[dbKey];
        for (let i = 1; i <= maxDiff; i++) {
            const classicRecord = records.classic?.[dbKey]?.[i];
            if (!classicRecord || classicRecord.bestPercent < 100) {
                isLorekeeper = false; break;
            }
        }
        if (!isLorekeeper) break;
    }
    if(isLorekeeper) unlockedAchievementsBatch.push('meta_lorekeeper');

    let isGod = true;
    for (const dbKey of Object.keys(DEFAULT_DATABASES)) {
        const maxDiff = allDbDifficulties[dbKey];
        for (let i = 1; i <= maxDiff; i++) {
            // 1. Проверки Классики и Выживания (без изменений)
            if (!records.classic?.[dbKey]?.[i]?.marathonAllSpecies100) {
                isGod = false; break;
            }
            if (!records.survival?.[dbKey]?.[i]?.wonAllSpeciesOneLife) {
                isGod = false; break;
            }

            // 2. Новые проверки для Блица с условием "ИЛИ"
            const blitzRecord = records.blitz?.[dbKey]?.[i] || { bestSpm: 0, highScore5min: 0, won: false };
            
            // Проверяем SPM: нужно > 20 ИЛИ победа
            const spmConditionMet = (blitzRecord.bestSpm / 10) > 20 || blitzRecord.won === true;
            if (!spmConditionMet) {
                isGod = false; break;
            }

            // Проверяем счет: нужно > 600 ИЛИ победа
            const scoreConditionMet = blitzRecord.highScore5min > 600 || blitzRecord.won === true;
            if (!scoreConditionMet) {
                isGod = false; break;
            }
        }
        if (!isGod) break;
    }

    if (isGod) {
        unlockedAchievementsBatch.push('meta_god');
    }
}

// Вспомогательная функция для получения макс. сложности
async function getMaxDifficultyForDb(dbName) {
    try {
        const response = await fetch(`./default_databases/${DEFAULT_DATABASES[dbName].file}`);
        const data = await response.text();
        return analyzeDatabaseDifficulty(data) || 1;
    } catch (e) {
        console.error(`Could not fetch difficulty for ${dbName}`, e);
        return 1; // Возвращаем 1 в случае ошибки
    }
}

function renderAchievements() {
    const listEl = document.getElementById('achievements-list');
    const unlocked = getUnlockedAchievements();
    const lang = getSettings().language;
    listEl.innerHTML = '';

    for (const id in ALL_ACHIEVEMENTS) {
        const achievement = ALL_ACHIEVEMENTS[id];
        const isUnlocked = unlocked.includes(id);

        // --- НОВАЯ ЛОГИКА ---
        // 1. Если достижение скрыто и не получено - пропускаем его
        if (achievement.hidden && !isUnlocked) {
            continue;
        }

        const li = document.createElement('li');
        let classList = 'achievement-item';
        
        if (isUnlocked) {
            // 2. Если ачивка золотая и получена - добавляем особый класс
            if (achievement.golden) {
                classList += ' achievement-golden';
            } else {
                classList += ' achievement-unlocked';
            }
        } else {
            classList += ' achievement-locked';
        }
        li.className = classList;
        // --- КОНЕЦ НОВОЙ ЛОГИКИ ---
        
        li.innerHTML = `
            <div class="achievement-name">${translations[lang][achievement.nameKey] || achievement.nameKey}</div>
            <div class="achievement-desc">${translations[lang][achievement.descKey] || achievement.descKey}</div>
        `;
        listEl.appendChild(li);
    }
}
// --- КОНЕЦ ВСТАВКИ ---