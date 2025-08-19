// Test script to debug PDF conversion issues
// Run with: node test-pdf-conversion.js

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testPDFConversion() {
  console.log('🧪 Testing PDF conversion capabilities...');
  
  try {
    // Test environment
    console.log('\n📊 Environment Info:');
    console.log('Node version:', process.version);
    console.log('Platform:', process.platform);
    console.log('Current directory:', process.cwd());
    console.log('Script directory:', __dirname);
    
    // Test Jimp import
    console.log('\n🖼️ Testing Jimp...');
    try {
      const Jimp = await import('jimp');
      console.log('✅ Jimp imported successfully');
      
      // Create a simple test image
      const testImage = new Jimp.Jimp(200, 100, '#ff0000');
      testImage.print(await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK), 10, 30, 'TEST');
      
      const testImagePath = join(__dirname, 'test-image.png');
      await testImage.writeAsync(testImagePath);
      console.log('✅ Test image created:', testImagePath);
      
      // Test reading the image
      const readImage = await Jimp.Jimp.read(testImagePath);
      console.log('✅ Image read successfully, dimensions:', readImage.getWidth(), 'x', readImage.getHeight());
      
      const pngBuffer = await readImage.getBuffer(Jimp.JimpMime.png);
      console.log('✅ PNG buffer created, size:', pngBuffer.length, 'bytes');
      
    } catch (jimpError) {
      console.error('❌ Jimp error:', jimpError.message);
    }
    
    // Test pdf-lib import
    console.log('\n📄 Testing pdf-lib...');
    try {
      const { PDFDocument } = await import('pdf-lib');
      console.log('✅ pdf-lib imported successfully');
      
      // Create a simple PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([200, 100]);
      page.drawText('Test PDF', { x: 50, y: 50 });
      
      const pdfBytes = await pdfDoc.save();
      console.log('✅ PDF created successfully, size:', pdfBytes.length, 'bytes');
      
      const testPdfPath = join(__dirname, 'test-output.pdf');
      writeFileSync(testPdfPath, pdfBytes);
      console.log('✅ Test PDF saved:', testPdfPath);
      
    } catch (pdfError) {
      console.error('❌ pdf-lib error:', pdfError.message);
    }
    
    // Test combined conversion
    console.log('\n🔄 Testing PNG to PDF conversion...');
    try {
      const testImagePath = join(__dirname, 'test-image.png');
      if (existsSync(testImagePath)) {
        const Jimp = await import('jimp');
        const { PDFDocument } = await import('pdf-lib');
        
        // Read image
        const imageBuffer = readFileSync(testImagePath);
        const image = await Jimp.Jimp.read(imageBuffer);
        const pngBuffer = await image.getBuffer(Jimp.JimpMime.png);
        
        // Create PDF
        const pdfDoc = await PDFDocument.create();
        const imageEmbed = await pdfDoc.embedPng(pngBuffer);
        const { width, height } = imageEmbed.scale(1);
        
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(imageEmbed, { x: 0, y: 0, width, height });
        
        const pdfBytes = await pdfDoc.save();
        
        const convertedPdfPath = join(__dirname, 'converted-test.pdf');
        writeFileSync(convertedPdfPath, pdfBytes);
        console.log('✅ PNG to PDF conversion successful:', convertedPdfPath);
        console.log('✅ Converted PDF size:', pdfBytes.length, 'bytes');
        
      } else {
        console.log('⚠️ Test image not found, skipping conversion test');
      }
      
    } catch (conversionError) {
      console.error('❌ PNG to PDF conversion error:', conversionError.message);
      console.error('Stack:', conversionError.stack);
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPDFConversion();