function CSVParser(csvString) {
    var data = csvString.trim().split(/\r?\n/).map(function (x) {
        return x.split(',');
    });
    // First row of data is header.
    var header = data.shift();

    this.getTableData = function () {
        return {header: header, data: data};
    };

    this.getChartData = function () {
        // X-axis can be either date or numeric, Y-axis must be numeric
        var xParser = (isNaN(Date.parse(data[0][0]))) ? parseFloat : Date.parse;
        var chartData = {
            xAxis: header[0],
            xType: xParser == Date.parse ? "Date" : "Numeric",
            data: []
        };

        var xData = data.map(function (x) { return xParser(x[0]); });
        for (var i = 1; i < data[0].length; i++) {
            chartData.data.push({
                key: header[i],
                values: data.map(function (y, j) {
                    return {x: xData[j], y: parseFloat(y[i])}
                }),
                area: true
            });
        }
        return chartData;
    };
}