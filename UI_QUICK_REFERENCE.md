# KickZone Modern UI - Quick Reference Card

## 🎨 CSS Variables (Use These!)

```css
/* Colors */
var(--color-primary)        /* #2E8B57 - Main green */
var(--color-secondary)      /* #0B6E4F - Deep teal */
var(--color-accent)         /* #FFC857 - Yellow */
var(--color-background)     /* #F6FFF5 - Light bg */
var(--color-surface)        /* #FFFFFF - White */
var(--color-text-primary)   /* #08311A - Dark green */
var(--color-text-muted)     /* #6B7B6B - Gray */
```

## ⚡ Common Patterns

### Modern Button
```css
.my-button {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border-radius: 12px;
  padding: 1rem 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(46, 139, 87, 0.3);
}

.my-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(46, 139, 87, 0.4);
}
```

### Modern Card
```css
.my-card {
  background: var(--color-surface);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.my-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(46, 139, 87, 0.12);
}
```

### Gradient Text
```css
.gradient-title {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  letter-spacing: -1px;
}
```

### Glassmorphism
```css
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25);
}
```

### Modern Input
```css
.modern-input {
  padding: 1rem 1.25rem;
  border: 2px solid rgba(107, 123, 107, 0.2);
  border-radius: 12px;
  background: var(--color-background);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 4px rgba(46, 139, 87, 0.1);
  transform: translateY(-2px);
}
```

## 🎬 Animations

### Entrance Animation
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animated-element {
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Hover Effect
```css
.hover-lift {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-8px);
}
```

## 🎯 Utility Classes

```css
.glass-effect          /* Glassmorphism background */
.modern-shadow         /* Subtle shadow */
.modern-shadow-hover   /* Shadow with hover effect */
.gradient-text         /* Gradient text effect */
.modern-badge          /* Badge component */
.skeleton             /* Loading placeholder */
```

## 📏 Spacing Scale

```css
0.25rem = 4px
0.5rem  = 8px
0.75rem = 12px
1rem    = 16px
1.25rem = 20px
1.5rem  = 24px
2rem    = 32px
3rem    = 48px
4rem    = 64px
```

## 🎨 Border Radius Scale

```css
8px  - Small (badges, tags)
12px - Medium (buttons, inputs)
16px - Large (sections)
20px - XLarge (cards)
24px - XXLarge (modals, containers)
```

## ⏱️ Transition Timing

```css
/* Standard timing function */
cubic-bezier(0.4, 0, 0.2, 1)

/* Common durations */
0.2s - Very fast (color changes)
0.3s - Fast (hover states)
0.4s - Standard (most animations)
0.6s - Slower (page transitions)
0.8s - Entrance animations
```

## 🎭 Shadow Levels

```css
/* Light */
box-shadow: 0 4px 12px rgba(46, 139, 87, 0.15);

/* Medium */
box-shadow: 0 8px 32px rgba(46, 139, 87, 0.2);

/* Heavy */
box-shadow: 0 16px 48px rgba(46, 139, 87, 0.25);

/* Extra Heavy */
box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25);
```

## 📱 Responsive Typography

```css
/* Use clamp() for responsive text */
font-size: clamp(1rem, 2vw, 1.5rem);

/* Scales automatically between min and max */
h1: clamp(2rem, 5vw, 3.5rem)
h2: clamp(1.75rem, 4vw, 2.5rem)
h3: clamp(1.5rem, 3vw, 2rem)
```

## ✅ Best Practices

1. **Always use CSS variables** for colors
2. **Use cubic-bezier** for smooth animations
3. **Add hover states** to interactive elements
4. **Keep animations** under 0.6s
5. **Use transform** instead of position for animations
6. **Add transition** to all interactive elements
7. **Use rem/em** for spacing (not px)
8. **Test on mobile** devices

## 🚫 Don't Do

- ❌ Hardcode color values
- ❌ Use linear timing functions
- ❌ Animate layout properties (width, height)
- ❌ Forget focus states
- ❌ Overuse animations
- ❌ Ignore accessibility

## ✅ Do

- ✅ Use CSS variables
- ✅ Use easing functions
- ✅ Animate transform and opacity
- ✅ Add clear focus indicators
- ✅ Keep animations subtle
- ✅ Test with keyboard navigation

---

**Pro Tip**: Copy and paste these patterns to maintain consistency across your application!
