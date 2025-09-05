# Internationalization (i18n) Requirements

**Last Updated:** January 2025

## Language Support

### Primary Languages
- **English (en)** - Default language
- **Farsi/Persian (fa)** - Right-to-left (RTL) support required

### Implementation Plan

#### 1. Next.js i18n Configuration
```javascript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'fa'],
    defaultLocale: 'en',
  },
}
```

#### 2. Translation Management
- **Library:** `next-intl` (recommended for Next.js 15)
- **Translation Files:** JSON files in `/locales/` directory
- **Structure:**
  ```
  locales/
  ├── en.json
  └── fa.json
  ```

#### 3. RTL Layout Considerations

**CSS Logical Properties:**
- Use `margin-inline-start` instead of `margin-left`
- Use `padding-inline-end` instead of `padding-right`
- Use `text-align: start` instead of `text-align: left`

**Dynamic Direction:**
```javascript
const direction = locale === 'fa' ? 'rtl' : 'ltr';
<html lang={locale} dir={direction}>
```

#### 4. Component Library Compatibility

**shadcn/ui RTL Support:**
- ✅ Most components support RTL via CSS logical properties
- ⚠️ May need custom overrides for complex layouts
- 🔧 Consider using `dir="rtl"` attribute on containers

#### 5. Language Switching UI

**Requirements:**
- Prominent language switcher in header/navigation
- Persist language preference in localStorage
- Smooth transition between LTR/RTL layouts
- Icon-based switcher (flag icons or text)

#### 6. Content Considerations

**User-Generated Content:**
- Cards can be created in any language
- References may be in different languages
- Synthesis should respect source language

**System Messages:**
- All UI text must be translated
- Error messages and notifications
- Form labels and validation messages
- Tooltips and help text

#### 7. SEO & Accessibility

**SEO:**
- `hreflang` tags for language versions
- Proper meta tags for each locale
- Language-specific sitemaps

**Accessibility:**
- Proper `lang` attributes
- Screen reader compatibility for RTL
- Keyboard navigation in both directions

## Implementation Priority

### Phase 1 (MVP)
1. ✅ Basic next-intl setup
2. ✅ Core UI translations (buttons, labels, navigation)
3. ✅ Language switcher component
4. ✅ RTL layout support

### Phase 2 (Post-MVP)
1. 🔄 Advanced RTL component adjustments
2. 🔄 SEO optimization
3. 🔄 Accessibility enhancements
4. 🔄 Content language detection

## Technical Dependencies

```json
{
  "dependencies": {
    "next-intl": "^3.0.0",
    "rtl-detect": "^1.0.0"
  }
}
```

## Testing Strategy

1. **Language Switching:** Test all UI elements in both languages
2. **RTL Layout:** Verify proper text direction and spacing
3. **Content Input:** Test card creation in both languages
4. **Synthesis:** Ensure synthesis works with mixed-language content
5. **Accessibility:** Screen reader testing in both languages

