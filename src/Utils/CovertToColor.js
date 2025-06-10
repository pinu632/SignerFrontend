import { rgb } from 'pdf-lib';

export function parseColorStringToRgb(colorString) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = colorString;
    const computed = ctx.fillStyle;

    // Convert named or hex color to RGB
    ctx.fillStyle = computed;
    const rgbStr = ctx.fillStyle;

    const match = rgbStr.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) {
        const r = parseInt(match[1], 10) / 255;
        const g = parseInt(match[2], 10) / 255;
        const b = parseInt(match[3], 10) / 255;
        return rgb(r, g, b);
    }

    // fallback: black
    return rgb(0, 0, 0);
}
