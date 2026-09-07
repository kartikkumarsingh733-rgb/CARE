# Anti-AI Design Checklist for Dementia-Friendly Interfaces

## Purpose
This checklist prevents the interface from looking AI-generated while ensuring accessibility, clarity, and comfort for elderly dementia patients. The goal is to create interfaces that feel hand-crafted, human, and cognitively accessible.

---

## ❌ DO NOT FOLLOW THESE AI PATTERNS

### 1. Color & Gradients

- [ ] **DO NOT** use purple-to-blue gradients (the #8B5CF6 → #3B82F6 combo)
- [ ] **DO NOT** use the same "Indigo" primary color for every button
- [ ] **DO NOT** use pure white (#FFFFFF) backgrounds for light mode
- [ ] **DO NOT** use pure black (#000000) text on pure white
- [ ] **DO NOT** apply glassmorphism (frosted blur + transparency) to every card
- [ ] **DO NOT** use neon glow shadows on buttons

**DO INSTEAD:**
- Use warm, high-contrast off-whites (#FFF8F0, #FDF6EC, #F5F0EB) with matte finishes
- Use "muddy" colors: deep forest, oxblood, mustard, slate blue—but ensure **strong contrast ratios (minimum 4.5:1)**
- Use **solid, flat colors** instead of gradients to avoid visual confusion
- Pair unexpected colors (e.g., olive + coral, navy + rust) but ensure they are **distinct and discriminable** for low vision
- Use **textured backgrounds** (subtle noise, grain) that feel tactile and grounding

**DEMENTIA-FRIENDLY ADDITION:**
- Use **yellow or amber backgrounds** for night mode (reduces circadian disruption)
- Avoid blue light-heavy colors in evening interfaces
- Use **high saturation colors** for primary actions (red for stop/cancel, green for confirm/go)
- Ensure color is never the **only** way information is conveyed

---

### 2. Typography

- [ ] **DO NOT** use Inter, Poppins, Montserrat, or Roboto as the primary font
- [ ] **DO NOT** use the same font for everything (headlines AND body)
- [ ] **DO NOT** leave letter-spacing at default values
- [ ] **DO NOT** use perfectly centered text for every heading
- [ ] **DO NOT** use font sizes that are all multiples of 4

**DO INSTEAD:**
- Use a **highly readable** display font for headlines (Fraunces, Lexend, Atkinson Hyperlegible—**designed for readability**)
- Pair with a **sans-serif** body font (IBM Plex Sans, Source Sans, Work Sans) that is clean and non-distracting
- Set **generous** letter-spacing (0.02em to 0.05em) for body text
- Use **larger font sizes** (18px minimum, 24px+ for body text)
- Use monospace fonts (JetBrains Mono, IBM Plex Mono) for labels, timestamps, or data

**DEMENTIA-FRIENDLY ADDITION:**
- **Minimum 18px** for body text, **24px+** for important instructions
- Use **bold weights** for key information
- Avoid **italics** and **ALL CAPS** (harder to read)
- Use **sans-serif** fonts exclusively (serifs can confuse)
- Line height: **1.5-2.0** for body text
- Use **high contrast** text (dark on light, or light on dark)
- Include **visual icons** alongside text for key actions
- Use **short, simple sentences** with clear visual hierarchy

---

### 3. Layout & Spacing

- [ ] **DO NOT** center-align everything (header, button, image all centered)
- [ ] **DO NOT** use perfect 16px/24px/32px spacing everywhere
- [ ] **DO NOT** make every card the exact same size
- [ ] **DO NOT** use perfectly symmetrical two-column layouts
- [ ] **DO NOT** make every corner radius the same (8px everywhere)
- [ ] **DO NOT** put everything inside clean, separated boxes

**DO INSTEAD:**
- Use asymmetrical layouts (headline left, image right, button bottom-left)
- Use irregular spacing (12px top padding, 20px bottom padding)
- Vary corner radii (2px on badges, 0px on buttons, 16px on hero card only)
- Allow elements to overlap (image overlapping text, button sticking out of card)

**DEMENTIA-FRIENDLY ADDITION:**
- **Clear, predictable layouts** with consistent navigation placement
- **Generous whitespace** to reduce cognitive load
- **Visual anchors** (distinct colors, icons, shapes) for each section
- **Left-aligned text** (easier to track than justified or centered)
- **Single-column layouts** for primary content (reduces scanning confusion)
- **Consistent placement** of buttons and controls (muscle memory)
- Use **chunking**: group related items with borders or backgrounds
- **No overlapping elements** that might confuse

---

### 4. Icons & Illustrations

- [ ] **DO NOT** use 1.5px stroke outline icons (Feather, Lucide, Material Icons default style)
- [ ] **DO NOT** use "Corporate Memphis" illustrations (tiny heads, giant limbs, floating poses)
- [ ] **DO NOT** use generic 3D glossy avatars (the "blob" people)
- [ ] **DO NOT** use emoji as icon replacements
- [ ] **DO NOT** use the same icon style for every context

**DO INSTEAD:**
- Use filled icons with **bold, distinct shapes**
- Use icons from multiple sources and customize them
- Use black and white photography with film grain
- Use illustrated avatars with a unique, consistent art style

**DEMENTIA-FRIENDLY ADDITION:**
- Use **literal, recognizable icons** (house for home, envelope for messages, person for profile)
- **No abstract icons**—if it needs explanation, it's too complex
- Use **large icons** (minimum 44px touch target)
- Add **text labels** to ALL icons
- Use **consistent iconography** throughout the app
- Use **high-contrast icons** (dark on light, light on dark)
- Avoid **ornamental icons**—every icon should have a clear purpose
- Use **familiar symbols** (traffic light colors for status, checkmark for complete)

---

### 5. Buttons & Interactive Elements

- [ ] **DO NOT** make every button a rounded rectangle with a gradient
- [ ] **DO NOT** use the same button style for primary, secondary, and tertiary actions
- [ ] **DO NOT** add glow/neon shadows to primary buttons
- [ ] **DO NOT** use generic labels like "Submit," "Learn More," or "Get Started"
- [ ] **DO NOT** use smooth `ease-in-out` for every animation

**DO INSTEAD:**
- Use sharp corners (0px radius) on some buttons, rounded on others
- Use underlined text links for secondary actions
- Use unconventional labels ("Hell yeah," "Take me there," "I'm in")
- Use custom cubic-bezier curves with slight overshoot or bounce

**DEMENTIA-FRIENDLY ADDITION:**
- **Large touch targets**: minimum 44px × 44px, ideally 60px × 60px
- **Clear, explicit labels**: "Go Home," "Call Daughter," "Take Medication"
- **Color-coded actions**: green for "go/confirm," red for "stop/cancel," yellow for "caution"
- **Consistent button placement**: primary action always bottom-right, secondary bottom-left
- **Physical button feel**: use borders, shadows, or bevels to create depth
- **No accidental triggers**: confirm dialogs for destructive actions
- **Auditory feedback** for button presses (optional, with consent)
- **Haptic feedback** for confirmation (on supported devices)
- **Avoid hover-only interactions** (not accessible on tablets/mobile)

---

### 6. Imagery & Placeholders

- [ ] **DO NOT** use stock photos of smiling people in suits shaking hands
- [ ] **DO NOT** use generic landscape photos with blue skies and green grass
- [ ] **DO NOT** use perfectly cropped, centered images
- [ ] **DO NOT** use illustrations that look like they came from a template library
- [ ] **DO NOT** use AI-generated faces (they look too perfect and symmetrical)

**DO INSTEAD:**
- Use black and white photography with heavy grain
- Use abstract textures, patterns, or collages
- Use images that are deliberately off-center or oddly cropped
- Use screenshots of real interfaces (messy data, real content)

**DEMENTIA-FRIENDLY ADDITION:**
- Use **real photographs** of familiar objects, places, or people (with permission)
- Use **clear, uncluttered images** with a single focal point
- Use **high contrast** images (avoid busy patterns)
- Include **faces** that are recognizable and emotionally positive
- Use **familiar scenes** (kitchen, garden, living room) for comfort
- **No abstract or ambiguous images**
- Add **descriptive alt text** and captions to every image
- Use **slow transitions** between images (reduce disorientation)

---

### 7. Content & Copy

- [ ] **DO NOT** use "Lorem ipsum" or generic placeholder text
- [ ] **DO NOT** write copy that sounds like a LinkedIn post ("Empower your workflow")
- [ ] **DO NOT** use the word "seamless," "innovative," or "cutting-edge"
- [ ] **DO NOT** show perfect dashboard states with all metrics positive
- [ ] **DO NOT** use fake names like "John Doe" or "Jane Smith"

**DO INSTEAD:**
- Use real, messy content (bank balance of $0.42, unread messages, error notifications)
- Write copy with personality and edge ("We built this because the other tools suck")
- Show empty states, loading skeletons, and 404 pages as primary designs

**DEMENTIA-FRIENDLY ADDITION:**
- **Simple, direct language**: "Tap here to call your daughter" (not "Initiate communication")
- **Short sentences** (maximum 8-10 words per sentence)
- **Familiar terms**: "Medicine" not "Medication," "Eat" not "Consume nutrients"
- **Consistent terminology**: same word for same action every time
- **No jargon, idioms, or metaphors**
- **Clear instructions**: "Press the green button to call for help"
- **Positive framing**: "You can do this" rather than "Don't worry"
- **Use the user's name** when possible for personalization
- **Include reminders** of context: "You are at home. Your daughter is Sarah."
- **No time-sensitive language** that creates anxiety

---

### 8. Cards & Containers

- [ ] **DO NOT** give every card the same padding, border, and shadow
- [ ] **DO NOT** use soft shadows (0px 4px 12px rgba(0,0,0,0.08)) on everything
- [ ] **DO NOT** make cards perfectly rectangular with 8px radius
- [ ] **DO NOT** stack cards in a perfect grid with equal gaps
- [ ] **DO NOT** use glassmorphism or transparent overlays on cards

**DO INSTEAD:**
- Use hard shadows (2px 2px 0px #000) on some elements
- Use borders instead of shadows for card separation
- Vary card shapes (one card with 0px radius, another with 16px)
- Allow cards to have different heights and widths

**DEMENTIA-FRIENDLY ADDITION:**
- **Clear visual separation** between different content areas
- **Consistent card styles** for similar content types (all tasks look similar)
- **High contrast borders** (not subtle shadows)
- **Generous padding** inside cards (minimum 16px)
- **No overlapping elements** that might confuse
- **Distinct backgrounds** for different content categories
- Use **dividers** and **headers** to section content
- **No carousels or scrollable cards** (cognitive load)
- **Sticky headers** that stay visible when scrolling

---

### 9. Overall Aesthetic

- [ ] **DO NOT** make everything look "perfectly polished"
- [ ] **DO NOT** follow the latest Dribbble trend exactly
- [ ] **DO NOT** use dark mode as the default (unless there's a strong reason)
- [ ] **DO NOT** make the UI look like a crypto/web3 dashboard
- [ ] **DO NOT** use the same design system as every SaaS landing page

**DO INSTEAD:**
- Add subtle imperfections (slight misalignments, irregular rhythms)
- Take inspiration from print design, editorial layouts, and physical objects
- Use light mode with warm, textured backgrounds
- Make it look like a specific human with opinions designed it

**DEMENTIA-FRIENDLY ADDITION:**
- **Calm, warm, familiar aesthetic** (like a comfortable home)
- **Minimal visual noise** (reduce distractions)
- **Consistent visual language** across all screens
- **Gentle, non-anxious colors** (warm earth tones, soft blues, muted greens)
- **Familiar metaphors**: daily planner, photo album, calendar, clock
- **No jarring animations or sudden changes**
- **Familiar icons and symbols** (real-world objects)
- **Aesthetically pleasing but not overwhelming**
- **Texture and warmth** (like paper, fabric, or wood)
- **Avoid cold, clinical, or institutional aesthetics**

---

### 10. Motion & Animation

- [ ] **DO NOT** use smooth `ease-in-out` for every transition
- [ ] **DO NOT** use the same 300ms duration for everything
- [ ] **DO NOT** use generic fade-in for every element
- [ ] **DO NOT** animate everything (sometimes stillness is better)

**DO INSTEAD:**
- Use custom cubic-bezier curves with personality (springy, bouncy, or snappy)
- Vary durations (150ms for hovers, 800ms for page transitions)
- Use slide-up, slide-in-from-side, or scale with overshoot

**DEMENTIA-FRIENDLY ADDITION:**
- **Slow, gentle animations** (500ms-1000ms for transitions)
- **No parallax or complex motion**
- **Clear transition paths** (slide left to go back, slide right to go forward)
- **No auto-playing animations or videos**
- **No flashing or blinking elements** (seizure risk)
- **Optional animations** (can be turned off in settings)
- **Predictable motion**: same direction for same action
- **No sudden movements** that might startle
- **Visual cues** for motion (arrows, progress bars)

---

## ✅ FINAL SNIFF TEST

Before submitting the design, check:

1. **Would an elderly person with dementia be able to use this without frustration?** → If no, simplify.
2. **Is every action clearly labeled and easy to find?** → If no, add labels and make targets larger.
3. **Does it look like a template?** → If yes, add warmth, personality, or texture.
4. **Would a human designer cringe at this?** → If yes, fix the cringe.
5. **Is every corner radius 8px?** → If yes, go change at least three of them.
6. **Are there any overlapping or moving elements?** → If yes, reconsider for dementia patients.
7. **Is every action reversible or confirmed?** → If no, add confirmation dialogs.

---

## 📝 Notes for Implementation

**DEMENTIA-SPECIFIC PRIORITIES:**
1. **Safety first**: Never make irreversible actions easy to trigger
2. **Familiarity**: Use real names, faces, and places the user knows
3. **Consistency**: Same actions, same place, same look every time
4. **Clarity**: Every element should be self-explanatory
5. **Comfort**: Warm, calm, non-anxious interface
6. **Accessibility**: High contrast, large targets, clear fonts

**BALANCING ANTI-AI WITH DEMENTIA-FRIENDLY:**
- Some "anti-AI" suggestions (asymmetry, irregular spacing) may conflict with dementia needs
- **Prioritize clarity and predictability** over aesthetic rebellion
- Use **subtle** human touches that don't compromise usability
- **Test with real dementia patients** whenever possible

**DESIGN PRINCIPLES FOR DEMENTIA:**
- **Reduce cognitive load**: Show one thing at a time
- **Support memory**: Reminders of who, where, and what
- **Prevent errors**: Confirm destructive actions
- **Reduce anxiety**: Calm colors, familiar elements
- **Encourage independence**: Clear, easy-to-follow steps
- **Provide reassurance**: Positive feedback for completed actions
- **Use multisensory cues**: Visual, auditory (optional), haptic

**SPECIFIC DEMENTIA-FRIENDLY FEATURES TO INCLUDE:**
- **Day/night mode** based on time of day (helps with sundowning)
- **Medication reminders** with pictures of pills
- **Photo album** of family members with names
- **Video call button** with a picture of the person
- **Emergency contact** with one-touch call
- **Calendar view** showing today's events
- **Clock with date and time** (large, clear display)
- **Activity suggestions** (based on time of day)
- **Confirmation dialogs** for all actions
- **Undo option** for accidental taps

---

## 🏥 SPECIAL DEMENTIA DESIGN CONSIDERATIONS

### Cognitive Accessibility:
- **Limit choices**: Maximum 3-4 options per screen
- **Step-by-step guidance**: "First do this, then do that"
- **Visual progress indicators**: "Step 1 of 3"
- **Completion feedback**: "Great job! You've finished."
- **Error prevention**: Gray out unavailable options
- **Forgiving interactions**: Large touch targets, no precise actions needed
- **No time pressure**: No timers or countdowns
- **No distractions**: Focus on the primary task

### Visual Accessibility:
- **Minimum contrast ratio**: 7:1 for text
- **No blue-only indicators** (age-related yellowing of lens)
- **No tiny text**: Minimum 18px, ideally 24px
- **No busy backgrounds**: Solid colors or very subtle textures
- **No dithering or patterns** that might cause visual confusion
- **No flashing or strobing** effects

### Emotional Design:
- **Positive reinforcement**: "You're doing great!"
- **Familiar faces**: Photos of family and friends
- **Comforting elements**: Photos of pets, favorite places
- **No negative language**: "Cannot" → "Try this instead"
- **No alarms or loud notifications**
- **Gentle reminders**: "It's time to take your medicine" (not "EMERGENCY: MEDICATION OVERDUE")

---

## 📚 REFERENCES

- **Designing for People with Dementia** - Age UK / Alzheimer's Society
- **Universal Principles of Design** - Lidwell, Holden, Butler
- **Design for Cognitive Disabilities** - WebAIM
- **The Design of Everyday Things** - Don Norman
- **Dementia-Friendly Design Guidelines** - Stirling University
- **Microsoft Inclusive Design Toolkit**
- **WCAG 2.1 Accessibility Guidelines**