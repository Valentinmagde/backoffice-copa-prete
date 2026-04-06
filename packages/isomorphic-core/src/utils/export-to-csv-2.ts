export function exportToCSV(
  data: any[], 
  columns: { key: string; label: string }[], 
  fileName: string
) {
  // Créer l'en-tête à partir des labels des colonnes
  const header = columns.map(col => col.label).join(',');
  
  // Créer les lignes
  const rows = data.map(row => {
    return columns.map(col => {
      let value = getNestedValue(row, col.key);
      
      // Formater la valeur pour CSV
      if (value === undefined || value === null) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value).replace(/,/g, ';');
      }
      // Échapper les guillemets et les virgules
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
      }
      return value;
    }).join(',');
  }).join('\n');

  const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Fonction utilitaire pour accéder aux propriétés imbriquées
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
}