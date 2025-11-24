/**
 * Parses CSV text into an array of participant objects.
 * @param {string} text The raw CSV text content.
 * @returns {Array<Object>} An array of participant objects.
 */
export const parseCSV = (text) => {
  const participants = [];
  const rows = text.split('\n').filter(row => row.trim() !== '');
  
  if (rows.length < 2) {
    throw new Error("CSV file must have at least one header row and one data row.");
  }
  
  const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const headerMap = {
    name: headers.indexOf('Full Name'),
    email: headers.indexOf('Email Id'),
    year: headers.indexOf('Year of Study'),
    phone: headers.indexOf('Contact Number'),
    department: headers.indexOf('Department'),
    diet: headers.indexOf('Dietary preference for refreshments ?')
  };
  
  if (headerMap.name === -1 || headerMap.email === -1 || headerMap.phone === -1) {
    throw new Error('Invalid CSV file. Must contain "Full Name", "Email Id", and "Contact Number" columns.');
  }
  
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].split(',').map(c => c.trim().replace(/"/g, ''));
    
    if (cols.length < headers.length) {
      console.warn(`Skipping malformed row: ${i + 1}`);
      continue;
    }
    
    const person = {
      id: i,
      name: cols[headerMap.name],
      email: cols[headerMap.email],
      year: cols[headerMap.year] || 'N/A',
      phone: cols[headerMap.phone],
      department: cols[headerMap.department] || 'N/A',
      diet: cols[headerMap.diet] || 'N/A',
      status: 'pending',
      admittedAt: null,
      leftAt: null,
      leaveReason: ''
    };
    
    if (person.name && person.email && person.phone) {
      participants.push(person);
    }
  }
  
  return participants;
};
