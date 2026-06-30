document.addEventListener('DOMContentLoaded', () => {
    // 0. Reset Scroll on Refresh
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // 1. Door Opening Animation
    const btnOpen = document.getElementById('btnOpen');
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContent = document.getElementById('mainContent');
    
    if (btnOpen && loadingScreen && mainContent) {
        btnOpen.addEventListener('click', () => {
            loadingScreen.classList.add('doors-opening');
            
            // Instant reveal
            setTimeout(() => {
                mainContent.classList.add('visible');
                document.body.classList.add('can-scroll'); // Enable scroll
                // Optional: hide loading screen completely after it's faded out
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 3000); 
            }, 100); // Instant reveal timing

            // Auto play music when doors open
            const bgMusic = document.getElementById('bgMusic');
            if (bgMusic && bgMusic.paused) {
                bgMusic.play().catch(e => console.log("Audio autoplay prevented"));
                updateMusicIcon(true);
            }
        });
    }

    // 2. Countdown Timer
    const birthdayDate = new Date('July 1, 2026 00:00:00');

    function updateCountdown() {
        const now = new Date();
        const diff = birthdayDate - now;

        if (diff <= 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            
            const timerMsg = document.getElementById('timerMessage');
            if (timerMsg) timerMsg.classList.remove('hidden');
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        
        const timerMsg = document.getElementById('timerMessage');
        if (timerMsg) timerMsg.classList.add('hidden');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // 3. Scratch Card Logic
    const canvas = document.getElementById('scratchCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        // Set canvas size
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;

        // Fill with rose gold cover
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#e5b3a3'); // Rose Gold
        gradient.addColorStop(1, '#b88a7b'); // Dark Rose Gold
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add text on top of scratch cover
        ctx.fillStyle = '#1a0b2e'; // Deep Purple
        ctx.font = '22px Cinzel';
        ctx.textAlign = 'center';
        ctx.fillText('Scratch for Love', canvas.width / 2, canvas.height / 2 + 5);

        ctx.globalCompositeOperation = 'destination-out';

        function getMousePos(canvas, evt) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (evt.clientX || evt.touches[0].clientX) - rect.left,
                y: (evt.clientY || evt.touches[0].clientY) - rect.top
            };
        }

        function scratch(e) {
            if (!isDrawing) return;
            e.preventDefault();
            const pos = getMousePos(canvas, e);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 24, 0, Math.PI * 2);
            ctx.fill();
            checkRevealProgress();
        }

        function getClearedPercentage() {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let clearedPixels = 0;
            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] < 128) clearedPixels += 1;
            }
            return clearedPixels / (canvas.width * canvas.height);
        }

        function triggerBirthdayReveal() {
            if (window.birthdayRevealed) return;
            window.birthdayRevealed = true;
            document.body.classList.add('birthday-theme');
            const overlay = document.getElementById('birthdayOverlay');
            overlay.classList.remove('hidden');
            overlay.classList.add('visible');
            createConfetti();
            setTimeout(() => {
                overlay.classList.remove('visible');
                overlay.classList.add('hidden');
            }, 4500);
        }

        function checkRevealProgress() {
            if (window.birthdayRevealed) return;
            const cleared = getClearedPercentage();
            if (cleared > 0.18) {
                triggerBirthdayReveal();
            }
        }

        function createConfetti() {
            const confettiContainer = document.getElementById('confetti-container');
            if (!confettiContainer) return;
            const colors = ['#ff5f7d', '#ffcf44', '#6ef2d9', '#948cff', '#ffffff'];
            for (let i = 0; i < 60; i++) {
                const piece = document.createElement('div');
                piece.className = 'confetti-piece';
                piece.style.background = colors[Math.floor(Math.random() * colors.length)];
                piece.style.left = Math.random() * 100 + '%';
                piece.style.top = Math.random() * -20 + '%';
                piece.style.width = `${8 + Math.random() * 8}px`;
                piece.style.height = `${14 + Math.random() * 12}px`;
                piece.style.animationDuration = `${2 + Math.random() * 1.2}s`;
                piece.style.animationDelay = `${Math.random() * 0.5}s`;
                piece.style.transform = `rotate(${Math.random() * 360}deg)`;
                confettiContainer.appendChild(piece);
                piece.addEventListener('animationend', () => piece.remove());
            }
        }

        canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseleave', () => isDrawing = false);

        // Touch support
        canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('touchmove', scratch);
        canvas.addEventListener('touchend', () => isDrawing = false);
    }

    // 4. Music Toggle Logic
    const musicBtn = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    
    function updateMusicIcon(isPlaying) {
        musicBtn.innerHTML = isPlaying 
            ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
    }

    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play();
                updateMusicIcon(true);
            } else {
                bgMusic.pause();
                updateMusicIcon(false);
            }
        });
    }
    
    // 5. Floating Birthday Elements
    function createFloatingElements() {
        const container = document.getElementById('floatingElements');
        if (!container) return;
        
        const icons = ['🎈', '🎂', '🎁', '🎉', '✨', '💖'];
        const count = 15;
        
        for (let i = 0; i < count; i++) {
            const item = document.createElement('div');
            item.className = 'float-item';
            item.textContent = icons[Math.floor(Math.random() * icons.length)];
            
            // Random properties
            const left = Math.random() * 100 + 'vw';
            const delay = Math.random() * 20 + 's';
            const duration = 15 + Math.random() * 15 + 's';
            const size = 1 + Math.random() * 1.5 + 'rem';
            
            item.style.left = left;
            item.style.animationDelay = delay;
            item.style.animationDuration = duration;
            item.style.fontSize = size;
            
            container.appendChild(item);
        }
    }
    
    createFloatingElements();
    
    // 6. Scroll Reveal Observer
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });
});
