# Receptive AI User Counter 🚀

A modern, animated user counter dashboard for the Receptive AI team. Perfect for displaying on office screens, sharing in team meetings, or celebrating milestones!

![Preview](preview.png)

## Features

- ⚡ **Animated Counter** - Smooth, eye-catching number animation
- 📊 **Stats Dashboard** - Track weekly growth, goals, and progress
- 🎉 **Confetti Celebrations** - Hit the celebrate button or press 'C'!
- 📱 **Mobile Friendly** - Looks great on any device
- 💾 **Persistent Data** - Saves to browser localStorage
- 🎨 **Modern Design** - Dark theme with gradient accents

## Quick Start

### Update the Counter

**Option 1: Admin Panel**
1. Click the ⚙️ button in the bottom-right corner
2. Enter your new numbers
3. Click "Update Counter"

**Option 2: Edit the Code**
Open `script.js` and modify the `CONFIG` object:

```javascript
const CONFIG = {
    totalUsers: 247,      // Current total user count
    weeklyGrowth: 32,     // New users this week
    goal: 1000            // Target goal
};
```

## Deployment

This site is deployed on GitHub Pages. Any push to the `main` branch will automatically update the live site.

**Live URL:** https://samjamliaison.github.io/receptive-counter/

## Keyboard Shortcuts

- `C` - Trigger confetti celebration! 🎊

## Customization

### Colors
Edit the CSS variables in `style.css`:

```css
:root {
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --accent: #22d3ee;
    /* ... */
}
```

### Logo
Replace the emoji in `index.html`:
```html
<span class="logo-icon">⚡</span>
<span class="logo-text">Receptive AI</span>
```

## Tech Stack

- Pure HTML/CSS/JavaScript
- No frameworks or build tools required
- Google Fonts (Inter & Space Grotesk)

## License

Internal use for Receptive AI team.

---

Built with 💜 for the Receptive AI team
