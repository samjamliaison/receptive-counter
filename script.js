// ========================================
// RECEPTIVE AI USER COUNTER
// ========================================

// Default Configuration
const DEFAULT_CONFIG = {
    totalUsers: 247,
    goal: 1000
};

// ========================================
// DATA MANAGEMENT
// ========================================

function getStorageData() {
    const saved = localStorage.getItem('receptive-counter-v2');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        totalUsers: DEFAULT_CONFIG.totalUsers,
        goal: DEFAULT_CONFIG.goal,
        history: []
    };
}

function saveStorageData(data) {
    localStorage.setItem('receptive-counter-v2', JSON.stringify(data));
}

function addHistoryEntry(change, newTotal, note = '') {
    const data = getStorageData();
    const entry = {
        timestamp: Date.now(),
        change: change,
        total: newTotal,
        note: note
    };
    data.history.unshift(entry); // Add to beginning
    // Keep last 100 entries
    if (data.history.length > 100) {
        data.history = data.history.slice(0, 100);
    }
    data.totalUsers = newTotal;
    saveStorageData(data);
    return data;
}

function getStatsFromHistory(history) {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

    let todayGrowth = 0;
    let weeklyGrowth = 0;

    history.forEach(entry => {
        if (entry.timestamp >= todayStart) {
            todayGrowth += entry.change;
        }
        if (entry.timestamp >= weekAgo) {
            weeklyGrowth += entry.change;
        }
    });

    return { todayGrowth, weeklyGrowth };
}

// ========================================
// COUNTER ANIMATION
// ========================================

class AnimatedCounter {
    constructor(element) {
        this.element = element;
        this.currentValue = 0;
    }

    formatNumber(num) {
        return num.toLocaleString();
    }

    animateTo(targetValue, duration = 1500) {
        const startValue = this.currentValue;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(startValue + (targetValue - startValue) * eased);
            
            this.element.textContent = this.formatNumber(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.currentValue = targetValue;
            }
        };
        
        requestAnimationFrame(animate);
    }

    setValue(value, animate = true) {
        if (animate && Math.abs(value - this.currentValue) > 0) {
            this.animateTo(value, Math.min(Math.abs(value - this.currentValue) * 50, 1500));
        } else {
            this.currentValue = value;
            this.element.textContent = this.formatNumber(value);
        }
    }

    pop() {
        this.element.classList.remove('pop');
        void this.element.offsetWidth; // Trigger reflow
        this.element.classList.add('pop');
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
            x, y,
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

    burst(x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(x, y));
        }
        if (this.particles.length === count) {
            this.animate();
        }
    }

    miniBurst() {
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 3;
        this.burst(x, y, 20);
    }

    celebrate() {
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
// UI MANAGEMENT
// ========================================

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function renderHistory(history) {
    const container = document.getElementById('history-list');
    
    if (history.length === 0) {
        container.innerHTML = '<div class="history-empty">No activity yet. Start adding users!</div>';
        return;
    }

    container.innerHTML = history.slice(0, 20).map(entry => `
        <div class="history-item">
            <span class="time">${formatTime(entry.timestamp)}</span>
            <span class="change ${entry.change >= 0 ? 'positive' : 'negative'}">
                ${entry.change >= 0 ? '+' : ''}${entry.change}
            </span>
            <span class="total">→ ${entry.total.toLocaleString()}</span>
        </div>
    `).join('');
}

function updateStats(data) {
    const stats = getStatsFromHistory(data.history);
    
    document.getElementById('today-growth').textContent = 
        (stats.todayGrowth >= 0 ? '+' : '') + stats.todayGrowth.toLocaleString();
    document.getElementById('weekly-growth').textContent = 
        (stats.weeklyGrowth >= 0 ? '+' : '') + stats.weeklyGrowth.toLocaleString();
    document.getElementById('goal').textContent = data.goal.toLocaleString();
    
    const progressPercent = Math.min((data.totalUsers / data.goal) * 100, 100);
    document.getElementById('progress').textContent = Math.round(progressPercent) + '%';
    
    setTimeout(() => {
        document.getElementById('progress-bar').style.width = progressPercent + '%';
    }, 100);
}

function updateInputs(data) {
    document.getElementById('user-count').value = data.totalUsers;
    document.getElementById('goal-input').value = data.goal;
}

// ========================================
// MAIN INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Load data
    let data = getStorageData();
    
    // Initialize counter
    const counterElement = document.getElementById('counter');
    const counter = new AnimatedCounter(counterElement);
    
    // Initialize confetti
    const confetti = new Confetti(document.getElementById('confetti-canvas'));

    // Initial render
    counter.setValue(data.totalUsers, false);
    updateStats(data);
    updateInputs(data);
    renderHistory(data.history);

    // Animate in after a short delay
    setTimeout(() => {
        counter.setValue(data.totalUsers, true);
    }, 500);

    // ========================================
    // EVENT HANDLERS
    // ========================================

    // Increment button
    document.getElementById('increment-btn').addEventListener('click', () => {
        data = addHistoryEntry(1, data.totalUsers + 1);
        counter.setValue(data.totalUsers);
        counter.pop();
        updateStats(data);
        renderHistory(data.history);
        confetti.miniBurst();
    });

    // Decrement button
    document.getElementById('decrement-btn').addEventListener('click', () => {
        if (data.totalUsers > 0) {
            data = addHistoryEntry(-1, data.totalUsers - 1);
            counter.setValue(data.totalUsers);
            counter.pop();
            updateStats(data);
            renderHistory(data.history);
        }
    });

    // Quick add buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            data = addHistoryEntry(amount, data.totalUsers + amount);
            counter.setValue(data.totalUsers);
            counter.pop();
            updateStats(data);
            renderHistory(data.history);
            confetti.burst(window.innerWidth / 2, window.innerHeight / 3, amount * 3);
        });
    });

    // Admin panel toggle
    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    
    adminToggle.addEventListener('click', () => {
        adminPanel.classList.toggle('hidden');
    });

    // Update button
    document.getElementById('update-btn').addEventListener('click', () => {
        const newTotal = parseInt(document.getElementById('user-count').value) || 0;
        const newGoal = parseInt(document.getElementById('goal-input').value) || 1000;
        
        const diff = newTotal - data.totalUsers;
        if (diff !== 0) {
            data = addHistoryEntry(diff, newTotal, 'Manual adjustment');
        }
        
        data.goal = newGoal;
        saveStorageData(data);
        
        counter.setValue(data.totalUsers);
        updateStats(data);
        renderHistory(data.history);
        
        if (diff > 0) {
            confetti.burst(window.innerWidth / 2, window.innerHeight / 3, Math.min(diff * 2, 100));
        }
    });

    // Celebrate button
    document.getElementById('celebrate-btn').addEventListener('click', () => {
        confetti.celebrate();
    });

    // Export button
    document.getElementById('export-btn').addEventListener('click', () => {
        const exportData = {
            exportedAt: new Date().toISOString(),
            currentTotal: data.totalUsers,
            goal: data.goal,
            history: data.history
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receptive-stats-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Clear history button
    document.getElementById('clear-history-btn').addEventListener('click', () => {
        if (confirm('Clear all history? This cannot be undone.')) {
            data.history = [];
            saveStorageData(data);
            renderHistory(data.history);
        }
    });

    // Close admin panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!adminPanel.contains(e.target) && !adminToggle.contains(e.target)) {
            adminPanel.classList.add('hidden');
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.matches('input')) return;
        
        if (e.key === 'c') confetti.celebrate();
        if (e.key === 'ArrowUp' || e.key === '+' || e.key === '=') {
            data = addHistoryEntry(1, data.totalUsers + 1);
            counter.setValue(data.totalUsers);
            counter.pop();
            updateStats(data);
            renderHistory(data.history);
            confetti.miniBurst();
        }
        if (e.key === 'ArrowDown' || e.key === '-') {
            if (data.totalUsers > 0) {
                data = addHistoryEntry(-1, data.totalUsers - 1);
                counter.setValue(data.totalUsers);
                counter.pop();
                updateStats(data);
                renderHistory(data.history);
            }
        }
    });
});
