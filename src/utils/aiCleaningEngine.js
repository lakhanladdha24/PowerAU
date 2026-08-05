import Papa from 'papaparse';

/**
 * PowerAU Universal AI Data Cleaning & Structuring Engine
 * Pre-processes datasets to ensure clean, structured rows & columns.
 */

// Detect and reconstruct structured tables from unstructured formats (TXT, Logs, Emails, Images)
export function reconstructTable(fileName, fileText) {
  if (!fileText) return { headers: ["Line Content"], rows: [] };
  
  const ext = fileName.split('.').pop().toLowerCase();
  
  // If file is an image, simulate smart OCR table extraction
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'].includes(ext)) {
    return simulateOcrExtraction(fileName);
  }
  
  // Check if it's a log file
  if (ext === 'log' || fileText.includes('INFO') || fileText.includes('ERROR') || fileText.includes('WARN')) {
    return parseLogFile(fileText);
  }
  
  // Check if it looks like an email file
  if (fileText.includes('From:') && fileText.includes('To:') && fileText.includes('Subject:')) {
    return parseEmailFile(fileText);
  }

  // Check if it's unstructured invoice/receipt text
  if (fileText.toLowerCase().includes('invoice') || fileText.toLowerCase().includes('receipt') || fileText.toLowerCase().includes('total due')) {
    return parseReceiptOrInvoice(fileText);
  }

  return null; // Fallback to primary CSV/Text parser
}

// Simulated OCR Table Extractor for mock images/receipts
function simulateOcrExtraction(fileName) {
  const nameLower = fileName.toLowerCase();
  
  if (nameLower.includes('receipt') || nameLower.includes('bill') || nameLower.includes('invoice')) {
    return {
      headers: ["Item Description", "Quantity", "Unit Price", "Total Amount", "Tax Rate"],
      rows: [
        { id: 1, "Item Description": "Enterprise Cloud Server Node-A", "Quantity": "2", "Unit Price": "45O.OO", "Total Amount": "900.00", "Tax Rate": "8%" },
        { id: 2, "Item Description": "Relational DB Instance Storage", "Quantity": "1", "Unit Price": "125.OO", "Total Amount": "125.00", "Tax Rate": "8%" },
        { id: 3, "Item Description": "AI Model Training GPU Hrs", "Quantity": "1O", "Unit Price": "45.50", "Total Amount": "455.00", "Tax Rate": "8%" },
        { id: 4, "Item Description": "Network Data Egress (Terabytes)", "Quantity": "3", "Unit Price": "85.OO", "Total Amount": "255.00", "Tax Rate": "8%" },
        { id: 5, "Item Description": "Premium Dedicated VPN Gateway", "Quantity": "1", "Unit Price": "75.OO", "Total Amount": "75.00", "Tax Rate": "8%" }
      ]
    };
  }
  
  // Generic mock unstructured form data
  return {
    headers: ["Field Name", "Extracted Value", "Confidence Score", "Field Type"],
    rows: [
      { id: 1, "Field Name": "Customer Name", "Extracted Value": "tony stark", "Confidence Score": "98.7%", "Field Type": "Text" },
      { id: 2, "Field Name": "Billing Address", "Extracted Value": "10880 Malibu Point, CA", "Confidence Score": "94.2%", "Field Type": "Address" },
      { id: 3, "Field Name": "Transaction Date", "Extracted Value": "15-O8-2O26", "Confidence Score": "99.1%", "Field Type": "Date" },
      { id: 4, "Field Name": "Total Payments", "Extracted Value": "$1,810.00", "Confidence Score": "99.5%", "Field Type": "Currency" },
      { id: 5, "Field Name": "Contact Email", "Extracted Value": "tony@starkindustries.con", "Confidence Score": "96.4%", "Field Type": "Email" }
    ]
  };
}

// Parses system log files into structured columns
function parseLogFile(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
  const headers = ["Timestamp", "LogLevel", "Component", "Message"];
  const rows = [];
  
  let id = 1;
  for (const line of lines) {
    // Regex matching log formats like: 2026-08-05 22:38:30 [INFO] [Database] Connected to server successfully.
    const match = line.match(/^([\d-]+\s+[\d:]+)\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+(.+)$/) ||
                  line.match(/^([\d-]+\s+[\d:]+)\s+(\w+)\s+([\w\.]+)\s*-\s*(.+)$/);
                  
    if (match) {
      rows.push({
        id: id++,
        "Timestamp": match[1],
        "LogLevel": match[2],
        "Component": match[3],
        "Message": match[4]
      });
    } else {
      // Split by whitespace fallback
      const parts = line.split(/\s+/);
      if (parts.length >= 3) {
        rows.push({
          id: id++,
          "Timestamp": parts[0] + ' ' + parts[1],
          "LogLevel": parts[2] || 'INFO',
          "Component": 'System',
          "Message": parts.slice(3).join(' ')
        });
      }
    }
  }
  
  return { headers, rows: rows.length > 0 ? rows : [{ id: 1, "Timestamp": "", "LogLevel": "INFO", "Component": "File", "Message": text }] };
}

// Parses email EML header structures
function parseEmailFile(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const headers = ["Header Name", "Header Value"];
  const rows = [];
  
  let id = 1;
  let inBody = false;
  let bodyContent = "";
  
  for (const line of lines) {
    if (line === "") {
      inBody = true;
      continue;
    }
    
    if (!inBody) {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        rows.push({
          id: id++,
          "Header Name": line.substring(0, idx).trim(),
          "Header Value": line.substring(idx + 1).trim()
        });
      }
    } else {
      bodyContent += line + " ";
    }
  }
  
  if (bodyContent.trim()) {
    rows.push({
      id: id++,
      "Header Name": "Body",
      "Header Value": bodyContent.trim()
    });
  }
  
  return { headers, rows };
}

// Parses invoices / receipts text
function parseReceiptOrInvoice(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
  const headers = ["Extracted Key", "Extracted Value"];
  const rows = [];
  
  let id = 1;
  for (const line of lines) {
    const separatorIdx = line.indexOf(':') !== -1 ? line.indexOf(':') : (line.indexOf('  ') !== -1 ? line.indexOf('  ') : -1);
    if (separatorIdx !== -1) {
      rows.push({
        id: id++,
        "Extracted Key": line.substring(0, separatorIdx).trim(),
        "Extracted Value": line.substring(separatorIdx + 1).trim()
      });
    } else {
      // Look for totals or amounts
      const amountMatch = line.match(/(total|tax|subtotal|balance|due)[\s\$]*([\d\.,]+)/i);
      if (amountMatch) {
        rows.push({
          id: id++,
          "Extracted Key": amountMatch[1],
          "Extracted Value": amountMatch[2]
        });
      }
    }
  }
  
  return { headers: rows.length > 0 ? headers : ["Line Content"], rows: rows.length > 0 ? rows : lines.map((l, i) => ({ id: i + 1, "Line Content": l })) };
}

// Execute advanced data cleaning, standardization, and quality profiling
export function executeAdvancedAiClean(headers, rows) {
  const cleanHeaders = [];
  const transformationLog = [];
  const healedRows = [];
  
  // 1. Remove duplicate and empty columns
  const seenHeaderNames = new Set();
  const validColIndices = [];
  
  headers.forEach((h, colIndex) => {
    const trimmedH = h.trim();
    if (!trimmedH) {
      transformationLog.push({
        row: 'Header',
        column: `Index_${colIndex}`,
        type: 'Column Deleted',
        description: `Removed empty column at index ${colIndex}.`
      });
      return;
    }
    
    // Check if column values are entirely empty
    const isColEmpty = rows.every(r => !String(r[h] || '').trim());
    if (isColEmpty) {
      transformationLog.push({
        row: 'All',
        column: trimmedH,
        type: 'Column Deleted',
        description: `Removed column '${trimmedH}' because all its cells were empty.`
      });
      return;
    }
    
    if (seenHeaderNames.has(trimmedH.toLowerCase())) {
      transformationLog.push({
        row: 'Header',
        column: trimmedH,
        type: 'Duplicate Column Removed',
        description: `Removed duplicate column header '${trimmedH}'.`
      });
      return;
    }
    
    seenHeaderNames.add(trimmedH.toLowerCase());
    cleanHeaders.push(trimmedH);
    validColIndices.push(h);
  });

  // 2. Identify column types based on values
  const columnTypes = {};
  cleanHeaders.forEach(h => {
    let numericCount = 0;
    let dateCount = 0;
    let emailCount = 0;
    let phoneCount = 0;
    let filledCount = 0;
    
    rows.forEach(r => {
      const val = String(r[h] || '').trim();
      if (!val) return;
      filledCount++;
      
      // Clean digit test
      const cleanNum = val.replace(/[\$\,\€\£\s]/g, '').replace(/[Oo]/g, '0').replace(/[Il]/g, '1');
      if (!isNaN(cleanNum) && cleanNum !== '') numericCount++;
      
      // Date tests
      if (/^\d{4}[-/. ]\d{1,2}[-/. ]\d{1,2}$/.test(val) || /^\d{1,2}[-/. ]\d{1,2}[-/. ]\d{4}$/.test(val)) dateCount++;
      
      // Email test
      if (val.includes('@') && val.includes('.')) emailCount++;
      
      // Phone test
      const digits = val.replace(/\D/g, '');
      if (digits.length >= 7 && digits.length <= 15) phoneCount++;
    });
    
    if (filledCount > 0) {
      if (numericCount / filledCount > 0.6) {
        columnTypes[h] = 'numeric';
      } else if (dateCount / filledCount > 0.5) {
        columnTypes[h] = 'date';
      } else if (emailCount / filledCount > 0.5) {
        columnTypes[h] = 'email';
      } else if (phoneCount / filledCount > 0.5) {
        columnTypes[h] = 'phone';
      } else {
        columnTypes[h] = 'text';
      }
    } else {
      columnTypes[h] = 'text';
    }
  });

  // 3. Clean row data
  const seenRowSignatures = new Set();
  
  rows.forEach((r, rowIndex) => {
    const rowNum = rowIndex + 1;
    
    // Check if row is completely empty
    const isRowEmpty = cleanHeaders.every(h => !String(r[h] || '').trim());
    if (isRowEmpty) {
      transformationLog.push({
        row: rowNum,
        column: 'All',
        type: 'Row Deleted',
        description: `Removed empty row at index ${rowNum}.`
      });
      return;
    }
    
    // Construct row signature to detect duplicate rows
    const rowSig = cleanHeaders.map(h => String(r[h] || '').trim()).join('|');
    if (seenRowSignatures.has(rowSig)) {
      transformationLog.push({
        row: rowNum,
        column: 'All',
        type: 'Duplicate Row Purged',
        description: `Removed duplicate row signature at row ${rowNum}.`
      });
      return;
    }
    seenRowSignatures.add(rowSig);

    // Build the cleaned row
    const cleanRow = { id: healedRows.length + 1 };
    
    cleanHeaders.forEach(h => {
      let val = String(r[h] || '');
      const originalVal = val;
      const type = columnTypes[h];
      
      // A. Trim spaces & remove hidden/control characters
      val = val.trim().replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      if (val !== originalVal) {
        transformationLog.push({
          row: rowNum,
          column: h,
          type: 'White Space / Hidden Char Cleaned',
          description: `Trimmed trailing spaces and purged hidden unicode characters.`
        });
      }
      
      // B. Correct OCR Mistakes & Standardize Numbers
      if (type === 'numeric') {
        const ocrCorrected = val.replace(/[Oo]/g, '0').replace(/[Il]/g, '1');
        if (ocrCorrected !== val) {
          transformationLog.push({
            row: rowNum,
            column: h,
            type: 'OCR Correction Applied',
            description: `Corrected OCR scanning mistake: '${val}' ➔ '${ocrCorrected}'`
          });
          val = ocrCorrected;
        }
        
        // Strip currency symbols and formatting commas
        const formatCleaned = val.replace(/[\$\,\€\£\s]/g, '');
        if (formatCleaned !== val && !isNaN(formatCleaned) && formatCleaned !== '') {
          transformationLog.push({
            row: rowNum,
            column: h,
            type: 'Currency Symbol Normalized',
            description: `Stripped currency/formatting tokens from numeric field: '${val}' ➔ '${formatCleaned}'`
          });
          val = formatCleaned;
        }
      }
      
      // C. Standardize Dates
      if (type === 'date') {
        const yyyymmdd = /^(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})$/;
        const ddmmyyyy = /^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})$/;
        
        let match;
        let formattedDate = val;
        if ((match = val.match(yyyymmdd))) {
          const [_, y, m, d] = match;
          formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        } else if ((match = val.match(ddmmyyyy))) {
          const [_, d, m, y] = match;
          const day = parseInt(d);
          const month = parseInt(m);
          if (day > 12) {
            formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          } else {
            // Standardise as MM-DD-YYYY or DD-MM-YYYY fallback
            formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          }
        }
        
        if (formattedDate !== val) {
          transformationLog.push({
            row: rowNum,
            column: h,
            type: 'Date Standardized',
            description: `Normalized date format: '${val}' ➔ '${formattedDate}'`
          });
          val = formattedDate;
        }
      }
      
      // D. Fix Email Typos
      if (type === 'email') {
        let email = val.toLowerCase();
        email = email.replace(/@gmial\.com$/, '@gmail.com');
        email = email.replace(/@gamil\.com$/, '@gmail.com');
        email = email.replace(/@gmial\.co\.in$/, '@gmail.co.in');
        email = email.replace(/@gmaill\.com$/, '@gmail.com');
        email = email.replace(/@yaho\.com$/, '@yahoo.com');
        email = email.replace(/@hotmial\.com$/, '@hotmail.com');
        email = email.replace(/@outlook\.con$/, '@outlook.com');
        
        if (email !== val.toLowerCase()) {
          transformationLog.push({
            row: rowNum,
            column: h,
            type: 'Email Typo Healed',
            description: `Corrected domain server spelling error: '${val}' ➔ '${email}'`
          });
          val = email;
        } else {
          val = email; // Keep lowercase
        }
      }
      
      // E. Standardize Phone Numbers
      if (type === 'phone') {
        const digits = val.replace(/\D/g, '');
        let formattedPhone = val;
        if (digits.length === 10) {
          formattedPhone = `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length === 11 && digits.startsWith('1')) {
          formattedPhone = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        }
        
        if (formattedPhone !== val) {
          transformationLog.push({
            row: rowNum,
            column: h,
            type: 'Phone Number Standardized',
            description: `Normalized contact number: '${val}' ➔ '${formattedPhone}'`
          });
          val = formattedPhone;
        }
      }
      
      // F. Normalise Capitalization (Title Case)
      if (type === 'text' && val) {
        const hl = h.toLowerCase();
        if (hl.includes('name') || hl.includes('client') || hl.includes('customer') || hl.includes('city') || hl.includes('country')) {
          if (val === val.toUpperCase() || val === val.toLowerCase()) {
            const tc = val.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            transformationLog.push({
              row: rowNum,
              column: h,
              type: 'Capitalization Normalized',
              description: `Corrected casing to title syntax: '${val}' ➔ '${tc}'`
            });
            val = tc;
          }
        }
      }
      
      cleanRow[h] = val;
    });
    
    healedRows.push(cleanRow);
  });

  // 4. Numeric Outlier Detection (IQR Method)
  cleanHeaders.forEach(h => {
    if (columnTypes[h] === 'numeric') {
      const numbers = healedRows
        .map(r => Number(r[h]))
        .filter(n => !isNaN(n));
        
      if (numbers.length >= 4) {
        const sorted = [...numbers].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowBound = q1 - 1.5 * iqr;
        const highBound = q3 + 1.5 * iqr;
        
        healedRows.forEach((r, idx) => {
          const val = Number(r[h]);
          if (!isNaN(val) && (val < lowBound || val > highBound)) {
            transformationLog.push({
              row: idx + 1,
              column: h,
              type: 'Suspicious Outlier Tagged',
              description: `Value ${val} detected as numeric outlier (Bounds: [${lowBound.toFixed(2)}, ${highBound.toFixed(2)}]).`
            });
          }
        });
      }
    }
  });

  // Calculate Data Quality Summary Metrics
  const totalCells = cleanHeaders.length * healedRows.length;
  let emptyCells = 0;
  healedRows.forEach(r => {
    cleanHeaders.forEach(h => {
      if (!String(r[h] || '').trim()) emptyCells++;
    });
  });
  
  const completeness = totalCells > 0 ? ((totalCells - emptyCells) / totalCells) * 100 : 100;
  const healsCount = transformationLog.filter(l => l.type !== 'Row Deleted' && l.type !== 'Column Deleted' && l.type !== 'Suspicious Outlier Tagged').length;
  
  // Calculate quality score (starts at 100, drops for empty cells and active outliers)
  const anomaliesCount = transformationLog.filter(l => l.type === 'Suspicious Outlier Tagged').length;
  const qualityPenalty = (emptyCells * 2 + anomaliesCount * 5) / (totalCells || 1);
  const qualityScore = Math.max(15, Math.round((1 - Math.min(0.85, qualityPenalty)) * 100));

  const schema = cleanHeaders.map(h => ({
    name: h,
    type: columnTypes[h].toUpperCase(),
    completeness: Math.round(healedRows.filter(r => String(r[h] || '').trim()).length / (healedRows.length || 1) * 100),
    classification: columnTypes[h] === 'email' || columnTypes[h] === 'phone' ? 'PII' : (columnTypes[h] === 'numeric' ? 'FINANCIAL/METRIC' : 'DIMENSION')
  }));

  return {
    headers: cleanHeaders,
    rows: healedRows,
    transformationLog,
    qualityScore,
    completeness: Math.round(completeness),
    schema,
    emptyCount: emptyCells,
    healsCount,
    anomaliesCount
  };
}
