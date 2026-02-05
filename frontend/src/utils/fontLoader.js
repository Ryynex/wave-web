// src/utils/fontLoader.js

export const loadFont = (fontName) => {
  if (!fontName || fontName === "plusJakartaSans" || fontName === "sans")
    return;

  const fontId = `font-${fontName.replace(/\s+/g, "-")}`;

  if (!document.getElementById(fontId)) {
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}&display=swap`;
    document.head.appendChild(link);
  }
};
