# Notes of UI Changes

  1. Search icon inside the input — An SVG magnifying glass is absolutely positioned on the left with pl-10 padding on the input, a standard and expected pattern that makes the field's purpose immediately clear.

  2. Fixed h-11 height on input and button — Both are the same height, so the row aligns perfectly on all screen sizes without flexbox quirks.

  3. Tip text has an info icon — A small circle-i icon prefixes the tip, making it look intentional rather than an afterthought.

  4. Removed the outer card wrapper — page.tsx now wraps the search bar in its own card, so the component itself doesn't need internal padding/borders.