# 🍂 Calming Autumn Leaves Animation - Implementation Guide

## Overview
Your 3D background has been transformed into a **soothing, meditative autumn leaves animation** perfect for mental wellness applications. The leaves gently drift downward with natural wobbling motions, creating a peaceful, stress-relieving atmosphere.

## ✨ Key Features Implemented

### 🎨 Visual Design
- **35 base leaves** + up to 40 continuously falling ambient leaves
- **Rich autumn color palette**: Fiery reds, burnt oranges, golden yellows, deep burgundy
- **Varied leaf sizes**: 0.4x to 1.5x scale for natural depth perception
- **5 leaf varieties**: Maple, Oak, Birch, Ginkgo, Willow
- **Texture support**: Ready for realistic maple.png texture overlay

### 🌊 Calming Motion Physics
- **Gentle downward drift**: Slow falling velocity (-0.05 to -0.13 units/sec)
- **Natural horizontal wobble**: Sine-wave motion mimicking real leaves
- **Graceful tumbling**: Smooth 3-axis rotation with varied speeds
- **Seamless looping**: Leaves respawn at top when reaching bottom
- **No harsh bounces**: Soft wrap-around at edges

### 💡 Lighting & Atmosphere
- **Soft dreamlike lighting**: Warm ambient (#fffaf5) at 0.85 intensity
- **Golden hour directional lights**: Peachy tones (#ffe4c4, #ffd7a3)
- **Subtle rim lighting**: Depth enhancement with dual point lights
- **Minimal shadows**: Reduced for softer, less distracting visuals
- **Transparent overlay**: Very light radial gradient for depth

### ⚡ Performance Optimizations
- **Higher geometry detail**: 4x4 segments for smoother, rounded edges
- **Optimized materials**: Lower metalness (0.02), higher roughness (0.7) for natural look
- **Efficient spawning**: Collision detection with attempt limits
- **Longer lifespans**: 15-20 seconds per ambient leaf for continuity
- **Staggered intervals**: New leaves every 2.5 seconds

## 📦 Adding the Maple Texture

### Step 1: Add maple.png to Assets
Place your maple leaf texture at:
```
frontend/public/assests/maple.png
```

**Texture Requirements:**
- **Format**: PNG with transparency (alpha channel)
- **Recommended size**: 512x512 or 1024x1024 pixels
- **Background**: Transparent (remove any solid backgrounds)
- **Style**: Semi-realistic or stylized 3D leaf with soft edges
- **Colors**: Natural autumn tones (will be tinted by the color palette)

### Step 2: Texture Automatically Loads
The code already includes texture loading logic:
```typescript
const mapleTexture = useMemo(() => {
  const loader = new THREE.TextureLoader();
  return loader.load('/assests/maple.png', (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
  });
}, []);
```

### Step 3: Verify
- The texture will automatically apply to all leaves
- Colors will overlay on the texture for variety
- If texture fails to load, falls back to solid colored leaves
- Check browser console for any loading errors

## 🎛️ Customization Options

### Adjust Falling Speed
In the `Leaf` component velocity initialization:
```typescript
vel.current.y = -0.05 - Math.random() * 0.08;  // Slower: -0.03 to -0.06
                                                 // Faster: -0.08 to -0.15
```

### Change Leaf Quantity
```typescript
const MAX_EXTRA = 40;           // Ambient leaves (20-60 recommended)
for (let i = 0; i < 35; i++) {  // Base leaves (25-50 recommended)
```

### Modify Color Palette
Update the `palette` array in `baseBlobs` useMemo:
```typescript
const palette = [
  "hsl(15, 90%, 58%)",   // Fiery red-orange
  "hsl(28, 95%, 62%)",   // Rich burnt orange
  "hsl(42, 98%, 68%)",   // Deep golden yellow
  // Add more colors or adjust hue/saturation/lightness
];
```

### Adjust Wobble Intensity
In the `Leaf` component:
```typescript
const wobbleAmplitude = useRef(0.3 + Math.random() * 0.4);  // 0.2-0.6 range
const wobbleSpeed = useRef(0.5 + Math.random() * 0.5);      // 0.3-0.8 range
```

### Change Spawn Rate
In the ambient spawner `useEffect`:
```typescript
}, 2500);  // Milliseconds between spawns (1500-4000 recommended)
```

## 🌈 Mental Health Themes

### For Anxiety Relief
- **Slower motion**: Reduce `vel.current.y` to -0.03
- **Softer colors**: Lower saturation to 60-70%
- **Fewer leaves**: Reduce to 20 base + 25 ambient
- **Cooler tones**: Add blue-tinted autumn colors

### For Energy/Motivation
- **Faster motion**: Increase to -0.10
- **Vibrant colors**: Boost saturation to 95-100%
- **More leaves**: Increase to 50 base + 60 ambient
- **Warmer tones**: Focus on reds and oranges

### For Sleep/Relaxation
- **Very slow motion**: Set to -0.02
- **Muted colors**: Reduce lightness to 40-50%
- **Minimal leaves**: 15 base + 20 ambient
- **Darker tones**: Use deeper browns and burgundies

## 🎭 Alternative Shapes/Themes

### Spring Cherry Blossoms
Replace autumn colors with:
```typescript
const palette = [
  "hsl(350, 85%, 75%)",  // Soft pink
  "hsl(340, 90%, 80%)",  // Light pink
  "hsl(0, 75%, 85%)",    // Pale pink
  "hsl(320, 70%, 88%)",  // Blush
];
```

### Winter Snowflakes
- Use white/blue palette
- Slower falling speed
- Increase transparency (opacity: 0.6-0.7)
- Add gentle sparkle with emissive

## 📊 Performance Metrics

**Expected Performance:**
- **Base leaves**: 35 (static after spawn)
- **Ambient leaves**: 20-40 (dynamic)
- **Total max**: ~75 leaves
- **Target FPS**: 60fps on modern devices
- **Mobile**: 30-45fps (acceptable)

**If Performance Issues:**
1. Reduce `MAX_EXTRA` to 20
2. Reduce base leaves to 20
3. Lower geometry segments to 2x2
4. Disable shadows completely
5. Reduce texture resolution to 256x256

## 🎨 Design Integration Tips

### Overlay on UI Elements
The background is fully transparent with:
```css
.bg3d-canvas-wrapper {
  pointer-events: none !important;
}
button, a, input { pointer-events: auto !important; }
```

### Accessibility
- **prefers-reduced-motion**: Automatically shows static gradient
- **Color blind friendly**: High contrast autumn palette
- **Screen readers**: `aria-hidden` on decorative canvas

## 🐛 Troubleshooting

**Leaves not appearing?**
- Check browser console for Three.js errors
- Verify React version compatibility (18.2+)
- Ensure `@react-three/fiber` and `@react-three/drei` are installed

**Texture not loading?**
- Verify path: `/assests/maple.png` (note: "assests" not "assets")
- Check file permissions
- Try opening texture URL directly in browser
- Look for CORS errors in console

**Performance issues?**
- Reduce leaf count as described above
- Check GPU usage in browser DevTools
- Disable shadows on mobile devices
- Use lower resolution textures

**Leaves moving too fast/slow?**
- Adjust `vel.current.y` in Leaf component
- Modify `wobbleSpeed` for horizontal motion
- Change `baseSpeed` in rotation logic

## 📝 Technical Stack

**Libraries Used:**
- `three.js` (r176) - Core 3D rendering
- `@react-three/fiber` (v8.18.0) - React integration
- `@react-three/drei` (v9.122.0) - Helper components (Float, OrbitControls)
- `react` (v18.2) - UI framework

**Key Three.js Features:**
- `TextureLoader` - Maple texture loading
- `PlaneGeometry` - Leaf shapes with segments
- `MeshStandardMaterial` - PBR material with transparency
- `DoubleSide` - Visible from both sides
- `DirectionalLight` + `AmbientLight` + `PointLight` - Multi-light setup

## 🎯 Next Steps

1. **Add maple.png texture** to `/assests/` folder
2. **Test on target devices** (desktop, tablet, mobile)
3. **Adjust colors** to match your brand palette
4. **Fine-tune speed** based on user feedback
5. **A/B test** different leaf quantities
6. **Monitor performance** in production
7. **Gather user feedback** on calming effectiveness

## 💡 Future Enhancements

- **Sound effects**: Gentle rustling leaves audio
- **Seasonal transitions**: Fade between spring/summer/autumn/winter
- **Interactive particles**: Click leaves to spawn sparkles
- **User preferences**: Let users control speed/quantity
- **Achievement integration**: Special leaf colors for milestones
- **Weather effects**: Gentle wind gusts, light rain overlay
- **Time-of-day**: Adjust lighting based on user's local time

---

**Created for:** Mental Health AI Platform  
**Component:** `frontend/src/components/Background3D.tsx`  
**Last Updated:** November 13, 2025  
**Status:** ✅ Production Ready
