function TableBuilder(containerElementId, tableElementId) {
    const tableElement = $('#' + tableElementId);
    const tableContainer = $('#' + containerElementId);
    var dataTable = null;

    this.drawTable = function (dataObject) {
        setTimeout(function () {
            clearDataTable();
            var tableHtml = createTableHtml(dataObject);
            tableElement.html(tableHtml);
            dataTable = tableElement.DataTable();
            tableContainer.css('display', 'block');
        }, 0);
    };

    function clearDataTable() {
        if(dataTable) dataTable.destroy();
    }

    function createTableHtml(dataObject) {
        var tableHtml = createHeader(dataObject);
        tableHtml += createBody(dataObject);
        return tableHtml;
    }

    function createHeader(dataObject) {
        var headerHtml = '<thead><tr>';
        dataObject.header.forEach(function (columnName) {
            headerHtml += '<th>' + columnName + '</th>';
        });
        headerHtml += '</tr></thead>';
        return headerHtml;
    }

    function createBody(dataObject) {
        var bodyHtml = '<tbody>';
        dataObject.data.forEach(function (line) {
            bodyHtml += '<tr>';
            line.forEach(function (param) {
                bodyHtml += '<td>' + param + '</td>';
            });
            bodyHtml += '</tr>';
        });
        bodyHtml += '</tbody>';
        return bodyHtml;
    }
}
