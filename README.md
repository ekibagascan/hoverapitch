# HOVERA Presentation App

A modern presentation app with smooth scale reveal animations for slides.

## Features

- Smooth scale-up animations when revealing slide content
- Title and subtitle reveal with fade-in effects
- Next slide preview appears in the background during transitions
- Navigation arrows for moving between slides
- Header and footer matching the HOVERA brand design

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How It Works

1. **Initial State**: Each slide starts with a small, centered image
2. **First Click**: The current slide's image scales up to fullscreen and reveals title/subtitle (if available)
3. **Next Slide Preview**: While the current slide is revealing, the next slide's image appears small in the background
4. **Second Click**: Moves to the next slide, which starts in its initial small state
5. **Repeat**: The cycle continues for each slide

## Navigation

- Click the right arrow (›) to advance through slides
- Click the left arrow (‹) to go back
- Arrows are disabled when at the beginning/end of the presentation

## Adding More Slides

Edit `src/App.jsx` and add more slide objects to the `slides` array:

```javascript
{
  id: 3,
  image: '/slide_3.png',
  title: 'Your Title',
  subtitle: 'Your Subtitle'
}
```

Make sure to add the corresponding image file to the `public` folder.

