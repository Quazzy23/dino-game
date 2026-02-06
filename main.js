// main.js
const { exec } = require('child_process');
const https = require('https');
const fs_extra = require('fs');

// Подключаем необходимые модули из Electron
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const { promises: fs } = require('fs');

// Функция для создания окна приложения
const createWindow = () => {
  // Создаем новое окно браузераnpm 
  const win = new BrowserWindow({
    width: 1280, // Можете поменять на нужные размеры
    height: 960,
    icon: path.join(__dirname, 'images/window_head.png'), 
    webPreferences: {
    // Это безопасно для локального приложения, которое не загружает внешний контент.
      webSecurity: false, 
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');

  // Проверяем: если окно открылось сразу в полный экран, скрываем меню
  if (win.isFullScreen()) {
    win.setMenuBarVisibility(false);
  }

  // --- ДОБАВЬТЕ ЭТУ СТРОКУ ---
  win.on('enter-full-screen', () => {
    win.setMenuBarVisibility(false); // Скрываем меню при входе в полный экран
    win.webContents.send('fullscreen-change', true);
  });

  win.on('leave-full-screen', () => {
    win.setMenuBarVisibility(true); // Возвращаем меню при выходе в окно
    win.webContents.send('fullscreen-change', false);
  });
};

// === НАЧАЛО КОДА ДЛЯ МЕНЮ И ГОРЯЧИХ КЛАВИШ ===
// Это стандартный шаблон меню, который включает всё, что нам нужно
// Словари для меню
const menuTranslations = {
    ru: {
        game: 'Игра',
        quit: 'Выход',
        view: 'Вид',
        reload: 'Перезагрузить',
        fullscreen: 'Полноэкранный режим',
        resetZoom: 'Сбросить масштаб',
        zoomIn: 'Увеличить',
        zoomOut: 'Уменьшить'
    },
    en: {
        game: 'Game',
        quit: 'Exit',
        view: 'View',
        reload: 'Reload',
        fullscreen: 'Toggle Full Screen',
        resetZoom: 'Reset Zoom',
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out'
    }
};

// Функция для создания меню на лету
const setApplicationMenu = (lang) => {
    // Если язык неизвестен, берем английский
    const text = menuTranslations[lang] || menuTranslations.en;

    const template = [
        {
            label: text.game,
            submenu: [
                { role: 'quit', label: text.quit }
            ]
        },
        {
            label: text.view,
            submenu: [
                { role: 'reload', label: text.reload },
                // role: 'forceReload' можно скрыть для релиза, но оставим пока
                { role: 'togglefullscreen', label: text.fullscreen },
                { role: 'toggleDevTools', label: text.devTools },
                { type: 'separator' },
                { role: 'resetZoom', label: text.resetZoom },
                { role: 'zoomIn', accelerator: 'Ctrl+=', label: text.zoomIn },
                { role: 'zoomOut', label: text.zoomOut },
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};
// === КОНЕЦ КОДА ДЛЯ МЕНЮ И ГОРЯЧИХ КЛАВИШ ===

// === НАЧАЛО НОВОГО КОДА ДЛЯ ОБРАБОТКИ ЗАПРОСОВ ===
function setupIpcHandlers() {
  // --- НАЧАЛО ВСТАВКИ: ЛОГИКА РАБОТЫ С ФАЙЛОМ ПРОГРЕССА ---
  // Определяем путь к нашему файлу с данными в папке пользователя
  const userDataPath = app.getPath('userData');
  const dataFilePath = path.join(userDataPath, 'game-progress.json');
  console.log('Progress file location:', dataFilePath);

  ipcMain.handle('load-user-data', async () => {
    try {
      // Используем stat, чтобы проверить существование без выбрасывания ошибки
      await fs.stat(dataFilePath); 
      return await fs.readFile(dataFilePath, 'utf-8');
    } catch (error) {
      // Если файла нет (ошибка ENOENT) или другая ошибка, возвращаем null
      if (error.code === 'ENOENT') {
        return null; 
      }
      console.error('Failed to load user data:', error);
      return null;
    }
  });

  ipcMain.handle('save-user-data', async (event, data) => {
    try {
      await fs.writeFile(dataFilePath, data, 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Failed to save user data:', error);
      return { success: false, error: error.message };
    }
  });
  // --- КОНЕЦ ВСТАВКИ ---
  // --- НАЧАЛО ДОБАВЛЕНИЯ ---
  ipcMain.on('save-user-data-sync', (event, data) => {
      try {
          // Используем СИНХРОННУЮ версию writeFile
          require('fs').writeFileSync(dataFilePath, data, 'utf-8');
      } catch (error) {
          console.error('Failed to save user data synchronously:', error);
      }
  });
  // --- КОНЕЦ ДОБАВЛЕНИЯ ---

  ipcMain.handle('dialog:openDirectory', async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
          properties: ['openDirectory']
      });
      if (canceled || filePaths.length === 0) {
          return null; // Пользователь отменил выбор
      }
      
      const folderPath = filePaths[0];
      try {
          // Просто возвращаем путь, игра сама будет строить пути к файлам
          return {
              name: path.basename(folderPath), // Получаем имя папки (например, "MyPteros")
              path: folderPath // Полный путь (например, "C:/Users/User/Documents/MyPteros")
          };
      } catch (err) {
          console.error('Ошибка чтения папки:', err);
          return null;
      }
  });

  // --- НАЧАЛО ДОБАВЛЕНИЯ НОВОГО ОБРАБОТЧИКА ---
  ipcMain.handle('dialog:openFileAndRead', async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'], // Позволяем выбрать несколько файлов
        filters: [
          { name: 'Базы данных', extensions: ['csv', 'txt'] },
          { name: 'Все файлы', extensions: ['*'] }
        ]
      });

      if (canceled || filePaths.length === 0) {
        return []; // Возвращаем пустой массив, если пользователь отменил выбор
      }

      // Асинхронно читаем каждый выбранный файл
      const readPromises = filePaths.map(async (filePath) => {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          return {
            path: filePath,                 // Полный путь к файлу
            name: path.basename(filePath),  // Только имя файла
            content: content                // Содержимое файла
          };
        } catch (error) {
          console.error(`Ошибка чтения файла ${filePath}:`, error);
          return null;
        }
      });

      // Ждем завершения чтения всех файлов и отфильтровываем те, что не удалось прочитать
      const results = (await Promise.all(readPromises)).filter(r => r !== null);
      return results;
  });
  // --- КОНЕЦ ДОБАВЛЕНИЯ НОВОГО ОБРАБОТЧИКА ---

  ipcMain.on('set-fullscreen', (event, flag) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      win.setFullScreen(flag);
  });
  // Слушаем команду на смену языка меню
  ipcMain.on('update-menu-language', (_, lang) => {
      setApplicationMenu(lang);
  });

  // 1. Проверка версии
  ipcMain.handle('check-for-update', async () => {
    return new Promise((resolve) => {
      const url = 'https://raw.githubusercontent.com/Quazzy23/dino-game/refs/heads/main/latest.json';
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
        });
      }).on('error', () => resolve(null));
    });
  });

  // 2. Скачивание и запуск
  ipcMain.on('start-update-download', (event, url) => {
    const tempPath = path.join(app.getPath('temp'), 'dino_game_setup.exe');
    const file = fs_extra.createWriteStream(tempPath);
    
    https.get(url, (res) => {
      const totalSize = parseInt(res.headers['content-length'], 10);
      let downloadedSize = 0;

      res.on('data', (chunk) => {
        downloadedSize += chunk.length;
        // Отправляем процент загрузки обратно в игру
        const progress = (downloadedSize / totalSize) * 100;
        event.sender.send('download-progress', progress);
      });

      res.pipe(file);

      file.on('finish', () => {
        file.close();
        // Запускаем инсталлятор и выходим
        exec(`"${tempPath}"`, () => {});
        app.quit();
      });
    });
  });

  // Отдаем версию приложения из package.json
  ipcMain.handle('get-app-version', () => app.getVersion());
}
// === КОНЕЦ НОВОГО КОДА ===

// Запускаем создание окна, когда приложение готово
app.whenReady().then(() => {
  app.setAppUserModelId('com.quazzy.dinogame');
  setupIpcHandlers();
  setApplicationMenu('en'); // Ставим дефолтное меню
  createWindow();

  // Обработчик для macOS
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Закрываем приложение, когда все окна закрыты
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});