// ========================================
// RECEPTIVE AI USER COUNTER
// ========================================

// Configuration - Edit these values directly or use the admin panel
const CONFIG = {
    totalUsers: 247,      // Current total user count
    weeklyGrowth: 32,     // New users this week
    goal: 1000            // Target goal
};

// ========================================
// COUNTER ANIMATION
// ========================================

class AnimatedCounter {
    constructor(element, targetValue, duration = 2000) {
        this.element = element;
        this.targetValue = targetValue;
        this.duration = duration;
        this.startValue = 0;
        this.startTime = null;
    }

    easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    formatNumber(num) {
        return num.toLocaleString();
    }

    animate(timestamp) {
        if (!this.startTime) this.startTime = timestamp;
        
        const progress = Math.min((timestamp - this.startTime) / this.duration, 1);
        const easedProgress = this.easeOutExpo(progress);
        const currentValue = Math.floor(this.startValue + (this.targetValue - this.startValue) * easedProgress);
        
        this.element.textContent = this.formatNumber(currentValue);
        this.element.classList.add('counting');
        
        if (progress < 1) {
            requestAnimationFrame((ts) => this.animate(ts));
        } else {
            this.element.classList.remove('counting');
        }
    }

    start() {
        requestAnimationFrame((ts) => this.animate(ts));
    }

    updateTarget(newTarget) {
        this.startValue = parseInt(this.element.textContent.replace(/,/g, '')) || 0;
        this.targetValue = newTarget;
        this.startTime = null;
        this.start();
    }
}

// ========================================
// CONFETTI EFFECT
// ========================================

class Confetti {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(x, y) {
        return {
            x,
            y,
            vx: (Math.random() - 0.5) * 20,
            vy: Math.random() * -15 - 5,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            size: Math.random() * 10 + 5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            gravity: 0.5,
            opacity: 1,
            decay: 0.015
        };
    }

    burst(x, y, count = 100) {
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(x, y));
        }
        this.animate();
    }

    celebrate() {
        // Multiple bursts across the screen
        const positions = [
            { x: this.canvas.width * 0.2, y: this.canvas.height * 0.3 },
            { x: this.canvas.width * 0.5, y: this.canvas.height * 0.2 },
            { x: this.canvas.width * 0.8, y: this.canvas.height * 0.3 }
        ];

        positions.forEach((pos, i) => {
            setTimeout(() => this.burst(pos.x, pos.y, 80), i * 200);
        });
    }

    animate() {
        if (this.particles.length === 0) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0) return false;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation * Math.PI / 180);
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            this.ctx.restore();

            return true;
        });

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// ========================================
// LOCAL STORAGE
// ========================================

function saveData(data) {
    localStorage.setItem('receptive-counter-data', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('receptive-counter-data');
    if (saved) {
        return JSON.parse(saved);
    }
    return CONFIG;
}

// ========================================
// UI UPDATES
// ========================================

function updateUI(data, counter, animate = true) {
    // Update counter
    if (animate) {
        counter.updateTarget(data.totalUsers);
    } else {
        document.getElementById('counter').textContent = data.totalUsers.toLocaleString();
    }

    // Update stats
    document.getElementById('weekly-growth').textContent = '+' + data.weeklyGrowth.toLocaleString();
    document.getElementById('goal').textContent = data.goal.toLocaleString();
    
    const progressPercent = Math.min((data.totalUsers / data.goal) * 100, 100);
    document.getElementById('progress').textContent = Math.round(progressPercent) + '%';
    
    // Animate progress bar
    setTimeout(() => {
        document.getElementById('progress-bar').style.width = progressPercent + '%';
    }, 500);

    // Update input fields
    document.getElementById('user-count').value = data.totalUsers;
    document.getElementById('weekly-input').value = data.weeklyGrowth;
    document.getElementById('goal-input').value = data.goal;
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Load saved data or use defaults
    const data = loadData();
    
    // Initialize counter
    const counterElement = document.getElementById('counter');
    const counter = new AnimatedCounter(counterElement, data.totalUsers, 2500);
    
    // Initialize confetti
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confetti = new Confetti(confettiCanvas);

    // Initial animation
    setTimeout(() => {
        counter.start();
        updateUI(data, counter, false);
    }, 300);

    // Admin panel toggle
    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    
    adminToggle.addEventListener('click', () => {
        adminPanel.classList.toggle('hidden');
    });

    // Update button
    document.getElementById('update-btn').addEventListener('click', () => {
        const newData = {
            totalUsers: parseInt(document.getElementById('user-count').value) || 0,
            weeklyGrowth: parseInt(document.getElementById('weekly-input').value) || 0,
            goal: parseInt(document.getElementById('goal-input').value) || 1000
        };

        saveData(newData);
        updateUI(newData, counter, true);

        // Mini celebration for updates
        confetti.burst(window.innerWidth / 2, window.innerHeight / 3, 30);
    });

    // Celebrate button
    document.getElementById('celebrate-btn').addEventListener('click', () => {
        confetti.celebrate();
    });

    // Close admin panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!adminPanel.contains(e.target) && !adminToggle.contains(e.target)) {
            adminPanel.classList.add('hidden');
        }
    });

    // Keyboard shortcut: Press 'c' to celebrate
    document.addEventListener('keydown', (e) => {
        if (e.key === 'c' && !e.target.matches('input')) {
            confetti.celebrate();
        }
    });
});
