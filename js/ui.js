// === ФУНКЦИИ ПЕРЕКЛЮЧЕНИЯ ЯЗЫКА И ТЕМЫ ===

function applyLanguage(lang) {
    currentLang = lang;

    // Отправляем команду Электрону обновить верхнее меню
    if (window.electronAPI && window.electronAPI.updateMenuLanguage) {
        window.electronAPI.updateMenuLanguage(lang);
    }
    
    document.documentElement.lang = lang;
    document.body.dataset.lang = lang;

    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.dataset.translateKey;
        const translation = translations[lang][key];
        if (translation) {
            if(el.placeholder !== undefined) {
                el.placeholder = translation;
            } else {
                el.innerHTML = translation;
            }
        }
    });
    
    // Обновляем текст в селекторе длительности блица
    if (blitzDurationSelect) {
        blitzDurationSelect.options[0].text = translations[currentLang].blitzDuration_1;
        blitzDurationSelect.options[1].text = translations[currentLang].blitzDuration_3;
        blitzDurationSelect.options[2].text = translations[currentLang].blitzDuration_5;
    }
    
    // Принудительно обновляем тему и её текстовую метку
    applyTheme(getSettings().theme);

    if (aboutContentEl) {
        // Сначала просто вставляем текст из переводов
        aboutContentEl.innerHTML = translations[lang].aboutText;
        
        // Затем ищем наше "посадочное место" и вставляем туда версию из системы
        const versionDisplay = document.getElementById('app-version-display');
        if (versionDisplay && window.electronAPI.getAppVersion) {
            window.electronAPI.getAppVersion().then(ver => {
                versionDisplay.textContent = ver;
            });
        }
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeText.innerHTML = theme === 'dark' ? translations[currentLang].darkTheme : translations[currentLang].lightTheme;
    themeSwitch.checked = theme === 'dark';
}


// === УПРАВЛЕНИЕ ЭКРАНАМИ И КНОПКАМИ ===

// === НАЧАЛО НОВОЙ ФУНКЦИИ-МЕНЕДЖЕРА ЭКРАНОВ ===
function showScreen(screenToShow) {
    startScreen.style.display = 'none';
    gameContainer.style.display = 'none';
    endScreen.style.display = 'none';
    settingsScreen.style.display = 'none';
    easterEggScreen.style.display = 'none';
    document.getElementById('records-screen').style.display = 'none';

    // НОВАЯ СТРОКА
    if (aboutScreen) aboutScreen.style.display = 'none'; 

    if (screenToShow) {
        screenToShow.style.display = 'block';
    }
}
// === КОНЕЦ НОВОЙ ФУНКЦИИ-МЕНЕДЖЕРА ЭКРАНОВ ===

function updateStartButtonState() {
    startButton.disabled = getActiveDbNames().length === 0;
}

async function openSettings() {
    showScreen(settingsScreen);
}

function closeSettings() { 
    showScreen(startScreen);
    playMenuMusic();
}

async function openDbManagement() {
    // Эти функции теперь вызываются здесь, а не в openSettings
    renderCustomImageFolders();
    await renderDbList();
}

function openRecordsScreen() {
    showScreen(document.getElementById('records-screen'));
    renderRecords();
}
// --- КОНЕЦ ДОБАВЛЕНИЯ ---


// === ОТРИСОВКА СПИСКОВ И ТАБЛИЦ ===

async function renderDbList() {
    defaultDbListEl.innerHTML = '';
    customDbListEl.innerHTML = '';
    const activeDbNames = getActiveDbNames();
    const storedDifficulties = JSON.parse(localStorage.getItem(DB_DIFFICULTY_KEY)) || {};
    const customDbs = getStoredDbs();

    // --- НАЧАЛО ПОЛНОЙ И ИСПРАВЛЕННОЙ ЗАМЕНЫ ФУНКЦИИ ---
    const createDbListItem = async (name, isDefault) => {
        // ВОТ ИСПРАВЛЕНИЕ: Эта строка была пропущена. Она создает сам элемент списка.
        // 1. Сначала объявляем все нужные переменные (один раз!)
        const lang = getSettings().language;
        const li = document.createElement('li'); 
        
        li.dataset.filename = name; // Здесь name - это ключ (для дефолтных - имя, для кастомных - путь)
        const isChecked = activeDbNames.includes(name);

        let displayName = name;
        let displayPath = null;

        if (isDefault) {
            // Если база встроенная, берем красивое имя из словаря
            displayName = translations[lang][`db_name_${name}`] || name;
        } else {
            // Если это кастомная база, извлекаем имя файла из полного пути
            const posixPath = name.replace(/\\/g, '/');
            displayName = posixPath.substring(posixPath.lastIndexOf('/') + 1);
            displayPath = name; 
        }

        // --- БЛОК 1: ПОЛУЧЕНИЕ ДАННЫХ И АНАЛИЗ (остается почти без изменений) ---
        let data;
        try {
            if (isDefault) {
                const response = await fetch(`./default_databases/${DEFAULT_DATABASES[name].file}`);
                data = await response.text();
            } else {
                data = customDbs[name]; // name здесь - это полный путь
            }
        } catch (e) {
            console.error(`Не удалось прочитать базу ${name}.`);
            data = null;
        }
        
        const difficultyLevels = data ? analyzeDatabaseDifficulty(data) : null;
        const { stats: dbStats, hasLevels } = analyzeDbContent(data, difficultyLevels);

        // --- БЛОК 2: ГЕНЕРАЦИЯ HTML ДЛЯ ТУЛТИПА (без изменений) ---
        let tooltipText = '<div style="text-align: left;">';
        const stats = dbStats;
        tooltipText += `<b>${translations[lang].uniqueEntriesHeader || 'Unique Entries'}:</b><br>`;
        const formatLine = (count, type) => { if (lang === 'ru') { const cases = (type === 'genera') ? ['род', 'рода', 'родов'] : ['вид', 'вида', 'видов']; const n = Math.abs(count) % 100; const n1 = n % 10; if (n > 10 && n < 20) return `${count} ${cases[2]}`; if (n1 > 1 && n1 < 5) return `${count} ${cases[1]}`; if (n1 === 1) return `${count} ${cases[0]}`; return `${count} ${cases[2]}`; } return `${count} ${(type === 'genera' ? 'genera' : 'species')}`; };
        if (hasLevels) { const sortedLevels = Object.keys(stats).sort((a, b) => a - b); sortedLevels.forEach((level, index) => { const levelStats = stats[level]; const levelLabel = `${(translations[lang].difficultyLabel || 'Difficulty:').slice(0, -1)} ${level}`; const generaText = formatLine(levelStats.genera.size, 'genera'); const speciesText = formatLine(levelStats.species.size, 'species'); tooltipText += `${levelLabel}: ${generaText}, ${speciesText}`; if (index < sortedLevels.length - 1) tooltipText += '<br>'; }); } else { const totalStats = stats[0]; if (totalStats) { const generaText = formatLine(totalStats.genera.size, 'genera'); const speciesText = formatLine(totalStats.species.size, 'species'); tooltipText += `${generaText}, ${speciesText}`; } else { tooltipText += translations[lang].noDataForAnalysis || 'No data for analysis.'; } }
        tooltipText += '</div>';
        const safeTooltipText = tooltipText.replace(/"/g, '"');
        const tooltipHtml = `<span class="tooltip-icon">i<span class="tooltip-text tooltip-text-wide">${safeTooltipText}</span></span>`;
        
        // --- БЛОК 3: ГЕНЕРАЦИЯ HTML ДЛЯ СЕЛЕКТОРА СЛОЖНОСТИ (без изменений) ---
        let difficultySelectorHtml = '';
        if (difficultyLevels && difficultyLevels > 0) { const currentDifficulty = storedDifficulties[name] || 1; let optionsHtml = ''; for (let i = 1; i <= difficultyLevels; i++) { optionsHtml += `<option value="${i}" ${String(i) === String(currentDifficulty) ? 'selected' : ''}>${i}</option>`; } difficultySelectorHtml = `<div class="difficulty-selector-wrapper"><label data-translate-key="difficultyLabel">Сложность:</label><select data-dbname="${name}" class="difficulty-select">${optionsHtml}</select></div>`; }

        // --- БЛОК 4: СБОРКА ВСЕХ ЭЛЕМЕНТОВ ---
        const deleteButtonHtml = isDefault ? '' : `<button class="delete-db-btn" data-filename="${name}">×</button>`;
        const pathHtml = displayPath ? `<small class="db-path">${displayPath}</small>` : ''; // Создаем HTML для пути

        li.draggable = !isDefault;
        li.innerHTML = `
            <input type="checkbox" class="db-select-checkbox" data-filename="${name}" ${isChecked ? 'checked' : ''}>
            <div class="db-name-with-path">
                <span class="db-name">${displayName}</span>
                ${pathHtml}
            </div>
            <div class="db-item-controls">
                ${tooltipHtml}
                ${difficultySelectorHtml}
                ${deleteButtonHtml}
            </div>
        `;
        return li;
    };
    // --- КОНЕЦ ПОЛНОЙ И ИСПРАВЛЕННОЙ ЗАМЕНЫ ФУНКЦИИ ---

    // --- Обработка дефолтных баз ---
    for (const name of Object.keys(DEFAULT_DATABASES)) {
        const li = await createDbListItem(name, true);
        defaultDbListEl.appendChild(li);
    }
    
    // --- Обработка кастомных баз ---
    let dbOrder = getDbOrder();
    // ... (остальная логика сортировки кастомных баз остается без изменений) ...

    if (dbOrder.length === 0) {
        const li = document.createElement('li');
        li.innerHTML = translations[currentLang].noCustomDbs;
        customDbListEl.appendChild(li);
    } else {
        for (const name of dbOrder) {
            const li = await createDbListItem(name, false);
            customDbListEl.appendChild(li);
        }
    }

    // -> Добавляем общий обработчик для селекторов сложности
    document.querySelectorAll('.difficulty-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const dbName = e.target.dataset.dbname;
            const newDifficulty = e.target.value;
            const difficulties = JSON.parse(localStorage.getItem(DB_DIFFICULTY_KEY)) || {};
            difficulties[dbName] = newDifficulty;
            localStorage.setItem(DB_DIFFICULTY_KEY, JSON.stringify(difficulties));
        });
    });
    applyLanguage(getSettings().language);
}

// --- НАЧАЛО ПОЛНОЙ ЗАМЕНЫ: ИСПРАВЛЕННЫЙ РЕНДЕР РЕКОРДОВ ---
async function renderRecords() {
    const records = getRecords();
    console.log("Отладка: Данные для таблицы рекордов:", records);
    const lang = getSettings().language;
    const recordsScreen = document.getElementById('records-screen');
    const classicContainer = document.getElementById('records-classic-container');
    const blitzContainer = document.getElementById('records-blitz-container');
    const survivalContainer = document.getElementById('records-survival-container');
    classicContainer.innerHTML = '';
    blitzContainer.innerHTML = '';
    survivalContainer.innerHTML = '';

    const formatNumber = (num) => {
        if (num % 1 === 0) return num.toString();
        return num.toFixed(1);
    };

    // --- Сбор информации о сложностях всех баз ---
    const allDbDifficulties = {};
    let maxDifficultyOverall = 0;
    for (const dbName of Object.keys(DEFAULT_DATABASES)) {
        try {
            const response = await fetch(`./default_databases/${DEFAULT_DATABASES[dbName].file}`);
            const data = await response.text();
            const difficultyLevels = analyzeDatabaseDifficulty(data) || 1;
            allDbDifficulties[dbName] = difficultyLevels;
            if (difficultyLevels > maxDifficultyOverall) {
                maxDifficultyOverall = difficultyLevels;
            }
        } catch (e) { console.error(`Failed to analyze DB: ${dbName}`); }
    }

    // --- Функция для создания таблицы (с подсказками для ачивок) ---
    const createRecordsTable = (mode) => {
        const tableWrapper = document.createElement('div');
        tableWrapper.style.overflowX = 'auto';
        
        const table = document.createElement('table');
        table.id = 'results-table';
        table.style.tableLayout = 'fixed';

        const thead = table.createTHead();
        
        const subtitleRow = thead.insertRow();
        subtitleRow.insertCell(); 
        const subtitleCell = subtitleRow.insertCell();
        subtitleCell.colSpan = maxDifficultyOverall;
        subtitleCell.textContent = translations[lang].difficultyLabel || 'Сложность';
        subtitleCell.style.textAlign = 'center';
        subtitleCell.style.fontWeight = 'normal';
        subtitleCell.style.fontSize = '0.9em';
        subtitleCell.style.color = 'var(--color-text-light)';
        subtitleCell.style.borderBottom = '1px solid var(--color-border)';

        const headerRow = thead.insertRow();
        const firstHeaderCell = headerRow.insertCell();
        firstHeaderCell.innerHTML = `<b>${translations[lang].tableHeader_dbName || 'База'}</b>`;
        firstHeaderCell.style.width = '140px'; // Задаем фиксированную ширину для первой колонки

        for (let i = 1; i <= maxDifficultyOverall; i++) {
            const th = headerRow.insertCell();
            th.textContent = i.toString();
            th.style.textAlign = 'center';
        }

        const tbody = table.createTBody();
        for (const dbName of Object.keys(DEFAULT_DATABASES)) {
            const dbRow = tbody.insertRow();
            const prettyName = translations[lang][`db_name_${dbName}`] || dbName;
            dbRow.insertCell().innerHTML = `<b>${prettyName}</b>`;

            for (let i = 1; i <= maxDifficultyOverall; i++) {
                const cell = dbRow.insertCell();
                cell.style.textAlign = 'center';

                if (i > allDbDifficulties[dbName]) {
                    cell.innerHTML = '<span style="color: var(--color-border)">—</span>';
                    continue;
                }

                // --- НОВАЯ ЛОГИКА С ПРОВЕРКОЙ НА МЕРЦАНИЕ ---
                if (mode === 'classic') {
                    const record = records.official.classic?.[dbName]?.[i];
                    const displayValue = record?.bestPercent || 0;
                    cell.textContent = formatNumber(displayValue);
                    // Условие для мерцания: 100% и флаг марафона
                    if (displayValue === 100 && record?.marathonAllSpecies100) {
                        cell.classList.add('hint-cell-pulse');
                    }
                } else if (mode === 'blitz') {
                    const record = records.official.blitz?.[dbName]?.[i];
                    const spmValue = record?.bestSpm || 0;
                    cell.textContent = formatNumber(spmValue / 10);
                    
                    // --- НАЧАЛО ИЗМЕНЕНИЙ: НОВОЕ УСЛОВИЕ ДЛЯ МЕРЦАНИЯ ---
                    // Условие: SPM > 20 ИЛИ была победа
                    if ((spmValue / 10) > 20 || record?.won === true) {
                        cell.classList.add('hint-cell-pulse');
                    }
                    // --- КОНЕЦ ИЗМЕНЕНИЙ ---
                } else if (mode === 'survival') {
                    const displayValue = records.official.survival?.[dbName]?.[i]?.score || 0;
                    cell.textContent = formatNumber(displayValue);
                    // Для выживания мерцания нет
                }
                // --- КОНЕЦ НОВОЙ ЛОГИКИ ---
            }
        }
        
        tableWrapper.appendChild(table);
        return tableWrapper;
    };

    // --- Генерация и вставка таблиц ---
    classicContainer.appendChild(createRecordsTable('classic'));
    blitzContainer.appendChild(createRecordsTable('blitz'));
    survivalContainer.appendChild(createRecordsTable('survival'));
}
// --- КОНЕЦ ПОЛНОЙ ЗАМЕНЫ ---


// === НАСТРОЙКИ ИНТЕРФЕЙСА ИГРЫ ===

function toggleGameModeSettings(mode) {
    classicSettingsEl.style.display = 'none';
    blitzSettingsEl.style.display = 'none';
    survivalSettingsEl.style.display = 'none';

    if (mode === 'classic') {
        classicSettingsEl.style.display = 'block';
    } else if (mode === 'blitz') {
        blitzSettingsEl.style.display = 'block';
    } else if (mode === 'survival') {
        survivalSettingsEl.style.display = 'block';
    }

    const showMultiSpecies = (mode === 'classic' || mode === 'survival' || mode === 'blitz');
    multiSpeciesModeSelect.closest('.settings-row').style.display = showMultiSpecies ? 'flex' : 'none';
}

function toggleNameAllScoringSettingVisibility() {
    const settings = getSettings();
    const isVisible = settings.gameMode === 'classic' && settings.multiSpeciesMode === 'nameAll';
    nameAllScoringSettings.style.display = isVisible ? 'flex' : 'none';
}

function updateGameModeDisplay() {
    const settings = getSettings();
    const lang = settings.language;
    
    // Находим наш элемент в HTML
    const gameModeHeaderEl = document.getElementById('game-mode-header');

    // Создаем карту соответствия значения настройки и ключа перевода
    const keyMap = {
        'acceptAny': 'acceptAnyOption',
        'guessOne': 'guessOneOption',
        'nameAll': 'nameAllOption'
    };
    
    // Получаем нужный ключ и переведенный текст
    const modeKey = keyMap[settings.multiSpeciesMode];
    const modeText = translations[lang][modeKey] || ''; // Текст для "Любой вид", "Конкретный вид" и т.д.
    
    // Получаем текст для заголовка "Режим:"
    const labelText = translations[lang].gameModeLabel || 'Mode';
    
    // Формируем и вставляем итоговую строку в HTML
    gameModeHeaderEl.innerHTML = `${labelText}: <b>${modeText}</b>`;
}

function updateLivesDisplay() {
    livesContainerEl.innerHTML = '';
    if (gameMode !== 'survival') {
        livesContainerEl.style.display = 'none';
        return;
    }
    livesContainerEl.style.display = 'flex';

    for (let i = 1; i <= maxLives; i++) {
        const circle = document.createElement('div');
        circle.style.width = '18px';
        circle.style.height = '18px';
        circle.style.borderRadius = '50%';
        circle.style.transition = 'border-color 0.3s'; // Убрали лишнее
        
        circle.style.backgroundImage = 'none';
        circle.style.backgroundColor = 'transparent';

        if (currentLives >= i) { // Полная жизнь
            circle.classList.add('life-filled');
            circle.style.backgroundColor = 'var(--color-text-light)';
            circle.style.border = '2px solid var(--color-text-light)';
        } else if (currentLives > i - 1) { // Половина жизни
            circle.classList.add('life-half'); // <-- Используем уникальный класс
            circle.style.backgroundImage = `linear-gradient(to right, var(--color-text-light) 50%, transparent 50%)`;
            circle.style.border = '2px solid var(--color-text-light)';
        } else { // Пустая жизнь
            circle.classList.add('life-empty');
            circle.style.border = '2px solid var(--color-border)';
        }
        livesContainerEl.appendChild(circle);
    }
}

function updateUIForNewRound() { 
    genusNameEl.textContent = currentDino.genus; 
    
    if (gameMode === 'classic') {
        roundCounterEl.textContent = translations[currentLang].roundCounterTemplate
            .replace('{current}', currentRound)
            .replace('{total}', TOTAL_ROUNDS);
        progressBar.style.width = `${((currentRound - 1) / TOTAL_ROUNDS) * 100}%`;
    } else if (gameMode === 'survival') {
        roundCounterEl.textContent = translations[currentLang].roundCounterSurvivalTemplate
            .replace('{current}', currentRound);
    }
    const scoreTemplate = translations[currentLang].scoreCounterTemplate;
    document.getElementById('score-label').textContent = scoreTemplate.split('{score}')[0];
    document.getElementById('score-value').textContent = (totalScore / 10).toFixed(1);

    feedbackPanel.classList.remove('visible');
    document.getElementById('image-feedback-container').style.display = 'none';
    document.getElementById('dino-image-wrapper').style.minHeight = '0px';
    speciesInputContainer.innerHTML = '';
    speciesInputContainer.className = '';
    
    const settings = getSettings();
    
    userPreviousGuessDisplayEl.innerHTML = '';
    gameInstructionEl.innerHTML = translations[currentLang].gameInstructionDefault;

    if (gameMode === 'blitz' && settings.multiSpeciesMode === 'nameAll' && currentDino.guessedSpecies.length > 0) {
            userPreviousGuessDisplayEl.innerHTML = `<span style="font-size: 0.9em;">${translations[currentLang].blitzAlreadyNamed} <strong>${currentDino.guessedSpecies.join(', ')}</strong></span>`;
            gameInstructionEl.innerHTML = translations[currentLang].gameInstructionNextSpecies;
    } else if (currentDino.isTypeSpeciesRound) {
        gameInstructionEl.innerHTML = translations[currentLang].gameInstructionTypeSpecies;
    } else if (settings.multiSpeciesMode === 'nameAll') {
        gameInstructionEl.textContent = translations[currentLang].gameInstructionNameAll;
    }

    if (currentDino.hint) {
        gameInstructionEl.innerHTML = `<span>${currentDino.hint}</span>`;
    }
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'species-input';
    input.placeholder = translations[currentLang].speciesInputPlaceholder;
    input.autocomplete = 'off';
    
    const numInputs = ((gameMode === 'classic' || gameMode === 'survival') && settings.multiSpeciesMode === 'nameAll') ? currentDino.allSpecies.length : 1;
    for (let i = 0; i < numInputs; i++) {
        speciesInputContainer.appendChild(input.cloneNode());
    }
    
    document.querySelectorAll('.species-input').forEach(el => el.disabled = false);
    checkButton.style.display = 'inline-block';
    checkButton.disabled = false;
    nextButton.style.display = 'none';
    nextButton.innerHTML = translations[currentLang].nextButton;
    speciesInputContainer.querySelector('input').focus();

    // ... весь код функции ...
    speciesInputContainer.querySelector('input').focus();
    updateLivesDisplay(); // <--- ДОБАВЬТЕ ЭТУ СТРОКУ
}


// === ВКЛАДКИ И ТУЛТИПЫ ===

function switchTab(activeTab) {
    if (activeTab === 'records') {
        // Управляем активным состоянием кнопок
        tabBtnRecords.style.backgroundColor = 'var(--color-primary)';
        tabBtnRecords.style.color = '#fff';
        tabBtnAchievements.style.backgroundColor = 'var(--color-button-secondary)';
        tabBtnAchievements.style.color = '#fff';

        // Показываем/скрываем контент
        tabContentRecords.style.display = 'block';
        tabContentAchievements.style.display = 'none';
    } else if (activeTab === 'achievements') {
        // Управляем активным состоянием кнопок
        tabBtnRecords.style.backgroundColor = 'var(--color-button-secondary)';
        tabBtnRecords.style.color = '#fff';
        tabBtnAchievements.style.backgroundColor = 'var(--color-primary)';
        tabBtnAchievements.style.color = '#fff';
        
        // Показываем/скрываем контент
        tabContentRecords.style.display = 'none';
        tabContentAchievements.style.display = 'block';
        renderAchievements();
    }
}

function switchSettingsTab(activeTab) {
    if (activeTab === 'settings') {
        tabBtnSettings.style.backgroundColor = 'var(--color-primary)';
        tabBtnSettings.style.color = '#fff';
        tabBtnDatabases.style.backgroundColor = 'var(--color-button-secondary)';
        tabBtnDatabases.style.color = '#fff';

        tabContentSettings.style.display = 'block';
        tabContentDatabases.style.display = 'none';
    } else if (activeTab === 'databases') {
        tabBtnSettings.style.backgroundColor = 'var(--color-button-secondary)';
        tabBtnSettings.style.color = '#fff';
        tabBtnDatabases.style.backgroundColor = 'var(--color-primary)';
        tabBtnDatabases.style.color = '#fff';
        
        tabContentSettings.style.display = 'none';
        tabContentDatabases.style.display = 'block';
        // При переключении на вкладку с базами, асинхронно их рендерим
        openDbManagement(); 
    }
}

function initializeTooltips() {
    let activeTooltipElement = null;

    // Функция для создания и показа тултипа
    const showTooltip = (iconElement) => {
        // Находим скрытый элемент с текстом внутри иконки
        const sourceTooltip = iconElement.querySelector('.tooltip-text');
        if (!sourceTooltip) return;

        // Создаем новый div для всплывающего тултипа
        activeTooltipElement = document.createElement('div');
        activeTooltipElement.className = 'tooltip-popup';
        activeTooltipElement.innerHTML = sourceTooltip.innerHTML;

        // Если у исходного тултипа был класс wide, добавляем его и к новому
        if (sourceTooltip.classList.contains('tooltip-text-wide')) {
            activeTooltipElement.classList.add('wide');
        }

        // Добавляем тултип в body, чтобы он был поверх всего
        document.body.appendChild(activeTooltipElement);

        // Позиционируем его
        positionTooltip(iconElement, activeTooltipElement);
    };

    // Функция для скрытия и удаления тултипа
    const hideTooltip = () => {
        if (activeTooltipElement) {
            activeTooltipElement.remove();
            activeTooltipElement = null;
        }
    };

    // Функция для расчета позиции
    const positionTooltip = (icon, tooltip) => {
        const iconRect = icon.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        // Позиция по умолчанию: над иконкой
        let top = iconRect.top - tooltipRect.height - 10; // 10px отступ
        let left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);

        // Коррекция, если выходит за левый/правый край окна
        if (left < 10) {
            left = 10;
        } else if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        // Коррекция, если не влезает сверху -> показываем снизу
        if (top < 10) {
            top = iconRect.bottom + 10;
            const arrow = tooltip.querySelector('::after'); // Эта логика сложнее, пока опустим
            // Для простоты стрелка останется сверху, но это можно доработать
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    };

    // Используем делегирование событий на всем документе.
    // Это будет работать для ВСЕХ иконок, даже для тех, что добавлены динамически.
    document.body.addEventListener('mouseover', (event) => {
        if (event.target.classList.contains('tooltip-icon')) {
            showTooltip(event.target);
        }
    });

    document.body.addEventListener('mouseout', (event) => {
        if (event.target.classList.contains('tooltip-icon')) {
            hideTooltip();
        }
    });
}

// --- КОНЕЦ ВСТАВКИ ---


// === ВИЗУАЛЬНЫЕ ЭФФЕКТЫ И ДИАЛОГИ ===

// === НАЧАЛО ЛОГИКИ КАСТОМНОГО ДИАЛОГА ===
function showCustomConfirm(message, onConfirm) {
    const overlay = document.getElementById('custom-confirm-overlay');
    const messageEl = document.getElementById('custom-confirm-message');
    const yesBtn = document.getElementById('custom-confirm-yes');
    const noBtn = document.getElementById('custom-confirm-no');

    messageEl.textContent = message;
    overlay.style.display = 'flex';
    // Небольшая задержка для срабатывания CSS-анимации
    setTimeout(() => overlay.classList.add('visible'), 10);

    // Временные обработчики, которые удаляются после нажатия
    const handleYes = () => {
        onConfirm();
        close();
    };

    const close = () => {
        overlay.classList.remove('visible');
        setTimeout(() => {
            overlay.style.display = 'none';
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', close);
        }, 200); // Ждем завершения анимации
    };
    
    yesBtn.addEventListener('click', handleYes, { once: true });
    noBtn.addEventListener('click', close, { once: true });
}
// === КОНЕЦ ЛОГИКИ КАСТОМНОГО ДИАЛОГА ===

function showScorePopup(score, status) {
    const scoreText = (score / 10).toFixed(1);
    if (score <= 0) return;

    // -> Запускаем звук счета здесь
    playSound(sfxScore);

    const fxContainer = document.getElementById('score-fx-container');
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${scoreText}`;
    
    switch (status) {
        case 'correct':
            popup.style.color = 'var(--color-correct)';
            break;
        case 'almost':
            popup.style.color = 'var(--color-almost)';
            break;
        case 'partially':
        case 'incorrect':
            popup.style.color = 'var(--color-incorrect)';
            break;
        default:
            popup.style.color = 'var(--color-text-light)';
            break;
    }
    
    fxContainer.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1500);
}

function animateScore(targetScore) {
    const scoreLabelEl = document.getElementById('score-label');
    const scoreValueEl = document.getElementById('score-value');
    
    // Устанавливаем текст "Счет: " если его еще нет
    const scoreText = translations[currentLang].scoreCounterTemplate.split('{score}')[0];
    if (scoreLabelEl.textContent !== scoreText) {
        scoreLabelEl.textContent = scoreText;
    }

    const startScore = parseFloat(scoreValueEl.textContent || '0') * 10;
    const duration = 300;
    let startTime = null;

    function animationStep(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        const currentAnimatedScore = startScore + (targetScore - startScore) * progress;
        scoreValueEl.textContent = (currentAnimatedScore / 10).toFixed(1);

        if (progress < 1) {
            requestAnimationFrame(animationStep);
        } else {
            scoreValueEl.textContent = (targetScore / 10).toFixed(1);
        }
    }

    requestAnimationFrame(animationStep);
}


// === ВСЯ ЛОГИКА ГАЛЕРЕИ ИЗОБРАЖЕНИЙ ===

// === НАЧАЛО НОВЫХ ФУНКЦИЙ ДЛЯ ГАЛЕРЕИ ===

function findImagePath(speciesObject) {
    const genusName = currentDino.genus;
    const speciesName = speciesObject.species;
    
    // 1. Сначала проверяем дефолтный путь, если он есть
    if (speciesObject.imagePath) {
        // В Electron пути должны быть в формате file:// для локальных файлов
        // Но для fetch-запросов и относительных путей это не нужно.
        // Мы просто вернем путь как есть, а для кастомных добавим протокол.
        return `${speciesObject.imagePath}${genusName} ${speciesName}.png`;
    }
    
    // 2. Если дефолтного пути нет, ищем в активных кастомных папках
    const activeCustomFolders = getActiveImageFolders();
    for (const folderPath of activeCustomFolders) {
        // Для Electron нужен протокол file:// и замена обратных слэшей на прямые
        const normalizedPath = folderPath.replace(/\\/g, '/');
        return `file://${normalizedPath}/${genusName} ${speciesName}.png`;
    }

    // 3. Если ничего не найдено
    return null;
}

function showImage(index) {
    if (!imageSliderState.speciesList[index]) return;

    const speciesName = imageSliderState.speciesList[index];
    const genusName = currentDino.genus;
    const fullSpeciesName = `${genusName} ${speciesName}`;
    const fullFileName = `${fullSpeciesName}.png`;

    imageSliderState.currentIndex = index;
    
    const showImageError = () => {
        imageSliderState.imageEl.style.display = 'none';
        const lang = getSettings().language;
        const errorText = (translations[lang].imageNotFound || 'Изображение для {name} не найдено').replace('{name}', fullSpeciesName);
        imageSliderState.captionEl.textContent = errorText;
    };

    // --- ИЗМЕНЕННАЯ ЛОГИКА ЗАГРУЗКИ ---
    // Теперь принимаем массив объектов { url, isCustom }
    const tryLoadNext = (sources) => {
        if (sources.length === 0) {
            showImageError();
            return;
        }
        
        const currentSource = sources.shift(); // Берем первый источник из очереди

        imageSliderState.imageEl.src = currentSource.url;
        
        // Очищаем старые обработчики перед назначением новых (на всякий случай)
        imageSliderState.imageEl.onload = null;
        imageSliderState.imageEl.onerror = null;

        imageSliderState.imageEl.onload = () => {
            imageSliderState.imageEl.style.display = 'block';
            imageSliderState.captionEl.textContent = fullSpeciesName;

            // --- ГЛАВНОЕ ИСПРАВЛЕНИЕ ---
            // Теперь мы проверяем явный флаг, который сами же и поставили
            if (currentSource.isCustom) {
                customImageWasShown = true;
            }
            // -----------------------------
        };

        imageSliderState.imageEl.onerror = () => {
            // Если не загрузилось, пробуем следующий вариант
            tryLoadNext(sources);
        };
    };
    
    // --- Собираем ВСЕ возможные пути с МЕТКАМИ ---
    const imageSourcesToTry = [];

    // 1. Добавляем пути из ВСЕХ ВСТРОЕННЫХ баз (isCustom: false)
    for (const dbKey in DEFAULT_DATABASES) {
        const dbInfo = DEFAULT_DATABASES[dbKey];
        if (dbInfo.imagePath) {
            imageSourcesToTry.push({
                url: `${dbInfo.imagePath}${fullFileName}`,
                isCustom: false // Это дефолтная картинка
            });
        }
    }

    // 2. Добавляем пути из АКТИВНЫХ ПОЛЬЗОВАТЕЛЬСКИХ папок (isCustom: true)
    const allCustomFolders = getCustomImageFolders();
    const activeCustomFolders = getActiveImageFolders()
        .slice()
        .sort((a,b) => {
            const indexA = allCustomFolders.findIndex(f => f.path === a);
            const indexB = allCustomFolders.findIndex(f => f.path === b);
            return indexA - indexB;
        });

    activeCustomFolders.forEach(folderPath => {
        const normalizedPath = folderPath.replace(/\\/g, '/');
        imageSourcesToTry.push({
            url: `file://${normalizedPath}/${fullFileName}`,
            isCustom: true // Это пользовательская картинка!
        });
    });

    // Запускаем перебор источников
    tryLoadNext(imageSourcesToTry);
}

function nextImage() {
    let newIndex = imageSliderState.currentIndex + 1;
    if (newIndex >= imageSliderState.speciesList.length) {
        newIndex = 0; // Возвращаемся к началу
    }
    showImage(newIndex);
}

function prevImage() {
    let newIndex = imageSliderState.currentIndex - 1;
    if (newIndex < 0) {
        newIndex = imageSliderState.speciesList.length - 1; // Переходим в конец
    }
    showImage(newIndex);
}

async function preloadImagesAndFindMaxHeight(speciesList, genus) {
    // Вспомогательная функция для попытки загрузки картинки
    const tryLoad = (path) => new Promise(resolve => {
        if (!path) { resolve(null); return; }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = path;
    });

    let maxHeight = 0;
    
    // --- НАЧАЛО ИСПРАВЛЕНИЙ ---
    // Получаем реальную ширину, которую займет изображение, более надежным способом.
    // Элемент #game-container видим в момент вызова, поэтому мы можем измерить его.
    const imageHostContainer = document.getElementById('game-container');
    const containerStyle = window.getComputedStyle(imageHostContainer);
    const paddingLeft = parseFloat(containerStyle.paddingLeft);
    const paddingRight = parseFloat(containerStyle.paddingRight);
    // Это и будет ширина нашего изображения, т.к. у него width: 100%
    const imageRenderWidth = imageHostContainer.clientWidth - paddingLeft - paddingRight;
    // --- КОНЕЦ ИСПРАВЛЕНИЙ ---

    // 1. Получаем отсортированный список активных пользовательских папок
    const allCustomFolders = getCustomImageFolders();
    const activeCustomFolders = getActiveImageFolders()
        .slice() 
        .sort((a,b) => {
            const indexA = allCustomFolders.findIndex(f => f.path === a);
            const indexB = allCustomFolders.findIndex(f => f.path === b);
            return indexA - indexB;
        });

    // 2. Проходим по каждому виду, который нужно показать
    for (const speciesName of speciesList) {
        let loadedImage = null;
        const fullSpeciesName = `${genus} ${speciesName}.png`;

        // 3. СНАЧАЛА ищем во всех ВСТРОЕННЫХ папках
        for (const dbKey in DEFAULT_DATABASES) {
            const dbInfo = DEFAULT_DATABASES[dbKey];
            if (dbInfo.imagePath) {
                const defaultPath = `${dbInfo.imagePath}${fullSpeciesName}`;
                loadedImage = await tryLoad(defaultPath);
                if (loadedImage) break; // Нашли, выходим из цикла
            }
        }

        // 4. ЕСЛИ НЕ НАШЛИ, ищем во всех ПОЛЬЗОВАТЕЛЬСКИХ папках по порядку
        if (!loadedImage) {
            for (const folderPath of activeCustomFolders) {
                const normalizedPath = folderPath.replace(/\\/g, '/');
                const customPath = `file://${normalizedPath}/${fullSpeciesName}`;
                loadedImage = await tryLoad(customPath);
                if (loadedImage) break; // Нашли, выходим из цикла
            }
        }

        // 5. Если картинка была найдена где-либо, считаем ее высоту
        if (loadedImage) {
            // --- НАЧАЛО ИСПРАВЛЕНИЙ ---
            // Используем новую, точно рассчитанную ширину
            let scaledHeight = (loadedImage.naturalHeight / loadedImage.naturalWidth) * imageRenderWidth;
            // --- КОНЕЦ ИСПРАВЛЕНИЙ ---
            scaledHeight = Math.min(scaledHeight, MAX_IMAGE_HEIGHT_PX);
            if (scaledHeight > maxHeight) {
                maxHeight = scaledHeight;
            }
        }
    }
    return maxHeight;
}

// === НАЧАЛО ОБНОВЛЕННОЙ ФУНКЦИИ ===
async function setupImageFeedback(resultStatus, answers) {
    const settings = getSettings();
    // Показываем картинки только в режиме "Классика" И если настройка включена
    const showImagesForClassic = gameMode === 'classic' && settings.showImages;
    const showImagesForSurvival = gameMode === 'survival' && settings.showImages;

    if (!showImagesForClassic && !showImagesForSurvival) {
        return;
    }

    let speciesToShow = [];
    let isCarousel = false;
    let initialIndex = 0;

    // Определяем, какие виды показывать в зависимости от подрежима
    switch (settings.multiSpeciesMode) {
        case 'guessOne':
            speciesToShow = [currentDino.targetSpecies];
            break;
        case 'nameAll':
            speciesToShow = currentDino.allSpecies.map(s => s.species);
            break;
        case 'acceptAny':
            speciesToShow = currentDino.allSpecies.map(s => s.species);
            const userAnswerWasAccepted = answers[0] && answers[0].isAccepted;
            if (userAnswerWasAccepted) {
                const matchedSpecies = answers[0].matched;
                const foundIndex = speciesToShow.findIndex(s => s.toLowerCase() === matchedSpecies.toLowerCase());
                if (foundIndex !== -1) initialIndex = foundIndex;
            }
            break;
    }

    if (speciesToShow.length === 0) return;
    isCarousel = speciesToShow.length > 1;

    // --- НОВАЯ ЛОГИКА ---
    // 1. Находим максимальную высоту среди всех картинок в сете
    const maxHeight = await preloadImagesAndFindMaxHeight(speciesToShow, currentDino.genus);

    // 2. Устанавливаем эту высоту контейнеру ДО его показа
    if (maxHeight > 0) {
        document.getElementById('dino-image-wrapper').style.minHeight = `${maxHeight}px`;
    }
    // --- КОНЕЦ НОВОЙ ЛОГИКИ ---

    // Обновляем состояние слайдера
    imageSliderState = {
        speciesList: speciesToShow,
        currentIndex: initialIndex,
        container: document.getElementById('image-feedback-container'),
        imageEl: document.getElementById('dino-image'),
        captionEl: document.getElementById('dino-image-caption'),
        prevBtn: document.getElementById('prev-image-btn'),
        nextBtn: document.getElementById('next-image-btn')
    };

    // Этот код ДОБАВИТЬ
    document.getElementById('prev-image-btn').style.display = isCarousel ? 'block' : 'none';
    document.getElementById('next-image-btn').style.display = isCarousel ? 'block' : 'none';

    // Показываем контейнер и первую картинку
    imageSliderState.container.style.display = 'block';
    showImage(initialIndex);
}
// === КОНЕЦ ОБНОВЛЕННОЙ ФУНКЦИИ ===

function handleDbListClick(e) {
    const target = e.target;
    // ПРАВИЛЬНАЯ ВЕРСИЯ
    if (target.classList.contains('delete-db-btn')) {
        const filePath = target.dataset.filename; // Теперь это полный путь
        // Извлекаем только имя файла для красивого сообщения
        const posixPath = filePath.replace(/\\/g, '/');
        const fileName = posixPath.substring(posixPath.lastIndexOf('/') + 1);

        const message = translations[currentLang].confirm_deleteDb.replace('{fileName}', fileName);

        // Вызываем наш безопасный диалог
        showCustomConfirm(message, () => {
            // Этот код выполнится ТОЛЬКО если пользователь нажал "Да"
            const dbs = getStoredDbs();
            delete dbs[filePath]; // Удаляем по полному пути
            saveStoredDbs(dbs);

            const activeDbNames = getActiveDbNames().filter(name => name !== filePath);
            saveActiveDbNames(activeDbNames);

            const dbOrder = getDbOrder().filter(name => name !== filePath);
            saveDbOrder(dbOrder);

            renderDbList();
            updateStartButtonState();
        });
    } else if (target.classList.contains('db-select-checkbox')) {
        const filename = target.dataset.filename;
        let activeDbNames = getActiveDbNames();
        if (target.checked) {
            if (!activeDbNames.includes(filename)) activeDbNames.push(filename);
        } else {
            activeDbNames = activeDbNames.filter(name => name !== filename);
        }
        saveActiveDbNames(activeDbNames);
        updateStartButtonState();
    }
}

// Кастомное окно предупреждения (аналог alert)
function showCustomAlert(message, onClose) {
    const overlay = document.getElementById('custom-confirm-overlay');
    const messageEl = document.getElementById('custom-confirm-message');
    const yesBtn = document.getElementById('custom-confirm-yes');
    const noBtn = document.getElementById('custom-confirm-no');

    messageEl.textContent = message;
    
    noBtn.style.display = 'none'; // Прячем кнопку "Нет"
    yesBtn.textContent = 'OK';

    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('visible'), 10);

    yesBtn.onclick = () => {
        overlay.classList.remove('visible');
        setTimeout(() => {
            overlay.style.display = 'none';
            noBtn.style.display = 'inline-block';
            yesBtn.textContent = translations[currentLang].confirmYes;
            if (onClose) onClose();
        }, 200);
    };
}