(() => {
    // Détection de la langue
    const langButton = document.getElementById("lang-selector");
    const langText = langButton?.querySelector("#lang-name")?.textContent || "";
    const isFrench = langText.toLowerCase().includes("français");

    const t = {
        requiredPlayersLabel: isFrench ? "Joueurs requis pour démarrer :" : "Required Players To Auto-Start :",
        tagPlaceholder: isFrench ? "Tag" : "Tag",
        infoTitle: isFrench ? "Clique pour plus d'infos" : "Click for more info",
        infoText: isFrench
            ? "Le tag permet d'être automatiquement mis en équipe avec d'autres joueurs qui ont le même tag."
            : "The tag lets you automatically team up with others using the same tag.",
        autoJoinModes: [
            { value: 'FFA', text: isFrench ? 'Chacun pour soi' : 'Free For All' },
            { value: '2 teams', text: '2 Teams' },
            { value: '3 teams', text: '3 Teams' },
            { value: '4 teams', text: '4 Teams' },
            { value: '5 teams', text: '5 Teams' },
            { value: '6 teams', text: '6 Teams' },
            { value: '7 teams', text: '7 Teams' },
            { value: 'Teams', text: isFrench ? 'Équipes' : 'Teams' },
        ],
    };

    // TAG AUTO-INJECT
    const container = document.querySelector('.container__row');
    const flagInput = container?.querySelector('flag-input');
    const usernameInput = container?.querySelector('username-input input[type="text"]');

    if (container && flagInput && usernameInput) {
        const tagWrapper = document.createElement('div');
        tagWrapper.style.display = 'flex';
        tagWrapper.style.alignItems = 'center';
        tagWrapper.style.marginRight = '8px';
        tagWrapper.style.position = 'relative';

        const infoButton = document.createElement('button');
        infoButton.type = 'button';
        infoButton.innerText = '❓';
        infoButton.title = t.infoTitle;
        infoButton.style.cssText = `
            width: 32px; height: 32px; padding: 0;
            border: 1px solid rgba(0,0,0,0.3);
            border-radius: 0.5rem;
            background-color: rgba(255, 255, 255, 0.7);
            cursor: pointer; font-size: 20px; line-height: 1;
            margin-right: 6px; user-select: none;
            display: flex; align-items: center; justify-content: center;
        `;

        const infoBox = document.createElement('div');
        infoBox.innerText = t.infoText;
        infoBox.style.cssText = `
            position: absolute; top: 120%; left: 50%;
            transform: translateX(-50%);
            width: 280px; padding: 12px 16px;
            border-radius: 12px;
            background-color: rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            color: #111827; font-size: 1rem;
            z-index: 9999; display: none;
        `;

        infoButton.addEventListener('click', (e) => {
            e.stopPropagation();
            infoBox.style.display = infoBox.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', () => {
            infoBox.style.display = 'none';
        });

        const tagInput = document.createElement('input');
        tagInput.type = 'text';
        tagInput.placeholder = t.tagPlaceholder;
        tagInput.maxLength = 4;
        tagInput.minLength = 2;
        tagInput.style.cssText = `
            width: 80px; padding: 8px 12px;
            font-size: 1.25rem; text-align: center;
            border: 1px solid #d1d5db;
            border-radius: 0.75rem;
            background-color: rgba(255, 255, 255, 0.7);
            color: #111827; outline: none;
        `;

        tagInput.addEventListener('focus', () => {
            tagInput.style.boxShadow = '0 0 0 2px rgb(59 130 246 / 0.5)';
        });
        tagInput.addEventListener('blur', () => {
            tagInput.style.boxShadow = '';
            updateUsername();
        });

        let typingTimer;
        tagInput.addEventListener('input', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(updateUsername, 500);
        });

        tagWrapper.appendChild(infoButton);
        tagWrapper.appendChild(tagInput);
        tagWrapper.appendChild(infoBox);
        container.insertBefore(tagWrapper, flagInput);

        function updateUsername() {
            const tag = tagInput.value.trim();
            let baseName = usernameInput.value;
            baseName = baseName.replace(/^\[[^\]]+\]\s*/, '');

            if (tag.length >= 2 && tag.length <= 4) {
                const newValue = `[${tag}] ${baseName}`;
                usernameInput.value = newValue;
                usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
                usernameInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter', keyCode: 13 }));
            } else {
                usernameInput.value = baseName;
                usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        usernameInput.addEventListener('input', () => {
            const match = usernameInput.value.match(/^\[([^\]]{2,4})\]\s*/);
            tagInput.value = match ? match[1] : '';
        });
    }

    // AUTOJOIN MODULE
    (function () {
        const AUTO_JOIN_STORAGE_KEY = 'openfront_auto_join_modes';

        function createAutoJoinButtons() {
            const langSelector = document.querySelector('lang-selector');
            if (!langSelector) return;

            const container = document.createElement('div');
            container.style.cssText = `
                margin-top: 12px; display: flex; flex-wrap: wrap;
                justify-content: center; gap: 8px;
            `;

            const savedModes = JSON.parse(localStorage.getItem(AUTO_JOIN_STORAGE_KEY) || '[]');

            function saveModes() {
                localStorage.setItem(AUTO_JOIN_STORAGE_KEY, JSON.stringify(savedModes));
            }

            function updateStyles() {
                buttons.forEach(btn => {
                    if (savedModes.includes(btn.dataset.value)) {
                        btn.style.backgroundColor = '#3b82f6';
                        btn.style.color = 'white';
                        btn.style.borderColor = '#2563eb';
                    } else {
                        btn.style.backgroundColor = 'white';
                        btn.style.color = '#000';
                        btn.style.borderColor = '#ccc';
                    }
                });
            }

            const buttons = t.autoJoinModes.map(mode => {
                const btn = document.createElement('button');
                btn.textContent = mode.text;
                btn.dataset.value = mode.value;
                btn.style.cssText = `
                    padding: 8px 16px; border-radius: 8px;
                    border: 1px solid #ccc; cursor: pointer;
                    font-size: 1rem;
                `;
                btn.addEventListener('click', () => {
                    const idx = savedModes.indexOf(mode.value);
                    if (idx === -1) savedModes.push(mode.value);
                    else savedModes.splice(idx, 1);
                    saveModes();
                    updateStyles();
                    scanAndJoin();
                });
                container.appendChild(btn);
                return btn;
            });

            updateStyles();
            langSelector.parentElement.insertBefore(container, langSelector.nextSibling);
        }

        function clickLobbyDiv(lobbyElement) {
            const clickableDiv = lobbyElement.querySelector('div.flex.flex-col.justify-between.h-full.col-span-full.row-span-full.p-4.md\\:p-6.text-right.z-0');
            if (clickableDiv) clickableDiv.click();
        }

        function scanAndJoin() {
            const savedModes = JSON.parse(localStorage.getItem(AUTO_JOIN_STORAGE_KEY) || '[]');
            if (savedModes.length === 0) return;

            const lobbies = document.querySelectorAll('public-lobby');
            for (const mode of savedModes) {
                for (const lobby of lobbies) {
                    const modeSpan = lobby.querySelector('div.text-md.font-medium.text-blue-100 > span.text-sm');
                    if (!modeSpan) continue;
                    const text = modeSpan.textContent.trim().toLowerCase();
                    if (
                        (mode === 'FFA' && text.includes('free for all')) ||
                        (mode === 'Teams' && text.includes('team')) ||
                        (mode !== 'FFA' && mode !== 'Teams' && text === mode.toLowerCase())
                    ) {
                        clickLobbyDiv(lobby);
                        return;
                    }
                }
            }
        }

        function startAutoJoinLoop() {
            setInterval(scanAndJoin, 2000);
        }

        createAutoJoinButtons();
        scanAndJoin();
        startAutoJoinLoop();
    })();

    // AUTO START GAME
    (function autoStartGameWhenFull() {
        const CHECK_INTERVAL_MS = 1000;

        function countPlayers() {
            const players = document.querySelectorAll('.players-list span.player-tag');
            return players.length;
        }

        function injectUI(lobbyBox) {
            if (document.querySelector('.auto-start-container')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'auto-start-container';
            wrapper.style.cssText = 'display: flex; align-items: center; margin-top: 10px; gap: 8px;';

            const label = document.createElement('label');
            label.textContent = t.requiredPlayersLabel;
            label.style.fontSize = '14px';

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '999';
            input.value = '999';
            input.className = 'player-threshold-input';
            input.style.cssText = 'width: 60px; padding: 4px 6px; border: 1px solid #ccc; border-radius: 6px;';

            wrapper.appendChild(label);
            wrapper.appendChild(input);
            lobbyBox.appendChild(wrapper);

            const interval = setInterval(() => {
                const expected = parseInt(input.value, 10);
                const current = countPlayers();

                if (current >= expected) {
                    const startBtn = document.querySelector('.start-game-button');
                    if (startBtn) {
                        startBtn.click();
                        clearInterval(interval);
                    }
                }
            }, CHECK_INTERVAL_MS);
        }

        const tryInterval = setInterval(() => {
            const lobbyBox = document.querySelector('.lobby-id-box');
            if (lobbyBox) {
                clearInterval(tryInterval);
                injectUI(lobbyBox);
            }
        }, 500);
    })();
})();
(function () {
    const statsKey = 'openfrontStats';
    const playedURLsKey = 'openfrontPlayedURLs';

    const getLang = () => {
        const langText = document.getElementById('lang-name')?.textContent?.toLowerCase();
        return langText?.includes('fr') ? 'fr' : 'en';
    };

    const translations = {
        fr: {
            stats: 'Statistiques',
            noData: "Veuillez lancer une partie pour commencer l'expérience des statistiques",
            gamesPlayed: 'Parties jouées',
            wins: 'Victoires',
            winRate: 'Pourcentage de victoires'
        },
        en: {
            stats: 'Stats',
            noData: 'Please play a game to begin tracking statistics',
            gamesPlayed: 'Games Played',
            wins: 'Wins',
            winRate: 'Win Rate'
        }
    };

    let currentGameURL = null;
    let observer = null;

    const loadStats = () => JSON.parse(localStorage.getItem(statsKey)) || {
        gamesPlayed: 0,
        wins: 0
    };

    const saveStats = (stats) => localStorage.setItem(statsKey, JSON.stringify(stats));

    const loadPlayedURLs = () => JSON.parse(localStorage.getItem(playedURLsKey)) || [];
    const savePlayedURLs = (urls) => localStorage.setItem(playedURLsKey, JSON.stringify(urls));

    const createStatsButton = () => {
        const lang = getLang();
        const t = translations[lang];

        const logoutButton = document.querySelector('o-button#logout-discord button');
        if (!logoutButton || document.getElementById('stats-button')) return;

        const statsBtn = document.createElement('button');
        statsBtn.id = 'stats-button';
        statsBtn.className = 'c-button c-button--block';
        statsBtn.style.marginTop = '8px';
        statsBtn.textContent = t.stats;
        statsBtn.onclick = () => showStats();

        logoutButton.parentElement.insertAdjacentElement('afterend', statsBtn);
    };

    const showStats = () => {
        const lang = getLang();
        const t = translations[lang];
        const stats = loadStats();
        const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

        alert(
            stats.gamesPlayed === 0
                ? t.noData
                : `${t.gamesPlayed}: ${stats.gamesPlayed}\n${t.wins}: ${stats.wins}\n${t.winRate}: ${winRate}%`
        );
    };

    const detectWinOrLoss = () => {
        if (observer) observer.disconnect();

        observer = new MutationObserver(() => {
            const winModal = document.querySelector('.win-modal.visible');
            if (winModal) {
                const title = winModal.querySelector('h2')?.textContent;
                if (!title) return;

                const isWin = title.includes('You Won!') || title.includes('Victoire') || title.includes('Gagné');

                const stats = loadStats();
                if (isWin) stats.wins++;
                saveStats(stats);
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    };

    const checkGameState = () => {
        const url = window.location.href;

        if (url.includes('/join/') && !currentGameURL) {
            const playedURLs = loadPlayedURLs();
            if (playedURLs.includes(url)) {
                currentGameURL = url;
                return;
            }

            currentGameURL = url;
            playedURLs.push(url);
            savePlayedURLs(playedURLs);

            const stats = loadStats();
            stats.gamesPlayed++;
            saveStats(stats);

            detectWinOrLoss();
        }

        if (!url.includes('/join/') && currentGameURL) {
            currentGameURL = null;
        }
    };

    const mainLoop = () => {
        createStatsButton();
        checkGameState();
    };

    const init = () => {
        setInterval(mainLoop, 1000);
    };

    window.addEventListener('load', init);
})();