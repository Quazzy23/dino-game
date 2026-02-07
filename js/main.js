// Новый обработчик для кнопки "Добавить новую"
document.getElementById('add-db-button').addEventListener('click', async () => {
    const filesData = await window.electronAPI.openFileAndRead();
    if (!filesData || filesData.length === 0) {
        return; // Пользователь ничего не выбрал или отменил
    }

    const dbs = getStoredDbs();
    const activeDbNames = getActiveDbNames();
    const dbOrder = getDbOrder();
    // --- НАЧАЛО ДОБАВЛЕНИЯ ---
    const storedDifficulties = JSON.parse(localStorage.getItem(DB_DIFFICULTY_KEY)) || {};
    let difficultiesChanged = false;
    // --- КОНЕЦ ДОБАВЛЕНИЯ ---
    let filesAdded = 0;

    for (const file of filesData) {
        // Ключом для хранения теперь будет ПОЛНЫЙ ПУТЬ, чтобы обеспечить уникальность
        const fileKey = file.path; 

        if (Object.keys(parseDatabase(file.content)).length > 0) {
            if (!dbs[fileKey]) {
                dbOrder.push(fileKey);
            }
            dbs[fileKey] = file.content; // Сохраняем контент по уникальному ключу
            if (!activeDbNames.includes(fileKey)) {
                activeDbNames.push(fileKey);
            }
            filesAdded++;
            // --- НАЧАЛО ДОБАВЛЕНИЯ: ЛОГИКА СЛОЖНОСТИ ПО УМОЛЧАНИЮ ---
            const hasDifficultyLevels = analyzeDatabaseDifficulty(file.content) !== null;
            // Если у базы есть уровни И для нее еще не установлена сложность
            if (hasDifficultyLevels && !storedDifficulties[fileKey]) {
                storedDifficulties[fileKey] = '1'; // Устанавливаем сложность 1
                difficultiesChanged = true;
            }
            // --- КОНЕЦ ДОБАВЛЕНИЯ ---
        } else {
            alert(translations[currentLang].alert_fileFormatError.replace('{fileName}', file.name));
        }
    }
    
    if (filesAdded > 0) {
        saveStoredDbs(dbs);
        saveActiveDbNames(activeDbNames);
        saveDbOrder(dbOrder);
        // --- НАЧАЛО ДОБАВЛЕНИЯ ---
        if (difficultiesChanged) {
            localStorage.setItem(DB_DIFFICULTY_KEY, JSON.stringify(storedDifficulties));
        }
        // --- КОНЕЦ ДОБАВЛЕНИЯ ---
        await renderDbList(); // Обновляем список на экране
        updateStartButtonState();
    }
});

defaultDbListEl.addEventListener('click', handleDbListClick);
customDbListEl.addEventListener('click', handleDbListClick);

gameModeSelect.addEventListener('change', (e) => {
    const settings = getSettings();
    settings.gameMode = e.target.value;
    saveSettings(settings);
    toggleGameModeSettings(e.target.value);
    toggleNameAllScoringSettingVisibility();
});

blitzDurationSelect.addEventListener('change', () => {
    const settings = getSettings();
    settings.blitzDuration = blitzDurationSelect.value;
    saveSettings(settings);
});

timerSwitch.addEventListener('change', () => {
    const settings = getSettings();
    settings.timerEnabled = timerSwitch.checked;
    saveSettings(settings);
});

roundsSelect.addEventListener('change', () => {
    const settings = getSettings();
    settings.rounds = roundsSelect.value;
    saveSettings(settings);
});

languageSelect.addEventListener('change', () => {
    const settings = getSettings();
    settings.language = languageSelect.value;
    saveSettings(settings);
    applyLanguage(settings.language);
});

multiSpeciesModeSelect.addEventListener('change', () => {
    const settings = getSettings();
    settings.multiSpeciesMode = multiSpeciesModeSelect.value;
    saveSettings(settings);
    toggleNameAllScoringSettingVisibility();
});

// ВСТАВЬТЕ НОВЫЙ ОБРАБОТЧИК:
document.getElementById('name-all-scoring-mode').addEventListener('change', (e) => {
    const settings = getSettings();
    settings.nameAllScoring = e.target.value;
    saveSettings(settings);
});

themeSwitch.addEventListener('change', () => {
    const settings = getSettings();
    settings.theme = themeSwitch.checked ? 'dark' : 'light';
    saveSettings(settings);
    applyTheme(settings.theme);
});

// ДОБАВЬТЕ ЭТИ ОБРАБОТЧИКИ
document.getElementById('survival-lives-select').addEventListener('change', (e) => {
    const settings = getSettings();
    settings.survivalLives = e.target.value;
    saveSettings(settings);
});

document.getElementById('survival-bonus-switch').addEventListener('change', (e) => {
    const settings = getSettings();
    settings.survivalBonus = e.target.checked;
    saveSettings(settings);
});

livesContainerEl.addEventListener('animationend', () => {
    livesContainerEl.classList.remove('animate-almost', 'animate-incorrect', 'animate-bonus');
});


document.addEventListener('DOMContentLoaded', async () => {

    // Загружаем прогресс из файла
    await initializeProgress();
    
    // Код, который НЕ зависит от асинхронных операций, остается здесь
    document.getElementById('image-gallery-wrapper').style.maxWidth = `${MAX_IMAGE_WIDTH_PX}px`;
    
    // Применяем настройки из localStorage
    const settings = getSettings();
    const sfxVolumeSlider = document.getElementById('sfx-volume-slider');
    const musicVolumeSlider = document.getElementById('music-volume-slider');

    applySfxVolume(settings.sfxVolume);
    sfxVolumeSlider.value = settings.sfxVolume * 100;
    sfxVolumeSlider.addEventListener('input', (e) => {
        const newVolume = e.target.value / 100;
        applySfxVolume(newVolume);
        const currentSettings = getSettings();
        currentSettings.sfxVolume = newVolume;
        saveSettings(currentSettings);
        // --- ДОБАВЬ ЭТУ СТРОЧКУ ---
        document.getElementById('easter-egg-video').volume = newVolume;
    });

    applyMusicVolume(settings.musicVolume);
    musicVolumeSlider.value = settings.musicVolume * 100;
    musicVolumeSlider.addEventListener('input', (e) => {
        const newVolume = e.target.value / 100;
        applyMusicVolume(newVolume);
        const currentSettings = getSettings();
        currentSettings.musicVolume = newVolume;
        saveSettings(currentSettings);
    });

    languageSelect.value = settings.language;
    applyLanguage(settings.language);
    
    gameModeSelect.value = settings.gameMode;
    roundsSelect.value = settings.rounds;
    blitzDurationSelect.value = settings.blitzDuration;
    multiSpeciesModeSelect.value = settings.multiSpeciesMode;
    document.getElementById('name-all-scoring-mode').value = settings.nameAllScoring;
    timerSwitch.checked = settings.timerEnabled;
    document.getElementById('image-toggle-classic').checked = settings.showImages;
    document.getElementById('image-toggle-survival').checked = settings.showImages;
    document.getElementById('survival-lives-select').value = settings.survivalLives;
    document.getElementById('survival-bonus-switch').checked = settings.survivalBonus;
    toggleGameModeSettings(settings.gameMode);
    toggleNameAllScoringSettingVisibility();
    
    const savedMusicTime = parseFloat(sessionStorage.getItem('menuMusicTime')) || 0;
    if (savedMusicTime > 0) sessionStorage.removeItem('menuMusicTime');
    playMenuMusic(savedMusicTime);

    // Асинхронные операции рендеринга вызываем в конце
    await renderDbList();
    updateStartButtonState();
    initializeTooltips();
    // --- НАЧАЛО НОВОГО, ПРАВИЛЬНОГО БЛОКА ТАЙМЕРА ---
    
    // 1. Запоминаем время загрузки приложения в глобальную переменную
    const appLoadTime = Date.now();

    // 2. Периодическое сохранение-БЭКАП (каждые 15 секунд)
    setInterval(() => {
        // Создаем временную копию объекта для безопасного сохранения в фоне
        const progressToSave = { ...gameProgress };
        const sessionDurationSeconds = Math.round((Date.now() - appLoadTime) / 1000);
        progressToSave.totalPlaytimeSeconds = (gameProgress.totalPlaytimeSeconds || 0) + sessionDurationSeconds;
        
        // Сохраняем АСИНХРОННО, чтобы не мешать игре
        window.electronAPI.saveUserData(JSON.stringify(progressToSave, null, 2));
    }, 10000); // 10000 миллисекунд = 10 секунд

    // 3. Точное и ГАРАНТИРОВАННОЕ сохранение при выходе
    window.addEventListener('beforeunload', () => {
        const sessionDurationSeconds = Math.round((Date.now() - appLoadTime) / 1000);
        gameProgress.totalPlaytimeSeconds = (gameProgress.totalPlaytimeSeconds || 0) + sessionDurationSeconds;
        
        // Сохраняем СИНХРОННО, чтобы гарантировать запись перед закрытием
        window.electronAPI.saveUserDataSync(JSON.stringify(gameProgress, null, 2));
    });

    // --- КОНЕЦ НОВОГО БЛОКА ---

    // Логика полноэкранного режима
    const fullscreenSwitch = document.getElementById('fullscreen-switch');

    // Применяем режим из настроек при запуске
    if (settings.fullscreenEnabled) {
        window.electronAPI.setFullScreen(true);
    }

    fullscreenSwitch.addEventListener('change', () => {
        const isEnabled = fullscreenSwitch.checked;
        window.electronAPI.setFullScreen(isEnabled);
        
        // Получаем свежайшие данные из памяти
        const currentSettings = getSettings();
        currentSettings.fullscreenEnabled = isEnabled;
        saveSettings(currentSettings);
    });

    window.electronAPI.onFullScreenChange((isFullScreen) => {
        fullscreenSwitch.checked = isFullScreen;
        // Всегда получаем свежий объект настроек перед сохранением
        const currentSettings = getSettings();
        currentSettings.fullscreenEnabled = isFullScreen;
        saveSettings(currentSettings);
    });

    // ЛОГИКА ОБНОВЛЕНИЙ (Версия берется автоматически из package.json)
    if (window.electronAPI.getAppVersion && window.electronAPI.checkUpdate) {

        window.electronAPI.getAppVersion().then(currentVersion => {
            console.log("Текущая версия приложения:", currentVersion); // ЛОГ 2

            window.electronAPI.checkUpdate().then(data => {
                if (!data) {
                    console.log("Обновлений не найдено (или файл latest.json недоступен)."); // ЛОГ 3
                    return;
                }

                console.log("Версия на сервере:", data.version); // ЛОГ 4

                if (data.version !== currentVersion) {
                    console.log("Доступна новая версия.");
                    
                    showCustomConfirm(updateText, () => {
                        // Логика при нажатии игроком "ОК"
                        const messageEl = document.getElementById('custom-confirm-message');
                        const buttonGroup = document.querySelector('#custom-confirm-box .button-group');
                        
                        // Скрываем кнопки выбора
                        if (buttonGroup) buttonGroup.style.display = 'none';
                        
                        // Визуализируем прогресс-бар в окне уведомления
                        messageEl.innerHTML = `
                            <div class="progress-bar-container" style="display: block; margin-top: 20px;">
                                <div id="update-progress-fill" style="width: 0%; height: 100%; background-color: var(--color-correct); transition: width 0.2s;"></div>
                            </div>
                            <p style="font-size: 0.8em; margin-top: 10px; color: var(--color-text-light); text-align: center;">
                                ${currentLang === 'ru' ? 'Загрузка... Игра закроется автоматически' : 'Downloading... The game will close automatically'}
                            </p>
                        `;

                        // Запускаем процесс скачивания через основной процесс Electron
                        window.electronAPI.sendStartDownload(data.url);

                        // Подписываемся на событие прогресса загрузки
                        window.electronAPI.onDownloadProgress((percent) => {
                            const fill = document.getElementById('update-progress-fill');
                            if (fill) {
                                fill.style.width = percent + '%';
                            }
                        });
                    });
                } else {
                    console.log("Установлена актуальная версия.");
                }
            });
        }).catch(err => console.error("Update system error:", err));
    }
});

startButton.addEventListener('click', startGame); 
restartButton.addEventListener('click', () => {
    // Отключаем кнопку сразу после нажатия, чтобы избежать повторных кликов
    restartButton.disabled = true; 
    
    stopAllMusic();
    startGame().then(() => {
        // Включаем кнопку обратно, когда игра полностью загрузилась
        restartButton.disabled = false;
    }).catch(() => {
        // Если была ошибка, тоже включаем кнопку
        restartButton.disabled = false;
    });
});
checkButton.addEventListener('click', checkAnswer); 
nextButton.addEventListener('click', () => {
    // Проигрываем звук только в нужных режимах
    if (gameMode === 'classic' || gameMode === 'survival') {
        playSound(sfxNext);
    }
    loadNewRound();
});
settingsButton.addEventListener('click', () => {
    showScreen(settingsScreen);
    switchSettingsTab('settings');
});
backToMenuButton.addEventListener('click', returnToMainMenu);
backToMenuFromSettings.addEventListener('click', closeSettings);
exitToMenuGameButton.addEventListener('click', exitGameInProgress);
endGameEarlyButton.addEventListener('click', () => {
    showCustomConfirm(
        translations[currentLang].confirm_endGameEarly,
        () => {
            if (gameMode === 'classic') {
                endClassicGame();
            } else if (gameMode === 'survival') {
                endSurvivalGame();
            } else { // Этот блок теперь только для Блица
                endBlitzGame('endedEarly'); // <-- ИСПРАВЛЕНО
            }
        }
    );
});

// ВСТАВЬТЕ ЭТОТ НОВЫЙ ОБРАБОТЧИК НА МЕСТО СТАРОГО
document.getElementById('reset-settings-button').addEventListener('click', () => {
    const message = translations[currentLang].confirm_resetSettings;

    showCustomConfirm(message, () => {
        // 1. Удаляем сохраненные настройки из localStorage
        localStorage.removeItem(SETTINGS_KEY);

        // Удаляем данные о базах данных и изображениях
        localStorage.removeItem(DB_STORAGE_KEY);
        localStorage.removeItem(ACTIVE_DBS_KEY);
        localStorage.removeItem(DB_ORDER_KEY);
        localStorage.removeItem(DB_DIFFICULTY_KEY);
        localStorage.removeItem(CUSTOM_IMAGES_KEY);
        localStorage.removeItem(ACTIVE_IMAGES_KEY);

        // 2. Получаем дефолтные настройки
        const settings = getSettings(); // Эта функция вернет DEFAULT_SETTINGS

        // 3. Применяем все настройки динамически, без перезагрузки
        
        // --- Применяем визуальные и языковые настройки ---
        applyLanguage(settings.language); // Это также вызовет applyTheme
        languageSelect.value = settings.language;
        
        // --- Применяем настройки звука ---
        applySfxVolume(settings.sfxVolume);
        document.getElementById('sfx-volume-slider').value = settings.sfxVolume * 100;
        
        applyMusicVolume(settings.musicVolume);
        document.getElementById('music-volume-slider').value = settings.musicVolume * 100;

        // --- Сбрасываем все селекторы и переключатели на экране настроек ---
        gameModeSelect.value = settings.gameMode;
        roundsSelect.value = settings.rounds;
        blitzDurationSelect.value = settings.blitzDuration;
        multiSpeciesModeSelect.value = settings.multiSpeciesMode;
        document.getElementById('name-all-scoring-mode').value = settings.nameAllScoring;
        timerSwitch.checked = settings.timerEnabled;
        document.getElementById('image-toggle-classic').checked = settings.showImages;
        document.getElementById('image-toggle-survival').checked = settings.showImages;
        document.getElementById('survival-lives-select').value = settings.survivalLives;
        document.getElementById('survival-bonus-switch').checked = settings.survivalBonus;
        document.getElementById('fullscreen-switch').checked = settings.fullscreenEnabled;
        
        // --- Обновляем видимость блоков настроек в соответствии со сброшенным режимом ---
        toggleGameModeSettings(settings.gameMode);
        toggleNameAllScoringSettingVisibility();

        // Обновляем списки баз и картинок на экране
        renderDbList();
        renderCustomImageFolders();
        updateStartButtonState();
        
        // Музыка при этом продолжает играть без прерывания!
    });
});

document.addEventListener('keyup', (event) => { 
    if (event.key !== 'Enter' || gameIsOver) return;

    if (gameContainer.style.display !== 'none') {
        // Если кнопка "Далее" не видна, значит, мы ждем ответа
        if (nextButton.style.display === 'none') {
            checkAnswer(); // Вызываем проверку напрямую
        } 
        // Иначе, если кнопка "Далее" видна, эмулируем клик по ней
        else {
            nextButton.click();
        }
    }
});
speciesInputContainer.addEventListener('animationend', (e) => {
    e.target.classList.remove('shake-input', 'flash-correct', 'flash-almost', 'flash-incorrect');
});

document.getElementById('back-to-menu-from-records').addEventListener('click', returnToMainMenu);

speciesInputContainer.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;   
    const inputs = Array.from(speciesInputContainer.querySelectorAll('.species-input'));
    if (inputs.length <= 1) return;
    const currentIndex = inputs.findIndex(input => input === document.activeElement);
    if (currentIndex === -1) return;
    e.preventDefault();
    let nextIndex;
    if (e.key === 'ArrowDown') {
        nextIndex = currentIndex + 1;
    } else { // ArrowUp
        nextIndex = currentIndex - 1;
    }
    if (inputs[nextIndex]) {
        inputs[nextIndex].focus();
    }
});

customDbListEl.addEventListener('dragstart', e => {
    if (e.target.tagName === 'LI') {
        e.target.classList.add('dragging');
    }
});

customDbListEl.addEventListener('dragend', e => {
    if (e.target.tagName === 'LI') {
        e.target.classList.remove('dragging');
        const newOrder = [...customDbListEl.querySelectorAll('li')].map(li => li.dataset.filename);
        saveDbOrder(newOrder);
    }
});

customDbListEl.addEventListener('dragover', e => {
    e.preventDefault();
    const draggingElement = customDbListEl.querySelector('.dragging');
    if (!draggingElement) return;

    const afterElement = getDragAfterElement(customDbListEl, e.clientY);
    if (afterElement == null) {
        customDbListEl.appendChild(draggingElement);
    } else {
        customDbListEl.insertBefore(draggingElement, afterElement);
    }
});

// Функция для синхронного переключения двух слайдеров изображений
const syncImageSwitches = (e) => {
    const isEnabled = e.target.checked;
    // 1. Переключаем оба визуально
    document.getElementById('image-toggle-classic').checked = isEnabled;
    document.getElementById('image-toggle-survival').checked = isEnabled;
    
    // 2. Сохраняем в память
    const currentSettings = getSettings();
    currentSettings.showImages = isEnabled;
    saveSettings(currentSettings);
};

// Вешаем обработчик на оба
document.getElementById('image-toggle-classic').addEventListener('change', syncImageSwitches);
document.getElementById('image-toggle-survival').addEventListener('change', syncImageSwitches);

// Добавляем обработчики для кнопок галереи
document.getElementById('next-image-btn').addEventListener('click', nextImage);
document.getElementById('prev-image-btn').addEventListener('click', prevImage);

// Добавляем обработчик для управления галереей с клавиатуры
document.addEventListener('keydown', (event) => {
    // Проверяем, видна ли галерея
    const isGalleryVisible = document.getElementById('image-feedback-container').style.display === 'block';
    if (!isGalleryVisible) return;

    // Проверяем, есть ли что переключать (активны ли стрелки)
    const canSwitch = document.getElementById('next-image-btn').style.display === 'block';
    if (!canSwitch) return;

    if (event.key === 'ArrowRight') {
        event.preventDefault(); // Предотвращаем прокрутку страницы
        nextImage();
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault(); // Предотвращаем прокрутку страницы
        prevImage();
    }
});

// --- НАЧАЛО ДОБАВЛЕНИЯ НОВЫХ ОБРАБОТЧИКОВ ---
document.getElementById('add-images-button').addEventListener('click', async () => {
    const folderData = await window.electronAPI.openFolderDialog();
    if (folderData) {
        const folders = getCustomImageFolders();
        // Проверяем, не добавлена ли уже такая папка
        if (!folders.some(f => f.path === folderData.path)) {
            folders.push(folderData);
            saveCustomImageFolders(folders);

            // Автоматически активируем новую папку
            const activeFolders = getActiveImageFolders();
            if (!activeFolders.includes(folderData.path)) {
                activeFolders.push(folderData.path);
                saveActiveImageFolders(activeFolders);
            }
            renderCustomImageFolders();
            updateStartButtonState();
        }
    }
});

document.getElementById('custom-images-list').addEventListener('click', (e) => {
    const target = e.target;
    
    if (target.classList.contains('delete-image-folder-btn')) {
        const path = target.dataset.path;
        const folder = getCustomImageFolders().find(f => f.path === path);
        const folderName = folder ? folder.name : path;

        // Формируем сообщение и вызываем наше кастомное подтверждение
        const message = (translations[getSettings().language].confirm_deleteImageFolder || 'Вы уверены, что хотите удалить папку "{folderName}"?').replace('{folderName}', folderName);

        showCustomConfirm(message, () => {
            // Этот код выполнится только после нажатия "Да"
            let folders = getCustomImageFolders();
            folders = folders.filter(f => f.path !== path);
            saveCustomImageFolders(folders);

            let activeFolders = getActiveImageFolders();
            activeFolders = activeFolders.filter(p => p !== path);
            saveActiveImageFolders(activeFolders);

            renderCustomImageFolders();
        });
    }

    if (target.classList.contains('image-folder-checkbox')) {
        const path = target.dataset.path;
        let activeFolders = getActiveImageFolders();
        if (target.checked) {
            if (!activeFolders.includes(path)) activeFolders.push(path);
        } else {
            activeFolders = activeFolders.filter(p => p !== path);
        }
        saveActiveImageFolders(activeFolders);
    }
});

// --- НАЧАЛО ДОБАВЛЕНИЯ ОБРАБОТЧИКОВ ДЛЯ СОРТИРОВКИ КАРТИНОК ---

customImagesListEl.addEventListener('dragstart', e => {
    if (e.target.tagName === 'LI') {
        e.target.classList.add('dragging');
    }
});

customImagesListEl.addEventListener('dragend', e => {
    if (e.target.tagName === 'LI') {
        e.target.classList.remove('dragging');
        // Собираем новый порядок путей из data-атрибутов
        const newOrderPaths = [...customImagesListEl.querySelectorAll('li')].map(li => li.querySelector('[data-path]').dataset.path);
        let folders = getCustomImageFolders();
        // Сортируем оригинальный массив объектов в соответствии с новым порядком путей
        folders.sort((a, b) => newOrderPaths.indexOf(a.path) - newOrderPaths.indexOf(b.path));
        saveCustomImageFolders(folders);
    }
});

customImagesListEl.addEventListener('dragover', e => {
    e.preventDefault();
    const draggingElement = customImagesListEl.querySelector('.dragging');
    if (!draggingElement) return;

    const afterElement = getDragAfterElement(customImagesListEl, e.clientY);
    if (afterElement == null) {
        customImagesListEl.appendChild(draggingElement);
    } else {
        customImagesListEl.insertBefore(draggingElement, afterElement);
    }
});
// --- КОНЕЦ ДОБАВЛЕНИЯ ОБРАБОТЧИКОВ ---

// --- КОНЕЦ ДОБАВЛЕНИЯ ---

// Этот код сработает, когда видео доиграет до конца
easterEggVideo.addEventListener('ended', () => {
    // Прячем видео и открываем НАСТРОЙКИ, как и планировалось
    showScreen(settingsScreen);
    playMenuMusic();
});

// Этот код сработает при нажатии на кнопку "В главное меню" под видео
backFromEasterEggBtn.addEventListener('click', () => {
    stopAllMusic();
    // Останавливаем видео, чтобы оно не продолжало играть в фоне
    easterEggVideo.pause();
    // Возвращаемся в ГЛАВНОЕ МЕНЮ
    returnToMainMenu();
});


tabBtnRecords.addEventListener('click', () => switchTab('records'));
tabBtnAchievements.addEventListener('click', () => switchTab('achievements'));

// Переопределяем старый обработчик, чтобы он открывал нужную вкладку по умолчанию
document.getElementById('records-button').addEventListener('click', () => {
    openRecordsScreen(); // Эта функция вызывает renderRecords
    switchTab('records'); // Делаем вкладку "Рекорды" активной по умолчанию
});
// --- КОНЕЦ ВСТАВКИ ---

// --- НАЧАЛО ВСТАВКИ: ФИНАЛЬНАЯ УНИВЕРСАЛЬНАЯ ЛОГИКА ТУЛТИПОВ ---

tabBtnSettings.addEventListener('click', () => switchSettingsTab('settings'));
tabBtnDatabases.addEventListener('click', () => switchSettingsTab('databases'));

// --- КОНЕЦ ВСТАВКИ ---

// Открытие окна "О проекте"
aboutButton.addEventListener('click', () => {
    showScreen(aboutScreen);
    
    const taskArea = document.getElementById('iczn-task-area');
    const input = document.getElementById('iczn-mini-input');
    
    if (!taskArea || !input) return;

    // Проверяем: если ачивка уже есть, сразу показываем расшифровку
    const unlocked = getUnlockedAchievements();
    if (unlocked.includes('meta_iczn_scholar')) {
        taskArea.innerHTML = "ICZN — International Code of Zoological Nomenclature";
        return;
    }

    // Слушаем ввод
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = input.value.trim().toLowerCase();
            if (val === 'fuck you' || val === 'иди нахуй' || val === 'пошел нахуй') {
                unlockAchievement('meta_rude_player');
            }
            const variant1 = "international code of zoological nomenclature";
            const variant2 = "international commission on zoological nomenclature";

            if (val === variant1 || val === variant2) {
                // ПОБЕДА
                unlockAchievement('meta_iczn_scholar');
                // Плавно меняем текст
                taskArea.style.opacity = '0';
                setTimeout(() => {
                    taskArea.innerHTML = "ICZN — International Code of Zoological Nomenclature";
                    taskArea.style.opacity = '1';
                }, 500);
            } else {
                // ОШИБКА
                playSound(sfxShake);
                input.classList.add('shake-input');
                setTimeout(() => {
                    input.classList.remove('shake-input');
                }, 500);
            }
        }
    });
});

// Возврат в меню
backFromAboutButton.addEventListener('click', () => {
    showScreen(startScreen);
});

// Обработчик кнопки выхода из игры
document.getElementById('exit-app-button').addEventListener('click', () => {
    // Стандартный способ закрыть окно (работает в Electron)
    window.close();
});