// ========================================
// RECEPTIVE AI USER COUNTER
// Google Sheets Backend
// ========================================

// Config is set in HTML (SHEET_ID, SHEET_URL)
let currentData = {
    totalUsers: 0,
    goal: 1000,
    lastUpdated: null
};

let isUpdating = false;

// ========================================
// GOOGLE SHEETS INTEGRATION
// ========================================

async function fetchFromSheet() {
    try {
        setSyncStatus('syncing', 'Syncing...');
        
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Parse Google Sheets JSON response (wrapped in callback)
        const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
        if (!jsonStr) throw new Error('Invalid response');
        
        const json = JSON.parse(jsonStr[1]);
        const rows = json.table.rows;
        
        // Parse key-value pairs from sheet
        const data = {};
        rows.forEach(row => {
            if (row.c && row.c[0] && row.c[1]) {
                const key = row.c[0].v;
                const value = row.c[1].v;
                data[key] = value;
            }
        });
        
        currentData.totalUsers = parseInt(data.totalUsers) || 0;
        currentData.goal = parseInt(data.goal) || 1000;
        currentData.lastUpdated = data.lastUpdated || new Date().toISOString();
        
        setSyncStatus('synced', 'Synced');
        return currentData;
    } catch (error) {
        console.error('Fetch error:', error);
        setSyncStatus('error', 'Sync failed');
        throw error;
    }
}

async function updateSheet(newCount) {
    if (isUpdating) return;
    isUpdating = true;
    
    try {
        setSyncStatus('syncing', 'Saving...');
        
        // Use the Apps Script web app to update the sheet
        // This URL will be set after deploying the Apps Script
        const APPS_SCRIPT_URL = localStorage.getItem('receptive_apps_script_url');
        
        if (APPS_SCRIPT_URL) {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    totalUsers: newCount,
                    lastUpdated: new Date().toISOString()
                })
            });
        }
        
        // Update local state immediately for responsiveness
        currentData.totalUsers = newCount;
        currentData.lastUpdated = new Date().toISOString();
        
        setSyncStatus('synced', 'Saved');
        
        // Refresh from sheet after a delay to confirm
        setTimeout(() => fetchFromSheet(), 2000);
        
    } catch (error) {
        console.error('Update error:', error);
        setSyncStatus('error', 'Save failed');
    } finally {
        isUpdating = false;
    }
}

// ========================================
// UI FUNCTIONS
// ========================================

function setSyncStatus(status, text) {
    const el = document.getElementById('sync-status');
    el.className = 'sync-status ' + status;
    el.querySelector('.sync-text').textContent = text;
}

function updateUI(animate = true) {
    // Update counter
    const counterEl = document.getElementById('counter');
    const newValue = currentData.totalUsers.toLocaleString();
    
    if (animate && counterEl.textContent !== newValue) {
        counterEl.classList.remove('bump');
        void counterEl.offsetWidth;
        counterEl.classList.add('bump');
    }
    counterEl.textContent = newValue;
    
    // Update stats
    document.getElementById('goal').textContent = currentData.goal.toLocaleString();
    
    const progressPercent = Math.min((currentData.totalUsers / currentData.goal) * 100, 100);
    document.getElementById('progress').textContent = Math.round(progressPercent) + '%';
    document.getElementById('progress-bar').style.width = progressPercent + '%';
    
    // Update last updated
    if (currentData.lastUpdated) {
        const date = new Date(currentData.lastUpdated);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        let timeStr;
        if (diffMins < 1) timeStr = 'Just now';
        else if (diffMins < 60) timeStr = `${diffMins}m ago`;
        else if (diffMins < 1440) timeStr = `${Math.floor(diffMins/60)}h ago`;
        else timeStr = date.toLocaleDateString();
        
        document.getElementById('last-updated').textContent = timeStr;
    }
}

function changeCount(delta) {
    const newCount = Math.max(0, currentData.totalUsers + delta);
    currentData.totalUsers = newCount;
    updateUI(true);
    updateSheet(newCount);
    
    // Confetti for positive changes
    if (delta > 0) {
        confetti.burst(window.innerWidth / 2, window.innerHeight / 3, Math.min(delta * 5, 50));
    }
}

// ========================================
// CONFETTI
// ========================================

const confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    colors: ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'],
    
    init() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    burst(x, y, count = 30) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 20,
                vy: Math.random() * -15 - 5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                gravity: 0.5,
                opacity: 1,
                decay: 0.02
            });
        }
        this.animate();
    },
    
    celebrate() {
        const positions = [
            { x: this.canvas.width * 0.2, y: this.canvas.height * 0.3 },
            { x: this.canvas.width * 0.5, y: this.canvas.height * 0.2 },
            { x: this.canvas.width * 0.8, y: this.canvas.height * 0.3 }
        ];
        positions.forEach((pos, i) => {
            setTimeout(() => this.burst(pos.x, pos.y, 60), i * 150);
        });
    },
    
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
            this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            this.ctx.restore();
            
            return true;
        });
        
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        }
    }
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize confetti
    confetti.init();
    
    // Fetch initial data
    try {
        await fetchFromSheet();
        updateUI(false);
    } catch (e) {
        // Use defaults if fetch fails
        updateUI(false);
    }
    
    // Event listeners
    document.getElementById('increment').addEventListener('click', () => changeCount(1));
    document.getElementById('decrement').addEventListener('click', () => changeCount(-1));
    
    // Quick buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const delta = parseInt(btn.dataset.delta);
            changeCount(delta);
        });
    });
    
    // Celebrate button
    document.getElementById('celebrate-btn').addEventListener('click', () => {
        confetti.celebrate();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === '+' || e.key === '=') changeCount(1);
        if (e.key === 'ArrowDown' || e.key === '-') changeCount(-1);
        if (e.key === 'c') confetti.celebrate();
    });
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        if (!isUpdating) fetchFromSheet().then(() => updateUI(false));
    }, 30000);
});
