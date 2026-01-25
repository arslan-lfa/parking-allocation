# SmartPark UI Component Reference

## Color System

### Primary Colors
```
Primary Blue:      #4f46e5  rgb(79, 70, 229)
Secondary Green:   #10b981  rgb(16, 185, 129)
Danger Red:        #ef4444  rgb(239, 68, 68)
Warning Amber:     #f59e0b  rgb(245, 158, 11)
Info Blue:         #3b82f6  rgb(59, 130, 246)
```

### Neutral Colors
```
Background:        #0f172a  (Dark Navy)
Surface:           #1e293b  (Slate)
Light:             #f1f5f9  (Light Gray)
Border:            #e2e8f0  (Border Gray)
Text:              #1e293b  (Dark Text)
Text Light:        #64748b  (Light Text)
```

---

## Typography

### Font Stack
```
System Default: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Monospace: 'Courier New', monospace (for IDs and technical data)
```

### Sizes
```
H1: 2rem (32px)    - Page titles
H2: 1.5rem (24px)  - Card titles
H3: 1.125rem (18px) - Subheadings
Body: 1rem (16px)  - Regular text
Small: 0.875rem (14px) - Helper text
Tiny: 0.75rem (12px) - Captions
```

### Font Weights
```
Regular:  400
Medium:   500
Bold:     600
Bolder:   700
```

---

## Spacing Scale

### Base Unit: 8px

```
xs:  4px   (0.5rem)
sm:  8px   (1rem)
md:  16px  (1rem) - Note: also 1rem
lg:  24px  (1.5rem)
xl:  32px  (2rem)
2xl: 40px  (2.5rem)
```

### Padding
```
Buttons:       0.75rem 1rem
Cards:         1.5rem
Form inputs:   0.75rem 1rem
Table cells:   1rem 0.75rem
```

### Margins
```
Between sections: 2rem
Between cards:    1.5rem
Between items:    1rem
```

---

## Components

### Card
```html
<div class="card">
    <div class="card-header">
        <h2 class="card-title">Title</h2>
        <p class="card-subtitle">Subtitle</p>
    </div>
    <div class="card-content">
        Content
    </div>
</div>
```

**Styling:**
- Background: --surface
- Padding: 1.5rem
- Border-radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Transition: all 0.3s ease

### Stat Card
```html
<div class="stat-card">
    <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <i class="fas fa-icon"></i>
    </div>
    <h3>Label</h3>
    <p class="stat-value">999</p>
    <small>Description</small>
</div>
```

**Styling:**
- Icon background: 60x60px, gradient, rounded
- Icon color: white
- Value: Bold, larger font
- Description: Small, light text

### Button

**Base Styling:**
```css
.btn {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.btn:active {
    transform: translateY(0);
}
```

**Variants:**

| Variant | Background | Color |
|---------|------------|-------|
| .btn-primary | #4f46e5 | white |
| .btn-secondary | #f1f5f9 | #1e293b |
| .btn-danger | #ef4444 | white |
| .btn-warning | #f59e0b | white |
| .btn-success | #10b981 | white |

**Sizes:**
- Default: 0.75rem 1rem padding
- .btn-lg: 1rem 1.5rem padding, larger text

### Badges

**Status Badges:**
```html
<span class="badge-status badge-allocated">Allocated</span>
<span class="badge-status badge-active">Active</span>
<span class="badge-status badge-completed">Completed</span>
```

**Regular Badge:**
```html
<span class="badge">Label</span>
```

**Styling:**
- Padding: 0.5rem 0.75rem
- Border-radius: 20px
- Font-weight: 600
- Font-size: 0.75rem

### Alerts

```html
<!-- Success Alert -->
<div class="alert alert-success">
    <i class="fas fa-check-circle"></i>
    <div>
        <strong>Success</strong>
        <p>Message</p>
    </div>
</div>

<!-- Error Alert -->
<div class="alert alert-error">
    <i class="fas fa-exclamation-circle"></i>
    <div>
        <strong>Error</strong>
        <p>Message</p>
    </div>
</div>

<!-- Warning Alert -->
<div class="alert alert-warning">
    <i class="fas fa-exclamation-triangle"></i>
    <div>
        <strong>Warning</strong>
        <p>Message</p>
    </div>
</div>
```

**Styling:**
- Padding: 1rem
- Border-radius: 8px
- Border-left: 4px solid (color varies)
- Icon: Margin-right: 0.75rem

### Form Elements

```html
<div class="form-group">
    <label for="field-id">
        <i class="fas fa-icon"></i> Label
    </label>
    <input 
        type="text" 
        id="field-id" 
        name="field-name"
        placeholder="Placeholder text"
        required
    >
    <small>Helper text</small>
</div>
```

**Input Styling:**
- Padding: 0.75rem 1rem
- Border: 1px solid --border
- Border-radius: 8px
- Transition: border-color 0.2s
- Error state: border-color: #ef4444

### Tables

```html
<table class="data-table">
    <thead>
        <tr>
            <th>Header</th>
            <th>Header</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Cell</td>
            <td>Cell</td>
        </tr>
    </tbody>
</table>
```

**Styling:**
- Header background: darker shade
- Row hover: light background
- Padding: 1rem 0.75rem
- Border-collapse: collapse
- Border-bottom: 1px solid --border

---

## Grid System

### Responsive Grids

```html
<!-- 2-Column (mobile: 1, desktop: 2) -->
<div class="grid grid-2">
    <div>Column 1</div>
    <div>Column 2</div>
</div>

<!-- 3-Column (mobile: 1, desktop: 3) -->
<div class="grid grid-3">
    <div>Column 1</div>
    <div>Column 2</div>
    <div>Column 3</div>
</div>

<!-- 4-Column (mobile: 2, desktop: 4) -->
<div class="grid grid-4">
    <div>Column 1</div>
    <div>Column 2</div>
    <div>Column 3</div>
    <div>Column 4</div>
</div>
```

**Breakpoints:**
- Mobile (< 768px): 1 column
- Tablet (768px - 1024px): 2 columns
- Desktop (> 1024px): 2, 3, or 4 columns

### Gap
- Default: 1.5rem between items

---

## Layout Components

### Sidebar Navigation

**Styling:**
- Width: 280px (fixed)
- Background: Gradient from --primary
- Color: white
- Position: fixed on left
- Z-index: 1000

**Mobile (< 768px):**
- Collapse to 60px width
- Icons only
- Slide-out on click

### Header

**Styling:**
- Height: 60px
- Background: white
- Box-shadow: 0 1px 3px rgba(0,0,0,0.1)
- Display: flex, justify-content: space-between
- Padding: 0 2rem

### Main Content Wrapper

**Styling:**
- Margin-left: 280px (accounting for sidebar)
- Margin-top: 60px (accounting for header)
- Padding: 2rem
- Min-height: calc(100vh - 60px)

**Mobile:**
- Margin-left: 0
- Full width

---

## Animations

### Keyframes

```css
@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}
```

### Usage
```css
.notification {
    animation: slideIn 0.3s ease;
}

.card {
    animation: slideInUp 0.3s ease;
}

.spinner {
    animation: spin 1s linear infinite;
}

.pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## Shadows

### Shadow Levels

```css
/* Minimal */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Light */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

/* Medium */
box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);

/* Heavy */
box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
```

---

## Icons (Font Awesome 6.4.0)

### Common Icons Used

```
Solid icons:
fa-warehouse    - Zones
fa-square       - Slots
fa-car          - Vehicles
fa-percent      - Statistics
fa-chart-line   - Analytics
fa-undo         - Rollback
fa-key          - ID/Request
fa-map-marker   - Location
fa-check-circle - Success
fa-exclamation-circle - Error
fa-info-circle  - Info
fa-spinner (with fa-spin) - Loading
fa-search       - Search
fa-bell         - Notifications
fa-user         - Profile
fa-sign-out     - Logout
```

---

## Responsive Design Checklist

- [ ] Mobile view (< 768px) tested
- [ ] Tablet view (768px - 1024px) tested
- [ ] Desktop view (> 1024px) tested
- [ ] Sidebar collapses on mobile
- [ ] Text remains readable on all sizes
- [ ] Buttons/inputs are touch-friendly
- [ ] Images scale appropriately
- [ ] No horizontal scrolling
- [ ] Navigation works on mobile
- [ ] Forms are usable on small screens

---

## Accessibility Guidelines

### Color Contrast
- Text on background: Minimum 4.5:1 ratio
- Large text on background: Minimum 3:1 ratio
- Status badges: Use color + icon

### Text
- Font-size minimum: 14px (0.875rem)
- Line-height: 1.5 for readability
- Line-length: 50-70 characters ideal

### Interactive Elements
- Buttons: Minimum 44x44px tap target
- Links: Visible focus state
- Hover/Active states clear

### Form Elements
- Labels associated with inputs
- Error messages clear and visible
- Required fields marked
- Placeholder text is supplementary

### Images & Icons
- Alt text for meaningful images
- Icons have text labels or title attributes
- Font Awesome icons include aria-hidden for decorative use

---

## Performance Considerations

### CSS
- Use CSS variables for theming
- Minimize using !important
- Batch animations efficiently

### JavaScript
- Event delegation for dynamic elements
- Debounce rapid function calls
- Lazy load non-critical components

### Images
- Use appropriate image formats
- Optimize image sizes
- Consider WebP with fallbacks

### Caching
- Cache API responses locally
- Use browser storage wisely
- Invalidate cache on updates

---

## File Structure

```
parking_system/
├── static/
│   ├── css/
│   │   └── style.css          # Main design system
│   └── js/
│       └── main.js            # Utilities & handlers
└── templates/
    ├── base.html              # Layout infrastructure
    ├── index.html             # Home dashboard
    ├── user/
    │   ├── submit.html        # Request submission
    │   └── status.html        # Status checker
    └── admin/
        ├── dashboard.html     # Admin overview
        ├── analytics.html     # Analytics dashboard
        └── rollback.html      # Rollback manager
```

---

## Quick Reference Commands

### Show notification
```javascript
showNotification('Message', 'success');
```

### Show loading
```javascript
showLoadingSpinner(true);  // Show
showLoadingSpinner(false); // Hide
```

### Format date
```javascript
formatDate(new Date());
```

### Validate form
```javascript
validateForm('form-id');
```

---

## Resources

- [Font Awesome](https://fontawesome.com/) - Icon library
- [CSS Tricks](https://css-tricks.com/) - CSS best practices
- [MDN Web Docs](https://developer.mozilla.org/) - Web standards
- [Material Design](https://material.io/) - Design principles

---

*Reference guide for SmartPark UI components and styling*
