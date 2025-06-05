import axios from 'axios';
import { JSDOM } from 'jsdom';
import mammoth from 'mammoth';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const readFile = promisify(fs.readFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy load pdf-parse to avoid initialization issues
let pdfParse;
const getPdfParse = async () => {
    if (!pdfParse) {
        // Create test directory and file if they don't exist
        const testDir = path.join(__dirname, '..', 'test', 'data');
        const testFile = path.join(testDir, '05-versions-space.pdf');
        
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        
        if (!fs.existsSync(testFile)) {
            fs.writeFileSync(testFile, 'Test PDF content');
        }
        
        pdfParse = (await import('pdf-parse')).default;
    }
    return pdfParse;
};
// Extract text from file
export const extractTextFromFile = async (filePath) => {
    try {
        const extension = filePath.split('.').pop().toLowerCase();
        let text = '';

        switch (extension) {
            case 'txt':
                text = await readFile(filePath, 'utf8');
                break;

            case 'pdf':
                const dataBuffer = await readFile(filePath);
                const pdfParser = await getPdfParse();
                const pdfData = await pdfParser(dataBuffer);
                text = pdfData.text;
                break;

            case 'doc':
            case 'docx':
                const docBuffer = await readFile(filePath);
                const result = await mammoth.extractRawText({ buffer: docBuffer });
                text = result.value;
                break;

            default:
                throw new Error('Unsupported file type');
        }

        return text.trim();
    } catch (error) {
        console.error('File extraction error:', error);
        throw new Error('Failed to extract text from file');
    }
}; 