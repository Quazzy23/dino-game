; --- Скрипт профессионального установщика для Dino-Game ---

#define MyAppName "Dino-Game"
#define FullVersion GetFileVersion("dist\win-unpacked\Dino-Game.exe")
; Отрезаем последние два символа (это всегда будет ".0")
#define MyAppVersion Copy(FullVersion, 1, Len(FullVersion) - 2)
#define MyAppPublisher "Quazzy"
#define MyAppExeName "Dino-Game.exe"

[Setup]
; Уникальный ID проекта
AppId={{61338E10-5AC4-41F6-8370-9962DF927386}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName}
AppPublisher={#MyAppPublisher}

; --- НАСТРОЙКИ ПАМЯТИ И ЛОГИКИ ---
UsePreviousAppDir=no
UsePreviousTasks=no
UsePreviousLanguage=no

; Окно приветствия
DisableWelcomePage=no

; Лицензионное соглашение (твой угарный текст)
LicenseFile=D:\Code\Quazzy Inc\dino-game\license.txt

; Настройки папки установки (C:\Program Files\Quazzy\Dino-Game)
DefaultDirName={autopf}\Quazzy\{#MyAppName}
DefaultGroupName=Quazzy\{#MyAppName}
DisableProgramGroupPage=yes
DirExistsWarning=no

; Пути к иконкам и выходному файлу
SetupIconFile=D:\Code\Quazzy Inc\dino-game\images\icon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
OutputDir=D:\Code\Quazzy Inc\dino-game\dist
OutputBaseFilename=Dino-Game Setup {#MyAppVersion}

; === КРАСОТА: Изображения инсталлятора ===
WizardStyle=modern
; Большая картинка слева (164x314 BMP)
WizardImageFile=D:\Code\Quazzy Inc\dino-game\images\installerSidebar.bmp
; Маленькая картинка в углу (150x57 BMP)
WizardSmallImageFile=D:\Code\Quazzy Inc\dino-game\images\installerHeader.bmp

; Сжатие и архитектура
Compression=lzma2
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
; Теперь Английский - главный запасной вариант
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[CustomMessages]
; Эти строки нужны, так как это твоя уникальная задача (Task)
english.CreateStartMenuIcon=Create a &Start Menu shortcut
russian.CreateStartMenuIcon=Создать ярлык в меню &Пуск

[Tasks]
; === ГАЛОЧКИ ДЛЯ ЯРЛЫКОВ ===
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "startmenuicon"; Description: "{cm:CreateStartMenuIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; Копируем ВСЕ файлы из папки Electron, сохраняя структуру (Resources/app с открытым кодом)
Source: "D:\Code\Quazzy Inc\dino-game\dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Ярлык в меню Пуск (создается только если стоит галочка)
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startmenuicon
; Ярлык на Рабочем столе (создается только если стоит галочка)
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
; Окно завершения с галочкой "Запустить игру"
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Messages]
; --- РУССКИЙ ---
russian.ConfirmUninstall=Вас приветствует мастер удаления {#MyAppName}.%n%nПрограмма полностью удалит игру с вашего компьютера. Вы действительно хотите продолжить?
russian.UninstalledMost=Удаление {#MyAppName} завершено успешно!%nМастер удаления завершил свою работу.
russian.UninstalledAll=Удаление {#MyAppName} завершено успешно!%nМастер удаления завершил свою работу.

; --- АНГЛИЙСКИЙ ---
english.ConfirmUninstall=Welcome to the {#MyAppName} Uninstall Wizard.%n%nThis will completely remove the game from your computer. Do you want to continue?
english.UninstalledMost={#MyAppName} was successfully removed.%nThe Uninstall Wizard has finished its work.
english.UninstalledAll={#MyAppName} was successfully removed.%nThe Uninstall Wizard has finished its work.