import Papa from 'papaparse';

// Load PDF.js from CDN dynamically
export function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = (err) => {
      reject(new Error("Failed to load PDF.js library from CDN."));
    };
    document.head.appendChild(script);
  });
}

/**
 * Extracts tabular data from a PDF file (ArrayBuffer) and returns it as a CSV string.
 * @param {ArrayBuffer} arrayBuffer 
 * @returns {Promise<string>}
 */
export async function parsePdfToCsv(arrayBuffer) {
  const pdfjsLib = await loadPdfJs();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  const allRows = [];
  
  // Heuristic to check if a row is footer/header noise
  const isFooterOrHeaderNoise = (row) => {
    const nonEmpty = row.filter(c => c.trim() !== "");
    if (nonEmpty.length === 1) {
      const text = nonEmpty[0].toLowerCase();
      if (
        text.startsWith("page ") || 
        text.includes("of page") ||
        text.includes("confidential") ||
        text.startsWith("date:") ||
        text.startsWith("time:") ||
        text.includes("all rights reserved")
      ) {
        return true;
      }
    }
    return false;
  };

  // Loop through pages
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    if (items.length === 0) continue;
    
    // Group items by their y-coordinate (vertical position)
    // PDF.js coordinate system starts from bottom-left (y is 0 at bottom)
    // We sort items by y-coordinate descending so text is read top-to-bottom
    const sortedItems = [...items].sort((a, b) => b.transform[5] - a.transform[5]);
    
    const lines = [];
    let currentLine = [];
    let lastY = null;
    const tolerance = 4; // tolerance in points/pixels for line grouping
    
    for (const item of sortedItems) {
      const y = item.transform[5];
      // Skip completely empty spacer items
      if (!item.str || (!item.str.trim() && item.str !== ' ')) continue;
      
      if (lastY === null) {
        currentLine.push(item);
        lastY = y;
      } else if (Math.abs(y - lastY) <= tolerance) {
        currentLine.push(item);
      } else {
        // Sort current line by x-coordinate ascending (left-to-right)
        currentLine.sort((a, b) => a.transform[4] - b.transform[4]);
        lines.push(currentLine);
        
        currentLine = [item];
        lastY = y;
      }
    }
    
    if (currentLine.length > 0) {
      currentLine.sort((a, b) => a.transform[4] - b.transform[4]);
      lines.push(currentLine);
    }
    
    // Process each line into cells (columns)
    for (const line of lines) {
      const rowValues = [];
      let currentCellText = "";
      let lastXEnd = null;
      
      for (const item of line) {
        const x = item.transform[4];
        const width = item.width || 0;
        const text = item.str;
        
        if (lastXEnd !== null) {
          const gap = x - lastXEnd;
          // If the gap is significant (e.g. > 12 pixels), we treat it as a new cell/column.
          if (gap > 12) {
            rowValues.push(currentCellText.trim());
            currentCellText = text;
          } else {
            // Append to current cell. Add space if there is a small gap.
            if (gap > 2 && !currentCellText.endsWith(' ') && !text.startsWith(' ')) {
              currentCellText += ' ' + text;
            } else {
              currentCellText += text;
            }
          }
        } else {
          currentCellText = text;
        }
        lastXEnd = x + width;
      }
      
      if (currentCellText) {
        rowValues.push(currentCellText.trim());
      }
      
      // Filter out completely empty rows and noise
      if (rowValues.some(val => val !== "") && !isFooterOrHeaderNoise(rowValues)) {
        allRows.push(rowValues);
      }
    }
  }
  
  if (allRows.length === 0) {
    throw new Error("No readable text found in PDF.");
  }

  // Heuristic to skip PDF header titles/metadata and find the actual table start
  let startRowIndex = 0;
  // Find the maximum number of columns in any row
  const colCounts = allRows.map(r => r.length);
  const maxCols = Math.max(...colCounts);
  
  if (maxCols > 2) {
    // Find the first row that has at least maxCols - 1 columns
    const firstTableLineIndex = allRows.findIndex(r => r.length >= maxCols - 1);
    if (firstTableLineIndex !== -1) {
      startRowIndex = firstTableLineIndex;
    }
  }
  
  const tableRows = allRows.slice(startRowIndex);
  
  if (tableRows.length === 0) {
    throw new Error("Failed to extract data table structure from PDF.");
  }

  // Filter out duplicate header rows (common with multi-page PDFs)
  const headerString = tableRows[0].map(h => String(h).trim().toLowerCase()).join('|');
  const filteredTableRows = [tableRows[0]];
  for (let i = 1; i < tableRows.length; i++) {
    const rowString = tableRows[i].map(c => String(c).trim().toLowerCase()).join('|');
    if (rowString === headerString) {
      continue;
    }
    filteredTableRows.push(tableRows[i]);
  }
  
  // Format the extracted grid as a CSV string
  return Papa.unparse(filteredTableRows);
}
