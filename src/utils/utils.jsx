

import ColorThief from 'colorthief'
import tinycolor from "tinycolor2";




// Utility
export const rgbToHex = (r, g, b) => {
  const values = [r, g, b].map((value) => {
    const hex = value.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  });
  return `#${values.join('')}`;
};

export async function FindImageDominantColor(imageUrl) {
  try {
    let img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });

    let thief = new ColorThief();
    let color = thief.getColor(img);
    color = rgbToHex(color[0], color[1], color[2])

    // console.log('Dominant color:', color);
    return tinycolor(color).lighten(10).toHexString();
  } catch (error) {
    console.error('Error finding dominant color:', error);
    return "";
  }
}

export function FindDateStringLong(date) {  
  if (date != null) {
    date = new Date(date)
    return date.toLocaleDateString("en-US", {dateStyle:"long"}) 
  }
  return ""
}
