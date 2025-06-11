(() => {
    const container = document.querySelector('.container__row');
    const flagInput = container?.querySelector('flag-input');
    const usernameInput = container?.querySelector('username-input input[type="text"]');

    if (!container || !flagInput || !usernameInput) {
        console.warn('Éléments attendus non trouvés');
        return;
    }

    const tagWrapper = document.createElement('div');
    tagWrapper.style.display = 'flex';
    tagWrapper.style.alignItems = 'center';
    tagWrapper.style.marginRight = '8px';
    tagWrapper.style.position = 'relative';

    const infoButton = document.createElement('button');
    infoButton.type = 'button';
    infoButton.innerText = '❓';
    infoButton.title = 'Clique pour plus d\'infos';
    infoButton.style.cssText = `
        width: 32px;
        height: 32px;
        padding: 0;
        border: 1px solid rgba(0,0,0,0.3);
        border-radius: 0.5rem;
        background-color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
        margin-right: 6px;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const infoBox = document.createElement('div');
    infoBox.innerText = "Le tag permet d'être automatiquement mis en équipe avec d'autres joueurs qui ont le même tag.";
    infoBox.style.cssText = `
        position: absolute;
        top: 120%;
        left: 50%;
        transform: translateX(-50%);
        width: 280px;
        padding: 12px 16px;
        border-radius: 12px;
        background-color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        color: #111827;
        font-size: 1rem;
        z-index: 9999;
        display: none;
        user-select: text;
        pointer-events: auto;
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
    tagInput.placeholder = 'Tag';
    tagInput.maxLength = 4;
    tagInput.minLength = 2;
    tagInput.style.cssText = `
        width: 80px;
        padding: 8px 12px;
        font-size: 1.25rem;
        text-align: center;
        border: 1px solid #d1d5db;
        border-radius: 0.75rem;
        box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
        background-color: rgba(255, 255, 255, 0.7);
        color: #111827;
        outline: none;
        transition: box-shadow 0.2s ease;
    `;

    tagInput.addEventListener('focus', () => {
        tagInput.style.boxShadow = '0 0 0 2px rgb(59 130 246 / 0.5)';
        tagInput.style.borderColor = 'rgb(59 130 246)';
    });

    tagInput.addEventListener('blur', () => {
        tagInput.style.boxShadow = '0 1px 2px rgb(0 0 0 / 0.05)';
        tagInput.style.borderColor = '#d1d5db';

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

            const enterEvent = new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: 'Enter',
                code: 'Enter',
                which: 13,
                keyCode: 13
            });
            usernameInput.dispatchEvent(enterEvent);

        } else {
            usernameInput.value = baseName;
            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    usernameInput.addEventListener('input', () => {
        const match = usernameInput.value.match(/^\[([^\]]{2,4})\]\s*/);
        if (match) {
            tagInput.value = match[1];
        } else {
            tagInput.value = '';
        }
    });
})();
(function () {
    const AUTO_JOIN_STORAGE_KEY = 'openfront_auto_join_modes'; // Note le pluriel

    function createAutoJoinButtons() {
        const langSelector = document.querySelector('lang-selector');
        if (!langSelector) {
            console.warn('[AutoJoin] Lang selector introuvable');
            return null;
        }

        const container = document.createElement('div');
        container.style.marginTop = '12px';
        container.style.textAlign = 'center';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '8px';
        container.style.justifyContent = 'center';

        const modes = [
            { value: 'FFA', text: 'Free For All' },
            { value: '2 teams', text: '2 Teams' },
            { value: '3 teams', text: '3 Teams' },
            { value: '4 teams', text: '4 Teams' },
            { value: '5 teams', text: '5 Teams' },
            { value: '6 teams', text: '6 Teams' },
            { value: '7 teams', text: '7 Teams' },
            { value: 'Teams', text: 'Teams' },
        ];

        // Récupérer les modes sauvegardés (array)
        let savedModes = JSON.parse(localStorage.getItem(AUTO_JOIN_STORAGE_KEY) || '[]');

        function saveModes() {
            localStorage.setItem(AUTO_JOIN_STORAGE_KEY, JSON.stringify(savedModes));
        }

        function updateButtonStyles() {
            buttons.forEach(btn => {
                if (savedModes.includes(btn.dataset.value)) {
                    btn.style.backgroundColor = '#3b82f6'; // bleu
                    btn.style.color = 'white';
                    btn.style.borderColor = '#2563eb';
                } else {
                    btn.style.backgroundColor = 'white';
                    btn.style.color = '#000';
                    btn.style.borderColor = '#ccc';
                }
            });
        }

        const buttons = modes.map(mode => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = mode.text;
            btn.dataset.value = mode.value;
            btn.style.padding = '8px 16px';
            btn.style.borderRadius = '8px';
            btn.style.border = '1px solid #ccc';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '1rem';
            btn.style.userSelect = 'none';
            btn.style.transition = 'background-color 0.2s, color 0.2s, border-color 0.2s';

            btn.addEventListener('click', () => {
                const val = btn.dataset.value;
                const idx = savedModes.indexOf(val);
                if (idx === -1) {
                    savedModes.push(val);
                } else {
                    savedModes.splice(idx, 1);
                }
                saveModes();
                updateButtonStyles();
                scanAndJoin();
            });

            return btn;
        });

        buttons.forEach(btn => container.appendChild(btn));

        // Initial style update
        updateButtonStyles();

        langSelector.parentElement.insertBefore(container, langSelector.nextSibling);

        return buttons;
    }

    function clickLobbyDiv(lobbyElement) {
        const clickableDiv = lobbyElement.querySelector('div.flex.flex-col.justify-between.h-full.col-span-full.row-span-full.p-4.md\\:p-6.text-right.z-0');
        if (clickableDiv) {
            clickableDiv.click();
            console.log('[AutoJoin] Partie rejointe automatiquement.');
        } else {
            console.warn('[AutoJoin] Div cliquable non trouvé dans public-lobby');
        }
    }

    function getJoinedLobby() {
        return document.querySelector('public-lobby.joined') || null;
    }

    function quitCurrentLobby() {
        const joinedLobby = getJoinedLobby();
        if (joinedLobby) {
            console.log('[AutoJoin] Quitter lobby actuel');
            clickLobbyDiv(joinedLobby);
        }
    }

    function scanAndJoin() {
        const savedModes = JSON.parse(localStorage.getItem(AUTO_JOIN_STORAGE_KEY) || '[]');
        if (savedModes.length === 0) return;

        const lobbies = document.querySelectorAll('public-lobby');
        // On tente de rejoindre la première partie qui correspond au premier mode sélectionné
        for (const mode of savedModes) {
            for (const lobby of lobbies) {
                const modeSpan = lobby.querySelector('div.text-md.font-medium.text-blue-100 > span.text-sm.text-blue-600.bg-white.rounded-sm.px-1');
                if (!modeSpan) continue;

                const modeText = modeSpan.textContent.trim().toLowerCase();

                if (
                    (mode === 'FFA' && modeText.includes('free for all')) ||
                    (mode === 'Teams' && modeText.includes('team')) ||
                    (mode !== 'FFA' && mode !== 'Teams' && modeText === mode.toLowerCase())
                ) {
                    clickLobbyDiv(lobby);
                    return; // Quitte après avoir rejoint une partie
                }
            }
        }
    }

    function startAutoJoinLoop() {
        setInterval(() => {
            scanAndJoin();
        }, 2000);
    }

    function init() {
        createAutoJoinButtons();
        scanAndJoin();
        startAutoJoinLoop();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
(function autoStartGameWhenFull() {
    const CHECK_INTERVAL_MS = 1000;

    function countPlayers() {
        const playerLists = document.querySelectorAll('.players-list');
        if (!playerLists.length) return 0;

        const playerTags = playerLists[0].querySelectorAll('span.player-tag');
        return playerTags.length;
    }

    function injectUI(lobbyBox) {
        if (document.querySelector('.auto-start-container')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'auto-start-container';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.marginTop = '10px';
        wrapper.style.gap = '8px';

        const label = document.createElement('label');
        label.textContent = 'Required Players To Auto-Start :';
        label.style.fontSize = '14px';

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.max = '999';
        input.value = '999';
        input.className = 'player-threshold-input';
        input.style.width = '60px';
        input.style.padding = '4px 6px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '6px';

        wrapper.appendChild(label);
        wrapper.appendChild(input);

        lobbyBox.appendChild(wrapper);
    }

    function waitForLobbyBoxAndInject() {
        const lobbyBox = document.querySelector('.lobby-id-box');
        if (!lobbyBox) return;

        injectUI(lobbyBox);

        const interval = setInterval(() => {
            const input = document.querySelector('.player-threshold-input');
            if (!input) return;

            const expected = parseInt(input.value, 10);
            const current = countPlayers();

            console.log(`[AutoStart] ${current} joueur(s) détecté(s) / ${expected}`);

            if (current >= expected) {
                const startBtn = document.querySelector('.start-game-button');
                if (startBtn) {
                    console.log('[AutoStart] Lancement de la partie !');
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
            waitForLobbyBoxAndInject();
        }
    }, 500);
})();
