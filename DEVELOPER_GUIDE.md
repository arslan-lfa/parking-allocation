# SmartPark UI - Developer Guide

## Quick Start

### Running the Application

```bash
# Navigate to the project directory
cd parking_system

# Run the Flask app
python app.py
```

The application will be available at `http://localhost:5000`

---

## Pages Overview

### User Pages

#### 1. Home Dashboard (`/`)
- Shows system statistics and recent activity
- Quick action buttons to submit request or check status
- Real-time system status monitoring
- **Route**: `/` (automatically redirects from home)

#### 2. Submit Request (`/submit`)
- Form to submit a new parking request
- Vehicle ID input field
- Zone selection dropdown
- Zone availability live information
- **Route**: `/submit`
- **Form ID**: `submit-form`

#### 3. Check Status (`/status`)
- Search for parking request by ID
- Display detailed request information
- Show current status and allocated slot
- Release parking slot button
- **Route**: `/status`
- **Form ID**: `status-form`

### Admin Pages

#### 4. Admin Dashboard (`/admin`)
- System statistics overview
- Zone allocation visualization
- System health status
- Quick action buttons
- **Route**: `/admin`
- **Requires**: Admin privileges

#### 5. Analytics (`/analytics`)
- Comprehensive metrics display
- Zone utilization percentages
- Peak zones ranking
- Session statistics
- Export options
- **Route**: `/analytics`
- **Requires**: Admin privileges

#### 6. Rollback Manager (`/rollback`)
- Rollback recent operations
- Operation history viewing
- Confirmation dialogs
- Previous rollback history
- **Route**: `/rollback`
- **Requires**: Admin privileges

---

## Using JavaScript Utilities

### Display Notifications

```javascript
// Success notification (auto-dismisses after 3 seconds)
showNotification('Request submitted successfully!', 'success');

// Error notification
showNotification('An error occurred', 'error');

// Warning notification
showNotification('Please review this carefully', 'warning');

// Info notification
showNotification('Updated successfully', 'info');

// Keep notification visible (duration in milliseconds)
showNotification('Important message', 'info', 5000);

// Keep notification permanently (set duration to 0)
showNotification('Permanent message', 'info', 0);
```

### Show Loading Spinner

```javascript
// Show loading spinner
showLoadingSpinner(true);

// After operation completes, hide it
showLoadingSpinner(false);
```

### Form Validation

```javascript
// Validate form before submission
if (validateForm('my-form')) {
    // Form is valid, proceed
    console.log('Form is valid!');
} else {
    // Form has errors
    showNotification('Please fill in all required fields', 'warning');
}
```

### Date & Duration Formatting

```javascript
// Format date to readable string
const formattedDate = formatDate(new Date());
// Output: "January 15, 2024, 02:30 PM"

// Format duration in seconds
const formatted = formatDuration(3661);
// Output: "1h"

const formatted2 = formatDuration(125);
// Output: "2m"
```

---

## CSS Classes Reference

### Card Components

```html
<!-- Basic Card -->
<div class="card">
    <div class="card-header">
        <h2 class="card-title">Card Title</h2>
        <p class="card-subtitle">Card Subtitle</p>
    </div>
    <div class="card-content">
        Card content goes here
    </div>
</div>

<!-- Stat Card -->
<div class="stat-card">
    <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <i class="fas fa-chart-line"></i>
    </div>
    <h3>Stat Title</h3>
    <p class="stat-value">123</p>
    <small>Description</small>
</div>
```

### Button Variants

```html
<!-- Primary Button -->
<button class="btn btn-primary">Primary Action</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Secondary Action</button>

<!-- Danger Button -->
<button class="btn btn-danger">Delete/Danger</button>

<!-- Warning Button -->
<button class="btn btn-warning">Caution Action</button>

<!-- Large Button -->
<button class="btn btn-primary btn-lg">Large Button</button>
```

### Grid Layouts

```html
<!-- 2-Column Grid -->
<div class="grid grid-2">
    <div>Column 1</div>
    <div>Column 2</div>
</div>

<!-- 3-Column Grid -->
<div class="grid grid-3">
    <div>Col 1</div>
    <div>Col 2</div>
    <div>Col 3</div>
</div>

<!-- 4-Column Grid -->
<div class="grid grid-4">
    <div>Col 1</div>
    <div>Col 2</div>
    <div>Col 3</div>
    <div>Col 4</div>
</div>
```

### Status Badges

```html
<!-- Allocated Status -->
<span class="badge-status badge-allocated">Allocated</span>

<!-- Active Status -->
<span class="badge-status badge-active">Active</span>

<!-- Completed Status -->
<span class="badge-status badge-completed">Completed</span>
```

### Alert Messages

```html
<!-- Success Alert -->
<div class="alert alert-success">
    <i class="fas fa-check-circle"></i>
    <div>
        <strong>Success!</strong>
        <p>Operation completed successfully</p>
    </div>
</div>

<!-- Error Alert -->
<div class="alert alert-error">
    <i class="fas fa-exclamation-circle"></i>
    <div>
        <strong>Error</strong>
        <p>Something went wrong</p>
    </div>
</div>

<!-- Warning Alert -->
<div class="alert alert-warning">
    <i class="fas fa-exclamation-triangle"></i>
    <div>
        <strong>Warning</strong>
        <p>Please be careful with this action</p>
    </div>
</div>
```

### Form Elements

```html
<!-- Form Group -->
<div class="form-group">
    <label for="input-id">
        <i class="fas fa-icon"></i> Label Text
    </label>
    <input type="text" id="input-id" name="field-name" placeholder="Placeholder" required>
    <small>Helper text</small>
</div>
```

---

## API Endpoints Used

### User Endpoints

- `POST /api/user/submit_request` - Submit parking request
  - Body: `{ vehicle_id, preferred_zone_id }`
  
- `GET /api/user/status/<request_id>` - Get request status
  
- `POST /api/user/release_request` - Release parking slot
  - Body: `{ request_id }`

### Admin Endpoints

- `GET /api/admin/zones` - Get all zones with info
  
- `GET /api/admin/metrics` - Get system metrics
  
- `GET /api/admin/recent_operations` - Get recent operations
  
- `POST /api/admin/rollback` - Rollback operations
  - Body: `{ k: number_of_operations }`

---

## Customization Guide

### Change Colors

Edit `/static/css/style.css` and update the CSS variables:

```css
:root {
    --primary: #4f46e5;      /* Main brand color */
    --secondary: #10b981;    /* Success color */
    --danger: #ef4444;       /* Error/delete color */
    --warning: #f59e0b;      /* Warning color */
    --info: #3b82f6;         /* Info color */
    /* ... other variables ... */
}
```

### Change Font

Update the font stack in `style.css`:

```css
body {
    font-family: 'Your Font Here', sans-serif;
}
```

### Adjust Sidebar Width

In `style.css`:

```css
aside {
    width: 300px;  /* Change from 280px */
}
```

### Change Refresh Intervals

In individual template files, adjust the interval:

```javascript
// Change from 30000ms (30 seconds) to your preferred interval
setInterval(loadData, 60000);  // 60 seconds
```

---

## Troubleshooting

### Notifications Not Showing
- Check that the notification container exists in the DOM
- Ensure `showNotification()` is being called with correct parameters
- Check browser console for JavaScript errors

### Loading Spinner Stuck
- Make sure `showLoadingSpinner(false)` is being called in finally block
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Styles Not Applying
- Verify `style.css` is properly linked in `base.html`
- Check for CSS specificity conflicts
- Clear browser cache

### API Calls Failing
- Check Flask server is running
- Verify API endpoints are correctly defined in `app.py`
- Check browser network tab for HTTP errors
- Review API response messages for details

### Responsive Issues
- Test on multiple screen sizes using browser DevTools
- Check media query breakpoints in `style.css`
- Verify grid classes are being used correctly

---

## Performance Tips

1. **API Call Optimization**
   - Implement request debouncing for rapid changes
   - Cache frequently accessed data
   - Use pagination for large datasets

2. **JavaScript Efficiency**
   - Minimize DOM queries
   - Use event delegation
   - Lazy load images and content

3. **CSS Optimization**
   - Minify `style.css` for production
   - Use CSS variables for theming
   - Avoid inline styles when possible

4. **Loading States**
   - Always show loading spinner for async operations
   - Display skeleton screens for large datasets
   - Set reasonable timeouts for API calls

---

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Features requiring:
- ES6 JavaScript support
- CSS Grid and Flexbox
- CSS Custom Properties (variables)

---

## Resources

- [Font Awesome Icons](https://fontawesome.com/icons) - Icon documentation
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [MDN Web Docs](https://developer.mozilla.org/) - General web development

---

## Next Steps

1. **Deploy to Production**
   - Set up HTTPS
   - Configure database backups
   - Set up monitoring and logging

2. **Mobile App**
   - Consider native apps for iOS/Android
   - Implement offline capabilities

3. **Advanced Features**
   - Real-time WebSocket updates
   - Push notifications
   - Advanced analytics

4. **Integration**
   - Payment system integration
   - Third-party parking sensors
   - Vehicle recognition systems

---

*For more information, see UI_REVAMP_SUMMARY.md*
