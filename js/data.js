const translations = {
    ru: {
        pageTitle: "Угадай по роду",
        gameTitle: "Угадай по роду",
        gameDescription: "Выберите активную базу данных в настройках, чтобы начать игру.",
        startGameButton: "Начать игру",
        settingsButton: "Настройки",
        endGameEarlyButton: "Завершить досрочно",
        exitGameButton: "Выход",
        gameModeLabel: "Режим",
        gameModeClassic: "Классика",
        gameModeBlitz: "Блиц",
        roundCounterTemplate: "Раунд: {current} / {total}",
        scoreCounterTemplate: "Счет: {score}",
        gameInstructionDefault: "Назовите видовое название для рода:",
        gameInstructionNameAll: "Назовите все известные виды для рода:",
        gameInstructionTypeSpecies: "Назовите <strong>типовый</strong> вид для рода:",
        gameInstructionNextSpecies: "Следующий вид?",
        gameInstructionHintPrefix: "Загаданный вид начинается на '<strong>{prefix}</strong>'",
        blitzTimeUp: "Время вышло!",
        blitzAllQuestionsAnswered: "Безупречно! Вы прошли все вопросы!",
        blitzGameEndedEarly: "Игра завершена досрочно",
        blitzFinalScore: "Ваш итоговый счет",
        blitzFinalScoreCombined: "Итоговый счет: {score}",
        blitzDurationRecap: "(за {time})",
        blitzDurationUnit: "мин",
        minutesUnit: "мин",
        secondsUnit: "сек",
        blitzAlreadyNamed: "Уже названы:",
        speciesInputPlaceholder: "Введите вид...",
        checkButton: "Проверить",
        nextButton: "Далее",
        finishGameButton: "Завершить игру",
        gameOverTitle: "Игра окончена!",
        finalMessageGood: "Отличный результат! Вы настоящий палеонтолог.",
        finalMessagePerfect: "Безупречно! Вы знаете их всех!",
        finalMessageOkay: "Не плохо, не плохо.",
        finalMessageBad: "Можно и лучше, попробуйте еще раз!",
        finalScoreLabel: "Итоговый счет: {score} / {total}",
        totalTimeLabel: "Общее время: {time}",
        restartButton: "Сыграть снова",
        backToMenuButton: "В главное меню",
        settingsTitle: "Настройки игры",
        themeLabel: "Тема оформления:",
        lightTheme: "Светлая",
        darkTheme: "Тёмная",
        languageLabel: "Язык:",
        gameModeLabelSettings: "Режим игры:",
        timerLabel: "Таймер:",
        roundsLabel: "Количество раундов:",
        blitzDurationLabel: "Длительность блица:",
        blitzDuration_1: "1 минута",
        blitzDuration_3: "3 минуты",
        blitzDuration_5: "5 минут",
        marathonOption: "Марафон (все)",
        multiSpeciesModeLabel: "Обработка многовидовых родов:",
        acceptAnyOption: "Любой вид",
        guessOneOption: "Конкретный вид",
        nameAllOption: "Все виды",
        defaultDbHeader: "Встроенные базы данных:",
        customDbHeader: "Пользовательские базы данных:",
        customDbSortHint: "Добавьте файлы с базами данных.",
        noCustomDbs: "Пользовательские базы не загружены.",
        addDbButton: "Добавить новую",
        alert_noActiveDb: "Не выбрано ни одной активной базы данных. Зайдите в настройки.",
        alert_emptyDb: "В выбранных базах нет данных для начала игры.",
        alert_fileReadError: 'Не удалось прочитать файл "{fileName}".',
        alert_fileFormatError: 'Файл "{fileName}" пуст или имеет неверный формат и не будет добавлен.',
        confirm_deleteDb: 'Вы уверены, что хотите удалить базу данных "{fileName}"?',
        confirm_exitGame: "Вы уверены, что хотите выйти? Текущий прогресс будет потерян.",
        confirm_endGameEarly: "Вы уверены, что хотите завершить игру досрочно?",
        resetSettingsButton: "Сбросить настройки", // ДОБАВИТЬ
        recordsButton: "Рекорды",
        recordsTitle: "Рекорды",
        classicMode: "Классика",
        blitzMode: "Блиц",
        survivalMode: "Выживание",
        bestScoreLabel: "Лучший счет:",
        confirm_resetSettings: "Вы уверены, что хотите сбросить все настройки к стандартным?", // ДОБАВИТЬ
        verdict_correct: "Верно!",
        verdict_almost: "Засчитано.",
        verdict_incorrect: "Неверно.",
        verdict_fatal_almost: "Ошибка.",
        its: "Это",
        correctAnswerSingle: "Правильный вариант",
        correctAnswersPlural: "Правильные варианты",
        secondAttempt_correctButWrong: "Верно, такой вид есть, но загадан другой.",
        secondAttempt_trySecond: "Попробуйте назвать второй.",
        secondAttempt_hint: "Верно, такой вид есть, но {hint}",
        secondAttempt_hint_letters: "загаданный вид начинается на '<strong>{chars}</strong>'.",
        secondAttempt_yourGuess: "Вы ввели: <strong>{guess}</strong>",
        secondAttempt_yourGuessAcceptedAs: 'Ваш ответ "<strong>{guess}</strong>" засчитан как "<strong>{match}</strong>"',
        feedback_yourAnswer: 'Ваш ответ: "<strong>{answer}</strong>"',
        feedback_empty: "<i>(пусто)</i>",
        feedback_levenshtein: "Точность (Левенштейн)",
        feedback_jaro: "Сходство (Джаро-Винклер)",
        resultsTable_round: "Раунд",
        resultsTable_genus: "Род",
        resultsTable_yourAnswer: "Ваш ответ",
        resultsTable_result: "Результат",
        resultsTable_time: "Время",
        resultsTable_score: "Баллы",
        resultsTable_lives: "Жизни",
        resultsTable_statusCorrect: "Верно",
        resultsTable_statusAlmost: "С ошибкой",
        resultsTable_statusIncorrect: "Неверно",
        resultsTable_statusPartially: "Частично",
        resultsTable_notPlayed: "Не сыграно",
        nameAllScoringLabel: "Подсчет баллов:",
        nameAllScoringRound: "За раунд",
        nameAllScoringPerSpecies: "За каждый вид",
        showImagesLabel: "Показывать изображения:",
        tooltip_gameMode: "<b>Классика:</b> игра на заданное число раундов.<br><b>Блиц:</b> игра на время, цель - набрать как можно больше очков.<br><b>Выживание:</b> игра до последней ошибки. Цель - продержаться как можно дольше.",
        tooltip_multiSpecies: "Определяет, как игра будет обрабатывать род с несколькими известными видами.<br><b>Любой вид:</b> любой валидный вид засчитывается.<br><b>Конкретный вид:</b> игра загадывает один вид, нужно угадать именно его.<br><b>Все виды:</b> нужно перечислить все известные виды.",
        tooltip_nameAllScoring: "Актуально для режима 'Все виды'.<br><b>За раунд:</b> за раунд можно получить максимум 1 балл, даже если видов несколько.<br><b>За каждый вид:</b> баллы начисляются за каждый правильно названный вид.",
        tooltip_customDb: "Поддерживаемые форматы: <b>.csv, .txt</b> (в кодировке <b>UTF-8</b>).<br><br>" +
                    "<b>Структура строки:</b><br>" +
                    "<code>Род,Вид[,type][,сложность]</code><br>" +
                    "Разделитель: запятая (,) или табуляция (TAB).<br><br>" +
                    "<b>Опциональные поля:</b><br>" +
                    "• <b>type</b>: метка 'type' указывает, что это типовой вид для рода.<br>" +
                    "• <b>сложность</b>: цифра (1, 2, 3...), определяющая уровень, на котором появится вопрос. Если поле пустое, вид получает максимальный уровень сложности.",
        tooltip_survivalBonus: "Если опция включена, вы получаете <b>+1 жизнь</b> за каждые <b>20 верных ответов</b> подряд. Опечатки и ошибки сбрасывают серию.",
        tooltip_customImages: "Поддерживаемые форматы: <b>.png</b><br><br>" +
                    "<b>Название файла:</b><br>" +
                    "<code>Род вид.png</code>",
        confirmYes: "Да",
        confirmNo: "Нет",
        gameModeSurvival: "Выживание",
        survivalLivesLabel: "Количество жизней:",
        survivalBonusLabel: "Бонусная жизнь:",
        roundCounterSurvivalTemplate: "Раунд: {current}",
        scoreCounterSurvivalTemplate: "Счет: {score}",
        finalScoreSurvivalLabel: "Итоговый счет: {score}",
        tooltip_survivalLives: "Определяет, со сколькими жизнями вы начинаете игру.<br><b>Неверный ответ:</b> -1 жизнь.<br><b>Ответ с опечаткой:</b> -0.5 жизни.<br><br><b>Особое правило:</b> при выборе 1 жизни любая ошибка (даже с опечаткой) приводит к завершению игры.",
        finalMessageSurvival: "Отличная выдержка!",
        finalMessageSurvivalAllClear: "Безупречно!",
        finalScorePerSpeciesLabel: "Итоговый счет: {score}",
        finalMessageUnknown: "Мы не можем оценить ваш результат, так как вы завершили игру досрочно. Но так поступают только плохие палеонтологи!",
        difficultyLabel: "Сложность:",
        uniqueEntriesHeader: "Уникальных единиц",
        noDataForAnalysis: "Нет данных для анализа.",
        customImagesHeader: "Пользовательские изображения:",
        customImagesHint: "Добавьте папки с изображениями.",
        addImagesButton: "Добавить новую",
        noCustomImageFolders: "Папки с изображениями не загружены.",
        confirm_deleteImageFolder: 'Вы уверены, что хотите убрать папку "{folderName}" из списка? Сами файлы удалены не будут.',
        imageNotFound: "Изображение для {name} не найдено",
        sfxVolumeLabel: "Громкость эффектов:",
        musicVolumeLabel: "Громкость музыки:",
        resetSettingsButton: "Сбросить настройки",
        tableHeader_dbName: "База данных",
        classicUnit: " (% прохождения)",
        blitzUnit: " (очки/мин)",
        survivalUnit: " (индекс)",
        tabAchievements: "Достижения",
        // Достижения (УЛУЧШЕННЫЕ ОПИСАНИЯ)
        ach_classic_good_name: "Палеонтолог-любитель",
        ach_classic_good_desc: "Завершить игру в режиме 'Классика' с результатом 90% или выше.",
        ach_classic_perfect_name: "Идеальный образец",
        ach_classic_perfect_desc: "Завершить игру в режиме 'Классика' с результатом 100%.",
        ach_classic_marathon_perfect_name: "Коллекционер",
        ach_classic_marathon_perfect_desc: "Завершить игру в режиме 'Классика (марафон, все виды)' с результатом 100%.",
        ach_classic_marathon_perfect_hard_name: "Магистр палеонтологии",
        ach_classic_marathon_perfect_hard_desc: "Завершить игру в режиме 'Классика (марафон, все виды)' с результатом 100% на максимальном уровне сложности.",
        ach_survival_win_name: "Выживший",
        ach_survival_win_desc: "Пройти все вопросы в режиме 'Выживание'.",
        ach_survival_win_1life_name: "Железная воля",
        ach_survival_win_1life_desc: "Пройти все вопросы в режиме 'Выживание (все виды)' с одной жизнью.",
        ach_survival_win_1life_hard_name: "Живая легенда",
        ach_survival_win_1life_hard_desc: "Пройти все вопросы в режиме 'Выживание (все виды)' с одной жизнью на максимальном уровне сложности.",
        // Новые достижения
        ach_blitz_adrenaline_name: "Адреналин",
        ach_blitz_adrenaline_desc: "Достигнуть показателя 'очки/мин' 15 в режиме 'Блиц'.",
        ach_blitz_supersonic_name: "Сверхзвуковой",
        ach_blitz_supersonic_desc: "Достигнуть показателя 'очки/мин' 20 в режиме 'Блиц'.",
        ach_meta_explorer_name: "Исследователь",
        ach_meta_explorer_desc: "Сыграть хотя бы одну официальную игру на каждой из встроенных баз.",
        ach_meta_pioneer_name: "Первооткрыватель",
        ach_meta_pioneer_desc: "Завершить игру с использованием пользовательской базы данных.",
        ach_meta_god_name: "Бог систематики",
        ach_meta_god_desc: "Достичь абсолютного мастерства во всех режимах игры на всех базах и сложностях.",
        ach_funny_easter_egg_name: "Любопытный котик",
        ach_funny_easter_egg_desc: "Найти и посмотреть секретное видео.",
        ach_funny_fiasco_name: "Это фиаско!",
        ach_funny_fiasco_desc: "Завершить игру в режиме 'Классика' с результатом 0%.",
        ach_blitz_clockmaster_name: "Часовщик",
        ach_blitz_clockmaster_desc: "Набрать более 60 очков за 5-минутный раунд в режиме 'Блиц'.",
        ach_survival_on_the_edge_name: "На грани",
        ach_survival_on_the_edge_desc: "Победить в режиме 'Выживание', имея в конце 0.5 жизней.",
        ach_survival_mastery_100_name: "Мастер выживания",
        ach_survival_mastery_100_desc: "Достигнуть индекса выживаемости 100 в режиме «Выживание».",
        ach_meta_lorekeeper_name: "Хранитель знаний",
        ach_meta_lorekeeper_desc: "Завершить игру в режиме 'Классика' с результатом 100% на всех уровнях сложности.",
        ach_game_first_play_name: "Первые шаги",
        ach_game_first_play_desc: "Завершить свою первую игру.",
        ach_meta_champion_name: "Абсолютный чемпион",
        ach_meta_champion_desc: "Завершить игру в режиме 'Классика' на 100% и победить в 'Выживании' на всех базах и сложностях.",
        ach_meta_my_own_canon_name: "Я так вижу",
        ach_meta_my_own_canon_desc: "Завершить игру на 100% в 'Классике' или победить в 'Блице' или 'Выживании', используя пользовательскую базу данных.",
        ach_funny_confused_name: "Перепутал?",
        ach_funny_confused_desc: "Ввести правильное видовое название, но для другого рода.",
        ach_funny_rounding_error_name: "Наебал систему",
        ach_funny_rounding_error_desc: "Завершить игру в режиме 'Блиц' так, чтобы итоговое время превысило заданную длительность раунда.",
        ach_funny_skipper_name: "Скипнулся",
        ach_funny_skipper_desc: "Пропустить 20 ходов подряд менее чем за 20 секунд в режиме 'Блиц'.",
        ach_guess_one_intuition_name: "Интуиция палеонтолога",
        ach_guess_one_intuition_desc: "Угадать загаданный вид с первой попытки для рода, имеющего 5 или более видов.",
        ach_meta_photohunter_name: "Фотоохотник",
        ach_meta_photohunter_desc: "Завершить игру, используя пользовательскую базу данных и изображения.",
        survivalIndexRecap: "Ваш индекс выживаемости: <strong>{value}</strong>",
        blitzSpmRecap: "Ваши очки/мин: <strong>{value}</strong>",
        tabDatabases: "Базы данных",
        tabStatistics: "Статистика", // Вместо "Рекорды"
        tabGeneral: "Основные",     // Вместо "Настройки"
        newRecordTitle: "Новый рекорд!",
        aboutTitle: "Об игре",
        aboutText: `
            <div style="text-align: left;">
                <p style="font-size: 1em; margin-bottom: 20px; text-align: center;"><strong>Dino-Game</strong> v<span id="app-version-display"></span></p>
                
                <div style="padding-left: 10px;">
                    <p style="font-size: 0.8em; margin-bottom: 15px;">
                        Проект создан из любви к палеонтологии и для популяризации науки.<br>
                        Игра призвана проверить знания родовых и видовых таксонов животных у опытных любителей и принести понимание биологической систематики по ICZN для массовой аудитории.<br>
                        <span id="iczn-task-area">Твоя первая задача узнать что такое ICZN и вписать расшифровку в это поле:<br><input type="text" id="iczn-mini-input" autocomplete="off"></span>
                    </p>

                    <p style="font-size: 0.8em; line-height: 1.4;">
                        Автор проекта: Quazzy<br>
                        Автор изображений: cisiopurple<br>
                        Создано с помощью Google AI Gemini
                        <br><br>
                        Контакты автора в социальных сетях:<br>
                        YouTube: Quazzy (@Quazzy23)<br>
                        Instagram: quazzy_23<br>
                        GitHub: Quazzy23
                        <br><br>
                        Поддержите автора изображений:<br>
                        DeviantArt: cisiopurple
                        <br><br>
                        Твои предложения по улучшению и обновлению игры приветствуются! Для связи со мной используй мои социальные сети.
                    </p>
                </div>
            </div>
        `,
        fullscreenLabel: "Полноэкранный режим:",
        ach_iczn_name: "ICZN",
        ach_iczn_desc: "Вы расшифровали главную аббревиатуру зоологической номенклатуры.",
        ach_rude_name: "Сам иди нахуй!",
        ach_rude_desc: "Вы обматерили игру.",
        updateAvailable: "Доступна новая версия: {version}. Установить сейчас?",
        db_name_dinosaurs: "Динозавры",
        db_name_pterosaurs: "Птерозавры",
        db_name_marines: "Морские рептилии",
    },
    en: {
        pageTitle: "Guess the Species",
        gameTitle: "Guess the Species",
        gameDescription: "Select an active database in the settings to start the game.",
        startGameButton: "Start Game",
        settingsButton: "Settings",
        endGameEarlyButton: "End Game Early",
        exitGameButton: "Exit",
        gameModeLabel: "Mode",
        gameModeClassic: "Classic",
        gameModeBlitz: "Blitz",
        roundCounterTemplate: "Round: {current} / {total}",
        scoreCounterTemplate: "Score: {score}",
        gameInstructionDefault: "Write the species name for the genus:",
        gameInstructionNameAll: "Name all known species for the genus:",
        gameInstructionTypeSpecies: "Name the <strong>type</strong> species for the genus:",
        gameInstructionNextSpecies: "Next species?",
        gameInstructionHintPrefix: "The intended species starts with '<strong>{prefix}</strong>'",
        blitzTimeUp: "Time's Up!",
        blitzAllQuestionsAnswered: "Perfet! You've answered all questions!",
        blitzGameEndedEarly: "Game Ended Early",
        blitzFinalScore: "Your final score",
        blitzFinalScoreCombined: "Final Score: {score}",
        blitzDurationRecap: "(in {time})",
        blitzDurationUnit: "min",
        minutesUnit: "min",
        secondsUnit: "sec",
        blitzAlreadyNamed: "Already named:",
        speciesInputPlaceholder: "Enter species...",
        checkButton: "Check",
        nextButton: "Next",
        finishGameButton: "Finish Game",
        gameOverTitle: "Game Over!",
        finalMessageGood: "Excellent result! You are a true paleontologist.",
        finalMessagePerfect: "Perfect! You know them all!",
        finalMessageOkay: "Not bad, not bad.",
        finalMessageBad: "You can do better, try again!",
        finalScoreLabel: "Final score: {score} / {total}",
        totalTimeLabel: "Total time: {time}",
        restartButton: "Play Again",
        backToMenuButton: "Main Menu",
        settingsTitle: "Game Settings",
        themeLabel: "Design theme:",
        lightTheme: "Light",
        darkTheme: "Dark",
        languageLabel: "Language:",
        gameModeLabelSettings: "Game Mode:",
        timerLabel: "Timer:",
        roundsLabel: "Number of rounds:",
        blitzDurationLabel: "Blitz duration:",
        blitzDuration_1: "1 minute",
        blitzDuration_3: "3 minutes",
        blitzDuration_5: "5 minutes",
        marathonOption: "Marathon (all)",
        multiSpeciesModeLabel: "Handling of multi-species genera:",
        acceptAnyOption: "Any spicies",
        guessOneOption: "Specific species",
        nameAllOption: "All species",
        defaultDbHeader: "Built-in Databases:",
        customDbHeader: "Custom Databases:",
        customDbSortHint: "Add the database files.",
        noCustomDbs: "No custom databases loaded.",
        addDbButton: "Add New",
        alert_noActiveDb: "No active database selected. Please go to settings.",
        alert_emptyDb: "No data in the selected databases to start the game.",
        alert_fileReadError: 'Failed to read file "{fileName}".',
        alert_fileFormatError: 'File "{fileName}" is empty or has an invalid format and will not be added.',
        confirm_deleteDb: 'Are you sure you want to delete the database "{fileName}"?',
        confirm_exitGame: "Are you sure you want to exit? Current progress will be lost.",
        confirm_endGameEarly: "Are you sure you want to end the game early?",
        resetSettingsButton: "Reset Settings", // ДОБАВИТЬ
        recordsButton: "Records",
        recordsTitle: "Records",
        classicMode: "Classic",
        blitzMode: "Blitz",
        survivalMode: "Survival",
        bestScoreLabel: "Best score:",
        confirm_resetSettings: "Are you sure you want to reset all settings to default?", // ДОБАВИТЬ
        verdict_correct: "Correct!",
        verdict_almost: "Accepted.",
        verdict_incorrect: "Incorrect.",
        verdict_fatal_almost: "Mistake.",
        its: "It's",
        correctAnswerSingle: "The correct variant is",
        correctAnswersPlural: "The correct variants are",
        secondAttempt_correctButWrong: "Correct, that species exists, but another one was intended.",
        secondAttempt_trySecond: "Try to name the second one.",
        secondAttempt_hint: "Correct, that species exists, but {hint}",
        secondAttempt_hint_letters: "the intended species starts with '<strong>{chars}</strong>'.",
        secondAttempt_yourGuess: "You entered: <strong>{guess}</strong>",
        secondAttempt_yourGuessAcceptedAs: 'Your answer "<strong>{guess}</strong>" was accepted as "<strong>{match}</strong>"',
        feedback_yourAnswer: 'Your answer: "<strong>{answer}</strong>"',
        feedback_empty: "<i>(empty)</i>",
        feedback_levenshtein: "Accuracy (Levenshtein)",
        feedback_jaro: "Similarity (Jaro-Winkler)",
        resultsTable_round: "Round",
        resultsTable_genus: "Genus",
        resultsTable_yourAnswer: "Your Answer",
        resultsTable_result: "Result",
        resultsTable_time: "Time",
        resultsTable_score: "Score",
        resultsTable_lives: "Lives",
        resultsTable_statusCorrect: "Correct",
        resultsTable_statusAlmost: "With typo",
        resultsTable_statusIncorrect: "Incorrect",
        resultsTable_statusPartially: "Partially",
        resultsTable_notPlayed: "Not played",
        nameAllScoringLabel: "Score calculation:",
        nameAllScoringRound: "Per round",
        nameAllScoringPerSpecies: "Per species",
        showImagesLabel: "Show images:",
        tooltip_gameMode: "<b>Classic:</b> a game for a set number of rounds.<br><b>Blitz:</b> a timed game, the goal is to score as many points as possible.<br><b>Survival:</b> game until the last mistake. The goal is to last as long as possible.",
        tooltip_multiSpecies: "Determines how the game handles a genus with multiple known species.<br><b>Any species:</b> any valid species is accepted.<br><b>Specific species:</b> the game intends one species, you must guess that specific one.<br><b>All species:</b> you must list all known species.",
        tooltip_nameAllScoring: "Relevant for the 'Name all species' mode.<br><b>Per round:</b> you can get a maximum of 1 point per round, even if there are multiple species.<br><b>Per species:</b> points are awarded for each correctly named species.",
        tooltip_customDb: "Supported formats: <b>.csv, .txt</b> (in <b>UTF-8</b> encoding).<br><br>" +
                    "<b>Line Structure:</b><br>" +
                    "<code>Genus,Species[,type][,difficulty]</code><br>" +
                    "Delimiter: comma (,) or tab (TAB).<br><br>" +
                    "<b>Optional Fields:</b><br>" +
                    "• <b>type</b>: the 'type' mark indicates this is the type species for the genus.<br>" +
                    "• <b>difficulty</b>: a number (1, 2, 3...) defining the level at which the question will appear. If the field is empty, the species gets the highest difficulty level.",
        tooltip_survivalBonus: "If this option is enabled, you get <b>+1 life</b> for every <b>20 correct answers</b> in a row. Typos and incorrect answers reset the streak.",
        tooltip_customImages: "Supported formats: <b>.png</b><br><br>" +
                    "<b>Filename:</b><br>" +
                    "<code>Genus species.png</code>",
        confirmYes: "Yes",
        confirmNo: "No",
        gameModeSurvival: "Survival",
        survivalLivesLabel: "Number of lives:",
        survivalBonusLabel: "Bonus life:",
        roundCounterSurvivalTemplate: "Round: {current}",
        scoreCounterSurvivalTemplate: "Score: {score}",
        finalScoreSurvivalLabel: "Final score: {score}",
        tooltip_survivalLives: "Determines how many lives you start the game with.<br><b>Incorrect answer:</b> -1 life.<br><b>Answer with a typo:</b> -0.5 lives.<br><br><b>Special rule:</b> when 1 life is selected, any mistake (including a typo) ends the game.",
        finalMessageSurvival: "Great endurance!",
        finalMessageSurvivalAllClear: "Perfect!",
        finalScorePerSpeciesLabel: "Final Score: {score}",
        finalMessageUnknown: "We can't evaluate your result because you ended the game early. But only bad paleontologists do that!",
        difficultyLabel: "Difficulty:",
        uniqueEntriesHeader: "Unique Entries",
        noDataForAnalysis: "No data for analysis.",
        customImagesHeader: "Custom Images:",
        customImagesHint: "Add folders with images.",
        addImagesButton: "Add New",
        noCustomImageFolders: "No custom image folders loaded.",
        confirm_deleteImageFolder: 'Are you sure you want to remove the folder "{folderName}" from the list? The files themselves will not be deleted.',
        imageNotFound: "Image for {name} not found",
        dbManagementButton: "Databases",
        dbManagementTitle: "Database Management",
        sfxVolumeLabel: "Effects volume:",
        musicVolumeLabel: "Music volume:",
        resetSettingsButton: "Reset Settings",
        tableHeader_dbName: "Database",
        classicUnit: " (% completion)",
        blitzUnit: " (score/min)",
        survivalUnit: " (index)",
        tabAchievements: "Achievements",
        // Achievements (IMPROVED & ALIGNED DESCRIPTIONS)
        ach_classic_good_name: "Amateur Paleontologist",
        ach_classic_good_desc: "Finish a 'Classic' game with a score of 90% or higher.",
        ach_classic_perfect_name: "A Perfect Specimen",
        ach_classic_perfect_desc: "Finish a 'Classic' game with a 100% score.",
        ach_classic_marathon_perfect_name: "The Collector",
        ach_classic_marathon_perfect_desc: "Finish a 'Classic (marathon, all species)' game with a 100% score.",
        ach_classic_marathon_perfect_hard_name: "Master of paleontology",
        ach_classic_marathon_perfect_hard_desc: "Finish a 'Classic (marathon, all species)' game with a 100% score on the highest difficulty.",
        ach_survival_win_name: "Survivor",
        ach_survival_win_desc: "Clear all questions in 'Survival' mode.",
        ach_survival_win_1life_name: "Will of Iron",
        ach_survival_win_1life_desc: "Clear all questions in 'Survival (all species)' mode with only one life.",
        ach_survival_win_1life_hard_name: "Living legend",
        ach_survival_win_1life_hard_desc: "Clear all questions in 'Survival (all species)' mode with one life on the highest difficulty.",
        // New Achievements
        ach_blitz_adrenaline_name: "Adrenaline",
        ach_blitz_adrenaline_desc: "Achieve a 'score/min' rate 15 in 'Blitz' mode.",
        ach_blitz_supersonic_name: "Supersonic",
        ach_blitz_supersonic_desc: "Achieve a 'score/min' rate 20 in 'Blitz' mode.",
        ach_meta_explorer_name: "Explorer",
        ach_meta_explorer_desc: "Play at least one official game on each of the built-in databases.",
        ach_meta_pioneer_name: "Pioneer",
        ach_meta_pioneer_desc: "Finish a game using a custom database.",
        ach_meta_god_name: "Taxomony God",
        ach_meta_god_desc: "Achieve absolute mastery in all game modes across all databases and difficulties.",
        ach_funny_easter_egg_name: "Curious Cat",
        ach_funny_easter_egg_desc: "Find and watch the secret video.",
        ach_funny_fiasco_name: "Total Fiasco",
        ach_funny_fiasco_desc: "Finish a 'Classic' game with a 0% score.",
        ach_blitz_clockmaster_name: "Clockmaster",
        ach_blitz_clockmaster_desc: "Score over 60 points in a 5-minute 'Blitz' mode.",
        ach_survival_on_the_edge_name: "On the Edge",
        ach_survival_on_the_edge_desc: "Win a 'Survival' game with 0.5 lives remaining.",
        ach_survival_mastery_100_name: "Survival Master",
        ach_survival_mastery_100_desc: "Achieve a survival index of 100 in 'Survival' mode.",
        ach_meta_lorekeeper_name: "Lorekeeper",
        ach_meta_lorekeeper_desc: "Finish a 'Classic' game with a 100% score for all difficulty levels.",
        ach_game_first_play_name: "First Steps",
        ach_game_first_play_desc: "Finish your first game.",
        ach_meta_champion_name: "Absolute champion",
        ach_meta_champion_desc: "Finish a 'Classic' game with 100% score and win in 'Survival' across all databases and difficulties.",
        ach_meta_my_own_canon_name: "My Own Canon",
        ach_meta_my_own_canon_desc: "Finish the game 100% in 'Classic' or win in 'Blitz' or 'Survival' using a custom database.",
        ach_funny_confused_name: "Confused?",
        ach_funny_confused_desc: "Enter a correct species name, but for the wrong genus.",
        ach_funny_rounding_error_name: "Fucked up the system",
        ach_funny_rounding_error_desc: "Finish a 'Blitz' game with a final time greater than the set round duration.",
        ach_funny_skipper_name: "Skipself",
        ach_funny_skipper_desc: "Skip 20 turns in a row in under 20 seconds in 'Blitz' mode.",
        ach_guess_one_intuition_name: "Paleontologist's intuition",
        ach_guess_one_intuition_desc: "Guess the correct species on the first try for a genus with 5 or more species.",
        ach_meta_photohunter_name: "Photohunter",
        ach_meta_photohunter_desc: "Finish a game using custom database and images.",
        survivalIndexRecap: "Your survival index: <strong>{value}</strong>",
        blitzSpmRecap: "Your score/min: <strong>{value}</strong>",
        tabDatabases: "Databases",
        tabStatistics: "Statistics", // Instead of "Records"
        tabGeneral: "General",     // Instead of "Settings"
        newRecordTitle: "New Record!",
        aboutTitle: "About game",
        aboutText: `
            <div style="text-align: left;">
                <p style="font-size: 1em; margin-bottom: 20px; text-align: center;"><strong>Dino-Game</strong> v<span id="app-version-display"></span></p>
                
                <div style="padding-left: 10px;">
                    <p style="font-size: 0.8em; margin-bottom: 15px;">
                        The project was created out of love for paleontology and to popularize science.<br>
                        The game is designed to test the knowledge of generic and specific taxa of animals among experienced amateurs and bring an understanding of biological systematics according to ICZN to a mass audience.<br>
                        <span id="iczn-task-area">Your first task is to find out what ICZN means and type it here:<br><input type="text" id="iczn-mini-input" autocomplete="off"></span>
                    </p>

                    <p style="font-size: 0.8em; line-height: 1.4;">
                        Project Author: Quazzy<br>
                        Image Author: cisiopurple<br>
                        Created with Google AI Gemini
                        <br><br>
                        Author's social media contacts:<br>
                        YouTube: Quazzy (@Quazzy23)<br>
                        Instagram: quazzy_23<br>
                        GitHub: Quazzy23
                        <br><br>
                        Support the author of the images:<br>
                        DeviantArt: cisiopurple
                        <br><br>
                        Your suggestions for improving and updating the game are welcome! To contact me, use my social media links.
                    </p>
                </div>
            </div>
        `,
        fullscreenLabel: "Full Screen Mode:",
        ach_iczn_name: "ICZN",
        ach_iczn_desc: "You have deciphered the main abbreviation of zoological nomenclature.",
        ach_rude_name: "Fuck yourself!",
        ach_rude_desc: "You curse the game out.",
        updateAvailable: "New version available: {version}. Install now?",
        db_name_dinosaurs: "Dinosaurs",
        db_name_pterosaurs: "Pterosaurs",
        db_name_marines: "Marine reptiles",
    }
};

const DEFAULT_DATABASES = {
    'dinosaurs': { // Это ID (ключ для рекордов)
        file: 'dinos.csv', // Имя файла на диске
        imagePath: 'images/dinos/',
    },
    'pterosaurs': {
        file: 'pteros.csv',
        imagePath: 'images/pteros/',
    },
    'marines': {
        file: 'marines.csv',
        imagePath: 'images/marines/',
    }
};

// --- СТРУКТУРА ДОСТИЖЕНИЙ ---

const ALL_ACHIEVEMENTS = {
    // === Начальные ===
    game_first_play: { nameKey: 'ach_game_first_play_name', descKey: 'ach_game_first_play_desc' },
    meta_explorer: { nameKey: 'ach_meta_explorer_name', descKey: 'ach_meta_explorer_desc' },

    // === Классика ===
    classic_good: { nameKey: 'ach_classic_good_name', descKey: 'ach_classic_good_desc' },
    classic_perfect: { nameKey: 'ach_classic_perfect_name', descKey: 'ach_classic_perfect_desc' },
    meta_lorekeeper: { nameKey: 'ach_meta_lorekeeper_name', descKey: 'ach_meta_lorekeeper_desc' },
    classic_marathon_perfect: { nameKey: 'ach_classic_marathon_perfect_name', descKey: 'ach_classic_marathon_perfect_desc' },
    classic_marathon_perfect_hard: { nameKey: 'ach_classic_marathon_perfect_hard_name', descKey: 'ach_classic_marathon_perfect_hard_desc' },
    funny_fiasco: { nameKey: 'ach_funny_fiasco_name', descKey: 'ach_funny_fiasco_desc' },

    // === Блиц ===
    blitz_adrenaline: { nameKey: 'ach_blitz_adrenaline_name', descKey: 'ach_blitz_adrenaline_desc' },
    blitz_supersonic: { nameKey: 'ach_blitz_supersonic_name', descKey: 'ach_blitz_supersonic_desc' }, // <--- НОВОЕ
    blitz_clockmaster: { nameKey: 'ach_blitz_clockmaster_name', descKey: 'ach_blitz_clockmaster_desc' }, // НОВОЕ
    
    // === Выживание ===
    survival_win: { nameKey: 'ach_survival_win_name', descKey: 'ach_survival_win_desc' },
    ach_survival_mastery_100: { nameKey: 'ach_survival_mastery_100_name', descKey: 'ach_survival_mastery_100_desc' },
    survival_win_1life: { nameKey: 'ach_survival_win_1life_name', descKey: 'ach_survival_win_1life_desc' },
    survival_win_1life_hard: { nameKey: 'ach_survival_win_1life_hard_name', descKey: 'ach_survival_win_1life_hard_desc' },
    survival_on_the_edge: { nameKey: 'ach_survival_on_the_edge_name', descKey: 'ach_survival_on_the_edge_desc' }, // НОВОЕ

    // === Мета-достижения ===
    meta_pioneer: { nameKey: 'ach_meta_pioneer_name', descKey: 'ach_meta_pioneer_desc' },
    meta_photohunter: { nameKey: 'ach_meta_photohunter_name', descKey: 'ach_meta_photohunter_desc' },
    meta_my_own_canon: { nameKey: 'ach_meta_my_own_canon_name', descKey: 'ach_meta_my_own_canon_desc' },

    // === Забавные и Секретные ===
    guess_one_intuition: { nameKey: 'ach_guess_one_intuition_name', descKey: 'ach_guess_one_intuition_desc' },
    meta_iczn_scholar: { nameKey: 'ach_iczn_name', descKey: 'ach_iczn_desc', hidden: true },
    funny_easter_egg: { nameKey: 'ach_funny_easter_egg_name', descKey: 'ach_funny_easter_egg_desc', hidden: true }, 
    funny_confused: { nameKey: 'ach_funny_confused_name', descKey: 'ach_funny_confused_desc', hidden: true },
    funny_rounding_error: { nameKey: 'ach_funny_rounding_error_name', descKey: 'ach_funny_rounding_error_desc', hidden: true },
    funny_skipper: { nameKey: 'ach_funny_skipper_name', descKey: 'ach_funny_skipper_desc', hidden: true },
    meta_rude_player: { nameKey: 'ach_rude_name', descKey: 'ach_rude_desc', hidden: true },

    // === Финальное достижение ===
    meta_champion: { nameKey: 'ach_meta_champion_name', descKey: 'ach_meta_champion_desc' },
    meta_god: { nameKey: 'ach_meta_god_name', descKey: 'ach_meta_god_desc', hidden: true, golden: true },
};

// <-- ДОБАВЬТЕ ЭТОТ БЛОК КОДА ЗДЕСЬ -->
const ACHIEVEMENT_DISPLAY_ORDER = [
    // Общие
    'game_first_play',
    'meta_explorer',
    
    // Классика (от простого к сложному)
    'classic_good',
    'classic_perfect',
    'classic_marathon_perfect',
    'classic_marathon_perfect_hard',
    
    // Блиц
    'blitz_adrenaline',
    'blitz_supersonic',
    'blitz_clockmaster',

    // Выживание
    'survival_win',
    'survival_on_the_edge',
    'ach_survival_mastery_100',
    'survival_win_1life',
    'survival_win_1life_hard',

    // Мета и Пользовательские базы
    'meta_pioneer',
    'meta_photohunter',
    'meta_my_own_canon',
    'meta_lorekeeper',
    'meta_champion',
    
    // Забавные (если они могут выпасть в конце)
    'funny_fiasco',
    'funny_rounding_error',
    
    // Финальная ачивка
    'meta_god',
];

const DEFAULT_SETTINGS = {
    gameMode: 'classic',
    sfxVolume: 1,
    musicVolume: 0.7,
    rounds: '10',
    blitzDuration: '60',
    theme: 'light',
    multiSpeciesMode: 'acceptAny',
    language: 'ru',
    timerEnabled: false,
    nameAllScoring: 'round',
    showImages: false, // Наша новая настройка по умолчанию
    // ДОБАВЬТЕ ЭТИ СТРОКИ
    survivalLives: '5',
    survivalBonus: true,
    fullscreenEnabled: false, // Добавь это
};

const DB_STORAGE_KEY = 'game_databases';
const ACTIVE_DBS_KEY = 'game_active_dbs';
const SETTINGS_KEY = 'game_settings';
const DB_ORDER_KEY = 'game_database_order';
const DB_DIFFICULTY_KEY = 'game_db_difficulties';
const CUSTOM_IMAGES_KEY = 'game_custom_images';
const ACTIVE_IMAGES_KEY = 'game_active_images';

const TYPE_SPECIES_EVENT_WEIGHT = 1;
const MAX_IMAGE_HEIGHT_PX = 300;
const MAX_IMAGE_WIDTH_PX = 600;

// Рекорды умные
let gameProgress = {
    version: 1, // Текущая версия структуры данных
    records: { official: {} },
    achievements: [],
    totalPlaytimeSeconds: 0
};