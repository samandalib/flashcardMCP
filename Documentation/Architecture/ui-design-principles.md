# Simple Mobile-First UI Design

**Last Updated:** January 2025

## Design Principles

### 1. **Super Simple Interface**
- Clean, minimal design with plenty of white space
- Clear visual hierarchy
- No unnecessary elements or decorations
- Focus on content and functionality

### 2. **Mobile-First Approach**
- Designed for mobile screens first (320px+)
- Touch-friendly buttons and interactions
- Responsive design that scales up to desktop
- Optimized for thumb navigation

### 3. **Accessibility**
- High contrast colors
- Large enough touch targets (44px minimum)
- Clear typography
- RTL support for Farsi

## Current UI Structure

### Header
- **Simple white background** with subtle border
- **Project title** on the left
- **Compact language switcher** (EN/FA) on the right
- **Mobile-optimized** spacing and sizing

### Main Content
- **Centered layout** with max-width container
- **Card-based design** for content sections
- **Empty state** with clear call-to-action
- **Generous padding** for mobile comfort

### Language Switcher
- **Compact design** with EN/FA buttons
- **Visual feedback** for active language
- **Small size** to not overwhelm the interface

## Color Scheme

### Primary Colors
- **Background:** `bg-gray-50` (light gray)
- **Cards:** `bg-white` (white)
- **Borders:** `border-gray-200` (light gray)
- **Text:** `text-gray-900` (dark gray)
- **Secondary Text:** `text-gray-500` (medium gray)

### Interactive Elements
- **Primary Button:** `bg-blue-600` with `hover:bg-blue-700`
- **Language Buttons:** Default/outline variants
- **Hover States:** Subtle color changes

## Typography

### Font Sizes (Mobile-First)
- **Header Title:** `text-lg` (18px)
- **Card Title:** `text-xl` (20px)
- **Body Text:** `text-sm` (14px)
- **Language Buttons:** `text-xs` (12px)

### Font Weights
- **Headers:** `font-semibold` (600)
- **Body:** Normal (400)
- **Buttons:** Normal (400)

## Responsive Breakpoints

### Mobile (320px - 768px)
- Single column layout
- Full-width cards
- Compact header
- Touch-friendly buttons

### Tablet (768px - 1024px)
- Slightly wider containers
- More spacing
- Larger touch targets

### Desktop (1024px+)
- Max-width containers
- Centered layout
- Hover states
- Larger typography

## Component Guidelines

### Cards
- **White background** with subtle shadow
- **Rounded corners** for modern look
- **Generous padding** for content
- **Clear visual separation**

### Buttons
- **Rounded corners** (`rounded-lg`)
- **Adequate padding** for touch
- **Clear visual states** (default, hover, active)
- **Consistent sizing**

### Language Switcher
- **Compact design** to save space
- **Clear active state** indication
- **Easy thumb access** on mobile
- **Consistent with overall design**

## Future Enhancements

### Planned Additions
1. **Project List View** - Simple card-based project display
2. **Card Management** - Clean forms for creating/editing cards
3. **Synthesis Button** - Prominent CTA for research synthesis
4. **Loading States** - Subtle loading indicators
5. **Error Handling** - Clean error messages

### Mobile Optimizations
1. **Swipe gestures** for navigation
2. **Pull-to-refresh** functionality
3. **Offline support** indicators
4. **Touch feedback** animations
5. **Keyboard optimization** for forms

