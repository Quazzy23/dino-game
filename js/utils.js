function analyzeDatabaseDifficulty(data) {
    if (!data) return null;

    const lines = data.trim().split('\n');
    if (lines.length === 0) return null;

    const firstLine = lines[0];
    const delimiter = (firstLine.match(/,/g) || []).length >= (firstLine.match(/\t/g) || []).length ? ',' : '\t';
    
    // Проверяем, есть ли хоть в одной строке данные для сложности
    const hasAnyDifficultyData = lines.some(line => line.split(delimiter).length > 3);
    if (!hasAnyDifficultyData) {
        return null; // Если ни в одной строке нет 4-й колонки, то сложности нет.
    }

    const difficulties = new Set();
    let hasEmptyOrMissingCells = false;

    for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(delimiter);
        
        // -> ГЛАВНОЕ ИЗМЕНЕНИЕ: проверяем, есть ли 4-й элемент
        if (parts.length < 4 || parts[3].trim().replace(/"/g, '') === '') {
            hasEmptyOrMissingCells = true;
            continue;
        }

        const diffStr = parts[3].trim().replace(/"/g, '');
        const diffNum = parseInt(diffStr, 10);

        if (isNaN(diffNum) || String(diffNum) !== diffStr) {
            console.warn("База содержит не-цифры в колонке сложности. Уровни отключены.");
            return null;
        }
        difficulties.add(diffNum);
    }

    if (difficulties.size === 0 && !hasEmptyOrMissingCells) return null;

    const maxDifficulty = difficulties.size > 0 ? Math.max(...difficulties) : 0;

    for (let i = 1; i < maxDifficulty; i++) {
        if (!difficulties.has(i)) {
            console.warn(`Пропущен уровень сложности ${i}. Уровни отключены.`);
            return null;
        }
    }
    
    const totalLevels = maxDifficulty + (hasEmptyOrMissingCells ? 1 : 0);
    return totalLevels > 1 ? totalLevels : null;
}

// --- НАЧАЛО ПОЛНОЙ ЗАМЕНЫ ФУНКЦИИ ---
function analyzeDbContent(data, totalDifficultyLevels) {
    const statsByLevel = {};
    if (!data) return { stats: statsByLevel, hasLevels: false };

    // Определяем, есть ли в этой базе вообще понятие уровней
    const hasLevels = totalDifficultyLevels !== null && totalDifficultyLevels > 1;

    const lines = data.trim().split('\n');
    if (lines.length === 0) return { stats: statsByLevel, hasLevels };

    const delimiter = (lines[0].match(/,/g) || []).length >= (lines[0].match(/\t/g) || []).length ? ',' : '\t';

    // 1. Собираем все записи в один массив
    const allEntries = lines.map(line => {
        if (!line.trim()) return null;
        const parts = line.split(delimiter).map(p => p.trim().replace(/"/g, ''));
        if (parts.length < 2) return null;

        const genus = parts[0];
        const species = parts[1];
        
        let difficulty = totalDifficultyLevels || 1; // Уровень по умолчанию - максимальный
        if (hasLevels && parts.length > 3 && parts[3] !== '') {
            const parsedDiff = parseInt(parts[3], 10);
            if (!isNaN(parsedDiff)) {
                difficulty = parsedDiff;
            }
        }
        return { genus, species, difficulty };
    }).filter(e => e !== null); // Убираем пустые/невалидные строки

    // 2. Если уровней нет, считаем общую статистику
    if (!hasLevels) {
        const genera = new Set();
        const species = new Set();
        allEntries.forEach(entry => {
            genera.add(entry.genus);
            species.add(`${entry.genus} ${entry.species}`);
        });
        statsByLevel[0] = { genera, species }; // Используем ключ 0 для общей статистики
        return { stats: statsByLevel, hasLevels: false };
    }

    // 3. Если уровни есть, считаем накопительную статистику
    for (let level = 1; level <= totalDifficultyLevels; level++) {
        const genera = new Set();
        const species = new Set();
        
        allEntries.forEach(entry => {
            // Включаем запись, если её сложность МЕНЬШЕ или РАВНА текущему уровню
            if (entry.difficulty <= level) {
                genera.add(entry.genus);
                species.add(`${entry.genus} ${entry.species}`);
            }
        });

        statsByLevel[level] = { genera, species };
    }

    return { stats: statsByLevel, hasLevels: true };
}
// --- КОНЕЦ ПОЛНОЙ ЗАМЕНЫ ФУНКЦИИ ---

function parseDatabase(data, emptyCellDifficultyLevel = 1) {
    const db = {};
    const trimmedData = data.trim();
    if (!trimmedData) return db;

    const lines = trimmedData.split('\n');
    const delimiter = (lines[0].match(/,/g) || []).length >= (lines[0].match(/\t/g) || []).length ? ',' : '\t';

    lines.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(delimiter);
        if (parts.length >= 2) {
            const genus = parts[0].trim().replace(/"/g, '');
            const speciesName = parts[1].trim().replace(/"/g, '');
            const isType = parts.length > 2 && parts[2].trim().replace(/"/g, '') === 'type';
            
            let difficulty = emptyCellDifficultyLevel;
            // -> ГЛАВНОЕ ИЗМЕНЕНИЕ: Проверяем длину массива parts
            if (parts.length > 3) {
                const diffStr = parts[3].trim().replace(/"/g, '');
                if (diffStr !== '') {
                    const diffNum = parseInt(diffStr, 10);
                    if (!isNaN(diffNum)) {
                        difficulty = diffNum;
                    }
                }
            }
            
            if (genus && speciesName) {
                const speciesObject = { species: speciesName, isType: isType, difficulty: difficulty };
                if (db[genus]) {
                    if (!db[genus].some(s => s.species === speciesName)) {
                        db[genus].push(speciesObject);
                    }
                } else {
                    db[genus] = [speciesObject];
                }
            }
        }
    });
    return db;
}

function levenshteinDistance(a, b) {
    // Создание матрицы
    const m = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    
    // Инициализация краев
    for (let i = 0; i <= a.length; i++) m[0][i] = i;
    for (let j = 0; j <= b.length; j++) m[j][0] = j;
    
    // Основной цикл
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const cost = (a[i - 1] === b[j - 1] ? 0 : 1);
            m[j][i] = Math.min(
                m[j][i - 1] + 1,      // Вставка
                m[j - 1][i] + 1,      // Удаление
                m[j - 1][i - 1] + cost // Замена
            );
        }
    }
    return m[b.length][a.length];
}

function jaroWinklerSimilarity(s1, s2) {
    let m = 0; // Совпадения
    if (s1.length === 0 || s2.length === 0) return 0;
    
    let d = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
    let s1_m = new Array(s1.length).fill(false);
    let s2_m = new Array(s2.length).fill(false);
    
    // Поиск совпадений
    for (let i = 0; i < s1.length; i++) {
        let start = Math.max(0, i - d);
        let end = Math.min(i + d + 1, s2.length);
        for (let j = start; j < end; j++) {
            if (s2_m[j]) continue;
            if (s1[i] !== s2[j]) continue;
            s1_m[i] = true;
            s2_m[j] = true;
            m++;
            break;
        }
    }
    
    if (m === 0) return 0;
    
    // Расчет перестановок (t)
    let t = 0, k = 0;
    for (let i = 0; i < s1.length; i++) {
        if (s1_m[i]) {
            while (!s2_m[k]) k++;
            if (s1[i] !== s2[k]) t++;
            k++;
        }
    }
    
    // Формула Джаро (используем именно (m - t), как в твоем исходнике)
    let jaro = (m / s1.length + m / s2.length + (m - t) / m) / 3;
    
    // Коэффициент Винклера
    let p = 0.1, l = 0;
    while (l < 4 && s1[l] === s2[l]) l++;
    
    return jaro + l * p * (1 - jaro);
}

function getMinimalUniquePrefix(targetSpecies, allSpeciesNames) {
    // Получаем список всех ДРУГИХ видов, кроме загаданного
    const otherSpecies = allSpeciesNames.filter(s => s.toLowerCase() !== targetSpecies.toLowerCase());
    
    // Если других видов нет, подсказка не нужна
    if (otherSpecies.length === 0) {
        return targetSpecies;
    }

    // Ищем минимальную длину префикса, которого нет у других видов
    for (let len = 1; len <= targetSpecies.length; len++) {
        const prefix = targetSpecies.substring(0, len).toLowerCase();
        // Если ни один из ДРУГИХ видов не начинается с этого префикса...
        if (!otherSpecies.some(s => s.toLowerCase().startsWith(prefix))) {
            // ...то мы нашли уникальный префикс!
            return targetSpecies.substring(0, len);
        }
    }

    // Если уникальный префикс не найден (крайне маловероятно), возвращаем полное имя
    return targetSpecies;
}

function getSmartThreshold(length) {
    if (length <= 4) return 0;
    if (length <= 9) return 1;
    if (length <= 14) return 2;
    return 3;
}

function applySfxVolume(volume) {
    // Стандартные звуки
    sfxCorrect.volume = volume;
    sfxAlmost.volume = volume;
    sfxIncorrect.volume = volume;
    sfxHint.volume = volume;
    // -> Звуки для блица
    sfxCorrectBlitz.volume = volume;
    sfxAlmostBlitz.volume = volume;
    sfxIncorrectBlitz.volume = volume;
    // Новые звуки интерфейса
    sfxCountdown.volume = volume;
    sfxScore.volume = volume;
    sfxFinishGood.volume = volume;
    sfxFinishOk.volume = volume;
    sfxFinishBad.volume = volume;
    sfxFinishPerfect.volume = volume;
    sfxShake.volume = volume;
    sfxLifeLost.volume = volume;
    sfxLifeBonus.volume = volume;
    sfxTimerTick.volume = volume;
    sfxTimerEnd.volume = volume;
    sfxNext.volume = volume;
    sfxAchievement.volume = volume;
}
// -> Применяет громкость ко всем музыкальным трекам
function applyMusicVolume(volume) {
    musicClassic.volume = volume;
    musicSurvival.volume = volume;
    // Громкость для треков блица
    musicBlitz1.volume = volume;
    musicBlitz3.volume = volume;
    musicBlitz5.volume = volume;
    musicMenu.volume = volume;
}

// Эта функция будет проигрывать звук с самого начала, даже если он еще не доиграл с прошлого раза
function playSound(sfx) {
    sfx.currentTime = 0;
    sfx.play();
}

// -> Новая функция для плавного затухания одного трека
function fadeOutMusic(audioElement, duration = 500) {
    if (!audioElement || audioElement.paused) return;

    const startVolume = audioElement.volume;
    if (startVolume === 0) {
        audioElement.pause();
        return;
    }
    
    const fadeOutInterval = setInterval(() => {
        const newVolume = audioElement.volume - (startVolume / (duration / 50));
        if (newVolume > 0) {
            audioElement.volume = newVolume;
        } else {
            clearInterval(fadeOutInterval);
            // Удаляем этот интервал из списка активных
            activeFadeOutIntervals = activeFadeOutIntervals.filter(id => id !== fadeOutInterval);
            audioElement.pause();
            audioElement.volume = startVolume; 
        }
    }, 50);

    // -> Регистрируем новый интервал
    activeFadeOutIntervals.push(fadeOutInterval);
}

function playMenuMusic(startTime = 0) {
    // Сначала останавливаем всю игровую музыку (мгновенно)
    musicClassic.pause();
    musicSurvival.pause();
    musicBlitz1.pause();
    musicBlitz3.pause();
    musicBlitz5.pause();

    // Запускаем музыку меню, если она не играет
    if (musicMenu.paused) {
        // Устанавливаем начальное время ДО вызова play()
        musicMenu.currentTime = startTime; 
        musicMenu.play().catch(e => console.error("Ошибка воспроизведения музыки меню:", e));
    }
}

// -> Обновленная функция, которая теперь вызывает затухание
function stopAllMusic(duration = 500) {
    // -> СНАЧАЛА: Отменяем все предыдущие затухания, которые еще могли работать
    activeFadeOutIntervals.forEach(id => clearInterval(id));
    activeFadeOutIntervals = []; // Очищаем массив
    // -> ЗАТЕМ: Запускаем новое затухание для каждого трека
    fadeOutMusic(musicClassic, duration);
    fadeOutMusic(musicSurvival, duration);
    fadeOutMusic(musicBlitz1, duration);
    fadeOutMusic(musicBlitz3, duration);
    fadeOutMusic(musicBlitz5, duration);
    fadeOutMusic(musicMenu, duration);
}

function playMusicForMode(mode) {
    // -> СНАЧАЛА: Гарантированно отменяем все активные затухания от прошлых вызовов
    activeFadeOutIntervals.forEach(id => clearInterval(id));
    activeFadeOutIntervals = [];

    // -> ЗАТЕМ: Останавливаем все треки мгновенно (без затухания)
    musicClassic.pause();
    musicSurvival.pause();
    musicBlitz1.pause();
    musicBlitz3.pause();
    musicBlitz5.pause();
    musicMenu.pause();
    
    // -> И только потом запускаем нужный трек
    let musicToPlay;
    switch(mode) {
        case 'classic':
            musicToPlay = musicClassic;
            break;
        case 'survival':
            musicToPlay = musicSurvival;
            break;
        case 'blitz':
            const settings = getSettings();
            switch(settings.blitzDuration) {
                case '60': musicToPlay = musicBlitz1; break;
                case '180': musicToPlay = musicBlitz3; break;
                case '300': musicToPlay = musicBlitz5; break;
            }
            break;
    }
    if (musicToPlay) {
        musicToPlay.currentTime = 0;
        // Восстанавливаем громкость из настроек перед запуском
        const settings = getSettings();
        musicToPlay.volume = settings.musicVolume;
        musicToPlay.play().catch(e => console.error("Ошибка воспроизведения музыки:", e));
    }
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    const paddedSeconds = String(seconds).padStart(2, '0');
    const paddedMs = String(milliseconds).padStart(2, '0');
    
    if (minutes > 0) {
        return `${minutes}:${paddedSeconds}:${paddedMs}`;
    }
    return `${paddedSeconds}:${paddedMs}`;
}

function formatBlitzTime(ms) {
    const minutes = Math.floor(ms / 60000);
    // Если округлять вниз, то невозможно будет получить достижение "обмануть систему"
    //const seconds = Math.floor((ms % 60000) / 1000); // Округляем вниз всегда (поменять если надо)
    const seconds = Math.round((ms % 60000) / 1000); // Округляем до ближайшей секунды

    const minText = translations[currentLang].minutesUnit || 'min';
    const secText = translations[currentLang].secondsUnit || 'sec';

    // --- ДОПОЛНИТЕЛЬНОЕ УЛУЧШЕНИЕ (ЕСЛИ ОКРУГЛЯЕМ ВНИЗ, ЭТОТ БЛОК НЕ НУЖЕН)---
    // Если секунды округлились до 60, нужно увеличить минуты и сбросить секунды, предотвращает появление "0 мин 60 сек"
    if (seconds === 60) {
        return `${minutes + 1} ${minText}`;
    }
    // --- КОНЕЦ УЛУЧШЕНИЯ ---

    if (minutes > 0 && seconds > 0) {
        return `${minutes} ${minText} ${seconds} ${secText}`;
    }
    if (minutes > 0) {
        return `${minutes} ${minText}`;
    }
    return `${seconds} ${secText}`;
}

// --- НОВАЯ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ---
function getOldRecord(mode, dbName, difficultyLevel) {
    const records = gameProgress.records.official;
    if (!records || !records[mode] || !records[mode][dbName] || !records[mode][dbName][difficultyLevel]) {
        return 0; // Если рекорда нет, он равен 0
    }
    
    if (mode === 'classic') {
        return records[mode][dbName][difficultyLevel].bestPercent || 0;
    }
    if (mode === 'blitz') {
        return records[mode][dbName][difficultyLevel].bestSpm || 0;
    }
    if (mode === 'survival') {
        return records[mode][dbName][difficultyLevel].score || 0;
    }
    return 0;
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}