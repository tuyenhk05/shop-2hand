export const exportToCSV = (data, columns, filename) => {
    if (!data || !data.length) return;

    // Create header row
    const headers = columns.map(col => `"${col.title}"`).join(',');
    
    // Create data rows
    const rows = data.map(item => {
        return columns.map(col => {
            let val = item[col.dataIndex];
            
            // Handle nested objects or custom render if needed
            if (col.renderText) {
                val = col.renderText(val, item);
            } else if (typeof val === 'object' && val !== null) {
                val = val.name || val.title || val._id || JSON.stringify(val);
            }
            
            // Escape quotes and wrap in quotes to handle commas
            val = (val === null || val === undefined) ? '' : String(val);
            val = val.replace(/"/g, '""');
            return `"${val}"`;
        }).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
