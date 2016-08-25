function ChartBuilder(containerElementId, chartElementId) {
    const chartElement = $('#' + chartElementId);
    const chartContainer = $('#' + containerElementId);

    this.drawChart = function (dataObject) {
        setTimeout(function () {
            clearChart();
            displayChart(dataObject);
            chartContainer.css('display', 'block');
        }, 0);
    };

    function clearChart() {
        nv.graphs = [];
        chartElement.find('svg').empty()
    }

    function displayChart(dataObject) {
        nv.addGraph(function () {
            var chart = createNewChart(dataObject);
            nv.utils.windowResize(chart.update);
            return chart;
        });
    }

    function createNewChart(dataObject) {
        var chart = nv.models.lineChart()
            .useInteractiveGuideline(true)
            .duration(350)
            .showLegend(true)
            .showYAxis(true)
            .showXAxis(true);

        var xTickFormat = (dataObject.xType == 'Date')
            ? formatDate
            : d3.format('.02f');

        chart.xAxis
            .axisLabel(dataObject.xAxis)
            .tickFormat(xTickFormat);

        chart.yAxis
            .tickFormat(d3.format('.02f'));

        d3.select('#' + chartElementId + ' svg')
            .datum(dataObject.data)
            .call(chart);
        return chart;
    }

    function formatDate(d) {
        return d3.time.format('%b %Y')(new Date(d));
    }

}