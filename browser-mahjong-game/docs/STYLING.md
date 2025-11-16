# Styling and Performance Guide

## Overview

The Browser Mahjong Game uses CSS Modules with a focus on performance, smooth animations, and responsive design. All styling follows modern best practices to ensure 60fps performance during animations and transitions.

## Design System

### CSS Variables

The application uses CSS custom properties (variables) defined in `src/index.css`:

```css
--transition-fast: 0.15s ease-out
--transition-normal: 0.25s ease-out
--transition-slow: 0.4s ease-out

--color-primary: #4a90e2
--color-success: #2ecc71
--color-warning: #f39c12
--color-danger: #ff6b6b
```

### Color Palette

- **Primary Blue**: Used for active states, selected tiles, and primary actions
- **Success Green**: Used for winning states and positive feedback
- **Warning Orange**: Used for kong calls and important notifications
- **Danger Red**: Used for mahjong calls and critical actions
- **Dark Backgrounds**: Gradient backgrounds for depth and visual interest

## Performance Optimizations

### Hardware Acceleration

All animated elements use hardware acceleration through:

```css
transform: translateZ(0);
backface-visibility: hidden;
will-change: transform;
```

This ensures animations run on the GPU for smooth 60fps performance.

### Transition Strategy

- **Fast transitions (0.15s)**: Used for hover states and immediate feedback
- **Normal transitions (0.25s)**: Used for state changes and layout shifts
- **Slow transitions (0.4s)**: Used for modal appearances and major state changes

### Animation Best Practices

1. **Use `transform` and `opacity`**: These properties are GPU-accelerated
2. **Avoid animating `width`, `height`, `top`, `left`**: These cause reflows
3. **Use `will-change` sparingly**: Only on elements that will definitely animate
4. **Remove animations on low-end devices**: Consider using `prefers-reduced-motion`

## Component Styling

### Tiles

Tiles feature:
- Gradient backgrounds for depth
- Smooth hover and selection states
- Hardware-accelerated transforms
- Entrance animations
- Text shadows for readability

### Buttons

All buttons include:
- Gradient backgrounds
- Ripple effect on hover (using `::before` pseudo-element)
- Smooth press animations
- Focus states for accessibility

### Game Board

The game board uses:
- Subtle background patterns
- Radial gradients for visual interest
- Inset shadows for depth
- Smooth fade-in animation on load

### Modals

Winner and draw displays feature:
- Overlay fade-in animation
- Modal slide-up animation
- Staggered tile reveal animations
- Celebration animations

## Responsive Design

### Breakpoints

- **Desktop**: > 1024px (default)
- **Tablet**: 768px - 1024px
- **Mobile**: 480px - 768px
- **Small Mobile**: < 480px

### Responsive Strategy

1. **Fluid layouts**: Use flexbox and grid with relative units
2. **Scalable tiles**: Tiles reduce in size on smaller screens
3. **Adaptive spacing**: Gaps and padding adjust based on screen size
4. **Touch-friendly**: Larger touch targets on mobile devices

## Accessibility

### Focus States

All interactive elements have visible focus states:

```css
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Reduced Motion

Consider adding support for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Animation Catalog

### Tile Animations

- **tileEnter**: Fade and scale in when tile is drawn
- **tileSelect**: Bounce effect when tile is selected
- **tileDiscard**: Fly-in effect when tile is discarded

### UI Animations

- **fadeIn**: Smooth opacity transition
- **slideUp**: Vertical slide with fade
- **slideIn**: Horizontal slide with fade
- **pulse**: Breathing effect for active states
- **celebrate**: Shake and scale for winning states

### Button Animations

- **Ripple effect**: Expanding circle on hover
- **Press animation**: Scale down on click
- **Pulse**: Continuous animation for important actions (Mahjong button)

## Browser Support

The styling is optimized for modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Fallbacks

- CSS variables have fallback values
- Gradients fall back to solid colors
- Animations degrade gracefully

## Performance Monitoring

To ensure 60fps performance:

1. Open Chrome DevTools Performance tab
2. Record during gameplay
3. Check for:
   - Frame rate staying at 60fps
   - No long tasks (> 50ms)
   - Minimal layout thrashing
   - GPU acceleration active

## Future Enhancements

Potential improvements:

1. **Dark/Light mode toggle**: Using CSS variables
2. **Custom themes**: User-selectable color schemes
3. **Tile skins**: Different visual styles for tiles
4. **Particle effects**: Confetti on winning
5. **Sound effects**: Audio feedback for actions
