# BYTEBEASTS — ART & BRAND CONTEXT FILE (v1)

## 0) Objective
Define an exhaustive and operational guide (art, style, composition, prompts, negatives, and export) to consistently generate:
- Key visuals (covers, hero shots, banners, app headers)
- Individual illustrations per beast
- Stickers, avatars, emojis
- Pose/expression and prop variations
- Promotional material (Discord, social media, web, pitch)

---

## 1) Global Style

**Look & Feel**
- **Chibi / Kawaii 3D cartoon**: large head (~55–65% of character height), oversized eyes, compact rounded bodies.
- **Toy-grade finish**: glossy/plastic polished surface, micro-texture imperceptible, **no** realistic pores.
- **Soft shadows** and subtle AO under feet/tail.
- **No outlines**; silhouette defined by volume.
- **Colors**: **saturated**, vibrant, high contrast against neutral backgrounds.
- **Expressiveness**: big starry/circular highlights in eyes; simple friendly smiles.

**Lighting & Camera**
- **Top key light**, soft and diffuse, gentle frontal fill, subtle cool rim to separate from background.
- Enough intensity for highlights in eyes/horns/scales without blowing out whites.
- Camera **35–50mm equivalent**, optional slight tilt down (1–3°). Characters centered, no wide distortion.

**Backgrounds**
- **Dark gradient** (black → dark gray #0A0A0A → #1E1E1E) or light variant (white → very light gray).
- Subtle glow/halo behind character in hero shots.

**Materials**
- **BaseColor** saturated, **Specular** medium-high (0.4–0.6), **Roughness** 0.25–0.4.
- **Subsurface** scattering light on light zones (belly, horns, cheeks).
- Minimal **Normal/Height** for stylized scales or fur blocks.

**Shadows/Contact**
- Soft elliptical ground shadows per beast; glowing objects (logos) should project subtle colored light spill.

---

## 2) Species Profiles

### 2.1 Baby Dragon (RED) — “The Hero”
**Visual role**: center/protagonist.  
**Silhouette**: large head with rounded horns, light segmented belly, small triangular wings, tail with tiny spines.

**Palette**
- Red body: #E0462E (shadows #B73022, lights #FF6A4B)
- Belly: #EED4AE (shadows #D9B98D)
- Horns/forehead plate: #F3E4CF
- Wing membrane: #E34B2F
- Eyes: reddish brown #7A3A24, with bright white highlights.

**Details**
- Almost smooth surface; only subtle scale bump.
- Small nostrils, round cheeks.
- Rounded bone-colored claws.

**Poses**
- Hero stand, wings semi-open.
- Guarding behind object (logo).
- Playful, wings mid-flap.

**Expressions**
- Happy, curious, proud.

---

### 2.2 Baby Snake (BLUE) — “The Buddy”
**Visual role**: left support, circular rhythm at bottom.  
**Silhouette**: compact coils, large head, short snout, tiny rounded fangs.

**Palette**
- Blue body: #2D85D3 (shadows #1D5EA5, lights #56A9F1)
- Scale pattern: slightly darker blue.
- Belly: #F0912C (shadows #CC7525, lights #FFB25B)
- Tail fin: #E0572F
- Eyes: purple #7E58E8 with bold shine.

**Details**
- Stylized hex/oval scales, very minimal bump.
- Small mouth with smile; **no forked tongue** unless specified.
- Body always chibi-compact, never elongated.

**Poses**
- Chibi coil.
- Touching/partially wrapping object.
- Bouncy pose (compressed coil).

**Expressions**
- Excited, cheeky, proud.

---

### 2.3 Baby Wolf (PURPLE) — “The Charmer”
**Visual role**: right support, charm/appeal.  
**Silhouette**: large ears, soft front tuft, fluffy white chest, rounded tail with light tip.

**Palette**
- Purple body: #6F5AC6 (shadows #4E3C97, lights #8E7FE2)
- White/cream chest: #F3ECE6
- Inner ear: #D488A7
- Nose: #1A1A1A
- Eyes: dark violet #5A44B6

**Details**
- Fur represented as **blocks of volume**, not strands.
- Short paws, pink pads on belly-up poses.

**Poses**
- Sitting chibi.
- Puppy roll (belly-up, paws up).
- Play bow.

**Expressions**
- Happy, playful, surprised.

---

## 3) Composition (Trio)

- Order: **Snake — Dragon — Wolf** (left-center-right).
- Relative scale: Dragon 1.0x, Wolf 0.85–0.9x, Snake 0.8–0.85x.
- Align feet/base level; snake always compact coil.
- Central glowing object (logo) between snake and wolf.
- Subtle halo behind group for separation.

---

## 4) Glow & Object Interaction
- Blue glow #5AA7FF for UI objects.
- Snake may wrap gently, wolf may roll/play nearby, dragon stands protective behind.
- Soft light spill projected onto paws/bellies.

---

## 5) Expressions System
- Neutral happy, content (eyes half-closed), amazed (mouth “o”), cheeky (one eyebrow), sleepy (low eyelids), excited (eyes wider, stronger highlight).
- Always 2 highlights in eyes.

---

## 6) Props
- Cute/harmless only: fruit, magical sparkles, mini campfire, water drops.
- Avoid: weapons, gore, realistic dirt/grunge.

---

## 7) Export

**Sizes**
- Covers/Banners: 1920×1080, 2560×1440, 2048×2048.
- Icons: 1024×1024, downscaled to 512/256.
- Stickers: 1024×1024 PNG transparent.

**Deliverables**
- PNG (transparent background if needed), WEBP (web), SVG (logos/UI).
- Naming: `bb_[species]_[pose]_[mood]_[bg-dark|bg-light]_[size].png`

---

## 8) Prompt Templates

### Individual
```
High-quality 3D chibi/kawaii illustration, glossy toy-like finish, no outlines, 
soft top lighting, soft shadows, subtle halo. 
[Species=Red baby dragon/Blue baby snake/Purple baby wolf] with chibi proportions 
(large head ~60%, compact rounded body), big eyes with two highlights, 
saturated species palette, minimal clean details (stylized scales/fur), 
expression [happy/playful/curious], pose [hero/sit/coil/roll], 
dark or light gradient background. Crisp render, smooth glossy materials.
```

### Trio with Object
```
High-quality 3D chibi/kawaii trio composition. 
Center: bright glowing Discord logo (blue #5AA7FF) with soft light spill on characters. 
Left: blue baby snake in compact coil, cheerful, gently touching the logo. 
Center/back: red baby dragon standing proudly with small wings slightly open. 
Right: purple baby wolf rolling belly-up like a puppy, smiling joyfully. 
Glossy toy-like materials, soft top light + rim, dark gradient background.
```

### Sticker Pack
```
Set of 3D chibi/kawaii stickers with transparent background: 
red baby dragon (thumbs up), blue baby snake (heart eyes), purple baby wolf (belly-up laugh). 
Glossy finish, clean silhouettes, saturated palettes, 
consistent lighting, no ground shadow. 
Centered framing, 1024x1024 each, PNG with alpha.
```

---

## 9) Negative Prompts
- No realism, no fur strands, no sharp fangs, no gore.
- Avoid grunge, dirty metals, voxel/pixel art unless specified.
- Snake must stay compact (never elongated).
- Wolf must stay smooth-furred, not spiky or realistic.
- Dragon must keep small rounded wings and horns.

---

## 10) QC Checklist
- [ ] Chibi proportions (head ≥55%).
- [ ] Big eyes with 2 highlights.
- [ ] Glossy toy-like material.
- [ ] Correct palettes per species.
- [ ] Snake compact, not elongated.
- [ ] Wolf fluffy block fur, no strands.
- [ ] Dragon with small rounded wings/horns.
- [ ] Proper soft lighting & rim.
- [ ] Background gradient clean, correct padding.
- [ ] Trio composition order & relative scaling correct.

---

## 11) Iteration Tips
- If not kawaii enough → increase eye size, soften shadows, pastel highlights.
- If flat → increase specular, lower roughness, add cool rim.
- If snake too long → “compact coil pose”.
- If wolf lacks charm → “belly-up puppy pose”.

---

## 12) Palettes (HEX)
- Dragon: Red #E0462E | Belly #EED4AE | Horns #F3E4CF | Wings #E34B2F | Eyes #7A3A24  
- Snake: Blue #2D85D3 | Belly #F0912C | Tail #E0572F | Eyes #7E58E8  
- Wolf: Purple #6F5AC6 | Chest #F3ECE6 | Inner Ear #D488A7 | Nose #1A1A1A | Eyes #5A44B6

---

## 13) Branding Notes
- Game logo used separately from characters (not overlapping faces).
- Third-party logos (like Discord) may appear as **props** that beasts interact with, never as “tattoos”.
