function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container') || (() => {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    })();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check' : 'fa-exclamation-circle'}"></i>${message}`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function copyScript(button) {
    try {
        const codeElement = button.parentElement.querySelector('code') || button.parentElement.querySelector('input');
        const textArea = document.createElement('textarea');
        textArea.value = codeElement.textContent || codeElement.value;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        // Visual feedback
        button.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);

        showToast('Copied to clipboard!', 'success');
    } catch (error) {
        showToast('Failed to copy text', 'error');
    }
}

// Theme and color management
function setLocalStorage(name, value) {
    localStorage.setItem(name, value);
}

function getLocalStorage(name) {
    return localStorage.getItem(name);
}

function isColorLight(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
}

function updateTextColors(color) {
    const isLight = isColorLight(color);
    const isDark = isColorDark(color);
    document.documentElement.style.setProperty('--text-color', isLight ? '#000000' : '#ffffff');
    
    // Update all icons
    document.querySelectorAll('i').forEach(icon => {
        if (color === '#ffffff' || color === '#FFFFFF') {
            icon.style.color = '#000000';
        } else if (color === '#000000') {
            icon.style.color = '#ffffff';
        } else {
            icon.style.color = color;
        }
    });
    
    // Update menu items and headings text color
    document.querySelectorAll('.menu a, h1, h2, h3, .bio-text, .menu-header h3').forEach(item => {
        if (isDark) {
            item.style.color = '#ffffff';
        } else if (isLight) {
            item.style.color = '#000000';
        } else {
            item.style.color = color;
        }
    });
    
    // Update specific elements that need contrast
    document.querySelectorAll('.color-picker span, .theme-toggle span, .tool-explanation').forEach(element => {
        element.style.color = isDark ? '#ffffff' : (isLight ? '#000000' : '#ffffff');
    });
}

function isColorDark(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness < 50;
}

function initializeSettings() {
    const themeSwitch = document.querySelector('.theme-switch');
    const root = document.documentElement;
    
    // Load saved settings
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Function to update icon colors based on theme
    function updateIconColors(theme) {
        document.querySelectorAll('i').forEach(icon => {
            // Skip icons that should maintain their color
            if (!icon.closest('.social-links') && !icon.closest('.feature')) {
                icon.style.color = theme === 'light' ? '#333' : '#fff';
            }
        });
    }

    // Single event listener for theme switch
    themeSwitch.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Toggle active class for the switch
        themeSwitch.classList.toggle('active');
        
        // Update theme label
        const themeLabel = document.querySelector('.current-theme');
        themeLabel.textContent = `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Mode`;
        themeLabel.style.color = newTheme === 'light' ? '#333' : '#fff';
        
        // Update icons for the new theme
        updateIconColors(newTheme);
    });

    // Set initial state of the switch and theme label color
    const initialTheme = document.body.getAttribute('data-theme');
    if (initialTheme === 'light') {
        themeSwitch.classList.add('active');
        document.querySelector('.current-theme').style.color = '#333';
    }

    // Initialize icon colors on page load
    updateIconColors(document.body.getAttribute('data-theme'));

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    }

    function adjustColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
    }
}

// Add music functionality
let backgroundMusic;
let isPlaying = false;

function initializeMusic() {
    try {
        backgroundMusic = new Audio();
        backgroundMusic.src = '2pac feat. the notorious b.i.g. & eazy-e & ice cube - write this down.mp3';
        backgroundMusic.loop = true;
        backgroundMusic.preload = 'auto';
        
        const musicBtn = document.getElementById('toggleMusic');
        const muteBtn = document.getElementById('muteButton');
        let isMuted = false;
        
        // Set initial volume
        backgroundMusic.volume = 1.0;

        // Handle mute toggle
        muteBtn.addEventListener('click', () => {
            if (backgroundMusic) {
                isMuted = !isMuted;
                backgroundMusic.muted = isMuted;
                muteBtn.innerHTML = isMuted ? 
                    '<i class="fas fa-volume-mute"></i>' : 
                    '<i class="fas fa-volume-up"></i>';
            }
        });

        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                backgroundMusic.pause();
                musicBtn.innerHTML = '<i class="fas fa-play"></i>';
                musicBtn.classList.remove('playing');
                isPlaying = false;
            } else {
                backgroundMusic.play().then(() => {
                    isPlaying = true;
                    musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    musicBtn.classList.add('playing');
                }).catch(error => {
                    console.error('Error playing audio:', error);
                    showToast('Error playing audio. Please try again.', 'error');
                });
            }
        });
    } catch (error) {
        console.error('Error initializing music:', error);
        showToast('Error initializing audio. Please try again.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeSettings();
    initializeMusic();
    const menuToggle = document.querySelector('.menu-toggle');
    const menuClose = document.querySelector('.menu-close');
    const menu = document.querySelector('.menu');
    const menuLinks = document.querySelectorAll('.menu a');

    function hideMenu() {
        menu.classList.remove('active');
        menuToggle.classList.remove('hidden');
    }

    function showMenu() {
        menu.classList.add('active');
        menuToggle.classList.add('hidden');
    }

    menuToggle.addEventListener('click', showMenu);
    menuClose.addEventListener('click', hideMenu);

    // Hide menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
            hideMenu();
        }
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!link.getAttribute('href').startsWith('https://')) {
                e.preventDefault();
            }
            hideMenu();
            const href = link.getAttribute('href');
            
            // Hide all containers first
            document.querySelectorAll('.profile-container, .server-status-container, .discord-tools-container, .scripts-container, .settings-container').forEach(container => {
                container.classList.remove('active');
                container.style.display = 'none';
            });

            // Show the selected container
            if (href === '#discord-status') {
                const serverStatus = document.querySelector('.server-status-container');
                serverStatus.classList.add('active');
                serverStatus.style.display = 'block';
            } else if (href === '#discord-tools') {
                e.preventDefault();
                const profileContainer = document.querySelector('.profile-container');
                const serverStatus = document.querySelector('.server-status-container');
                const discordTools = document.querySelector('.discord-tools-container');

                profileContainer.classList.add('hidden');
                profileContainer.classList.remove('active');
                serverStatus.classList.remove('active');
                discordTools.classList.add('active');
                discordTools.style.display = 'block';
            } else if (href === '#scripts') {
                const scriptsContainer = document.querySelector('.scripts-container');
                scriptsContainer.classList.add('active');
                scriptsContainer.style.display = 'block';
            } else if (href === '#my-bio') {
                const profileContainer = document.querySelector('.profile-container');
                profileContainer.classList.add('active');
                profileContainer.style.display = 'block';
            } else if (href === '#settings') {
                const settings = document.querySelector('.settings-container');
                settings.classList.add('active');
                settings.style.display = 'block';
            }
        });
    });

    // Timestamp generator functionality
    const timestampInput = document.getElementById('timestamp-input');
    if (timestampInput) {
        timestampInput.value = new Date().toISOString().slice(0, 16);
        if (!timestampInput.value) {
            showToast('Please select a date and time', 'error');
            document.querySelectorAll('.format-output').forEach(output => {
                output.value = 'Error: Date and time required';
                output.style.color = '#ff4444';
            });
            return;
        }

        function updateTimestamps() {
            const date = new Date(timestampInput.value);
            const timestamp = Math.floor(date.getTime() / 1000);

            document.getElementById('short-time').value = `<t:${timestamp}:t>`;
            document.getElementById('long-time').value = `<t:${timestamp}:T>`;
            document.getElementById('short-date').value = `<t:${timestamp}:d>`;
            document.getElementById('long-date').value = `<t:${timestamp}:D>`;
            document.getElementById('relative').value = `<t:${timestamp}:R>`;

            // Remove any existing dynamically added copy buttons
            document.querySelectorAll('.copy-timestamp').forEach(btn => btn.remove());
        }

        timestampInput.addEventListener('change', updateTimestamps);
        updateTimestamps();
    }

    // Webhook Message Sender
    const webhookSender = document.getElementById('send-webhook');
    if (webhookSender) {
        webhookSender.addEventListener('click', async () => {
            const url = document.getElementById('webhook-url').value;
            const username = document.getElementById('webhook-username').value;
            const content = document.getElementById('webhook-message').value;

            if (!url) {
                showToast('Please provide a webhook URL', 'error');
                return;
            }
            if (!content) {
                showToast('Please provide a message content', 'error');
                return;
            }
            if (!url.startsWith('https://discord.com/api/webhooks/')) {
                showToast('Invalid webhook URL format', 'error');
                return;
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username || undefined,
                        content: content
                    })
                });

                if (response.ok) {
                    showToast('Message sent successfully!', 'success');
                    document.getElementById('webhook-message').value = '';
                } else {
                    showToast('Failed to send message', 'error');
                }
            } catch (error) {
                showToast(`Error sending message: ${error.message}`, 'error');
            }
        });
    }

    // Message ID to Timestamp Converter
    const convertMessageId = document.getElementById('convert-message-id');
    if (convertMessageId) {
        convertMessageId.addEventListener('click', () => {
            const messageId = document.getElementById('message-id').value.trim();
            const messageTimeOutput = document.getElementById('message-time');
            if (!messageId) {
                showToast('Please enter a Message ID', 'error');
                messageTimeOutput.textContent = 'Error: Message ID is required';
                messageTimeOutput.style.color = '#ff4444';
                return;
            }
            
            try {
                if (!/^\d+$/.test(messageId)) {
                    throw new Error('Invalid Message ID format');
                }
                const timestamp = (BigInt(messageId) >> 22n) + 1420070400000n;
                const date = new Date(Number(timestamp));
                document.getElementById('message-time').textContent = date.toLocaleString();
                showToast('Timestamp generated successfully', 'success');
            } catch (error) {
                showToast('Invalid Message ID: Please enter a valid Discord Message ID', 'error');
                document.getElementById('message-time').textContent = '';
            }
        });
    }

    // Permission Calculator
    const calculatePermissions = document.getElementById('calculate-permissions');
    if (calculatePermissions) {
        calculatePermissions.addEventListener('click', () => {
            const permInput = document.getElementById('permission-number').value;
            const permissionList = document.getElementById('permission-list');
            if (!permInput) {
                showToast('Please enter a permission number', 'error');
                permissionList.innerHTML = '<div style="color: #ff4444;">Error: Permission number is required</div>';
                return;
            }
            try {
                const permNumber = BigInt(permInput);
                const permissions = {
                CREATE_INSTANT_INVITE: 1n << 0n,
                KICK_MEMBERS: 1n << 1n,
                BAN_MEMBERS: 1n << 2n,
                ADMINISTRATOR: 1n << 3n,
                MANAGE_CHANNELS: 1n << 4n,
                MANAGE_GUILD: 1n << 5n,
                ADD_REACTIONS: 1n << 6n,
                VIEW_AUDIT_LOG: 1n << 7n,
                PRIORITY_SPEAKER: 1n << 8n,
                STREAM: 1n << 9n,
                VIEW_CHANNEL: 1n << 10n,
                SEND_MESSAGES: 1n << 11n,
                MANAGE_MESSAGES: 1n << 12n,
                EMBED_LINKS: 1n << 14n,
                ATTACH_FILES: 1n << 15n,
                MENTION_EVERYONE: 1n << 17n,
                CONNECT: 1n << 20n,
                SPEAK: 1n << 21n,
                MUTE_MEMBERS: 1n << 22n,
                DEAFEN_MEMBERS: 1n << 23n,
                MOVE_MEMBERS: 1n << 24n,
                CHANGE_NICKNAME: 1n << 26n,
                MANAGE_NICKNAMES: 1n << 27n,
                MANAGE_ROLES: 1n << 28n,
                MANAGE_WEBHOOKS: 1n << 29n,
                MANAGE_EMOJIS: 1n << 30n,
            };

            const permissionList = document.getElementById('permission-list');
            permissionList.innerHTML = '';

            for (const [perm, value] of Object.entries(permissions)) {
                if ((permNumber & value) === value) {
                    const div = document.createElement('div');
                    div.textContent = perm.replace(/_/g, ' ');
                    permissionList.appendChild(div);
                }
            }
            showToast('Permissions calculated successfully', 'success');
            } catch (error) {
                showToast('Invalid permission number', 'error');
            }
        });
    }

    // Add back button functionality if needed
    document.addEventListener('click', (e) => {
        if (e.target.matches('.back-button')) {
            const profileContainer = document.querySelector('.profile-container');
            const serverStatus = document.querySelector('.server-status-container');

            serverStatus.classList.remove('active');
            profileContainer.classList.remove('hidden');
        }
    });
});