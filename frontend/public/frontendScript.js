$(document).ready(function() {
    function loadTable(filterText = '', filterAttribute = '') {
        $.ajax({
            url: '/datatable',
            type: 'GET',
            data: { filterText: filterText, filterAttribute: filterAttribute },
            success: function(response) {
                $('#table tbody').empty();
                response.data.forEach(item => {
                    $('#table tbody').append(`
                        <tr>
                            <td>${item.nazivkluba}</td>
                            <td>${item.oib}</td>
                            <td>${item.email}</td>
                            <td>${item.adresa}</td>
                            <td>${item.mobitel}</td>
                            <td>${item.aktivan}</td>
                            <td>${item.nazivmjesta}</td>
                            <td>${item.postanskibroj}</td>
                            <td>${item.brojmjestana}</td>
                            <td>${item.nazivzupanije}</td>
                            <td>${item.glavnigrad}</td>
                            <td>${item.brojstanovnika}</td>
                        </tr>
                    `);
                });
            }
        });
    }
    loadTable();

    $('#filterForm').on('submit', function(e) {
        e.preventDefault();
        const filterText = $('#filterText').val();
        const filterAttribute = $('#filterAttribute').val();
        loadTable(filterText, filterAttribute);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('download-json').addEventListener('click', function() {
        let table = document.getElementById('table');
        let rows = Array.from(table.rows);
        let data = [];

        for (let i = 1; i < rows.length; i++) {
            let row = rows[i];
            let rowData = {};

            for (let j = 0; j < row.cells.length; j++) {
                let header = table.rows[0].cells[j].textContent;
                let cellValue = row.cells[j].textContent;
                rowData[header] = cellValue;
            }

            data.push(rowData);
        }

        let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'boksKlubovi.json';
        link.click();
    });

    document.getElementById('download-csv').addEventListener('click', function() {
        let table = document.getElementById('table');
        let rows = Array.from(table.rows);
        let csvContent = "";

        rows.forEach(function(row, index) {
            let rowData = Array.from(row.cells).map(cell => cell.textContent).join(',');
            csvContent += index === 0 ? rowData + '\n' : rowData + '\n';
        });

        let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'boksKlubovi.csv';
        link.click();
    });
});