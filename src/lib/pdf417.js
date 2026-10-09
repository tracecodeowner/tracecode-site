// PDF417 Barcode Renderer — uses bwip-js for real scannable barcode generation
import bwipjs from 'bwip-js';

export function generateBarcodeDataURL(payloadString, options = {}) {
  const {
    scale = 3,
    eclevel = 6, 
    columns = 11 // ⚡ UBAH DARI 18 MENJADI 11
  } = options;

  const canvas = document.createElement('canvas');

  try {
    bwipjs.toCanvas(canvas, {
      bcid: 'pdf417',
      text: payloadString, 
      scale: scale,
      eclevel: eclevel,
      columns: columns, // Mengunci di 11 kolom agar bentuknya tinggi & ramping
      paddingwidth: 5,
      paddingheight: 5,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('PDF417 generation error:', error);
    throw new Error('Failed to generate PDF417 barcode: ' + error.message);
  }
}

export function downloadBarcodePNG(payloadString, options = {}, filename = 'aamva-pdf417.png') {
  const dataURL = generateBarcodeDataURL(payloadString, options);
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}