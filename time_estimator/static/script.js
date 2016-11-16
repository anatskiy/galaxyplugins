$(document).ready(function() {

    // Third-party dependencies
    // $('<script/>', {src: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js'}).appendTo('head');

    var TimeEstimatorAppView = Backbone.View.extend({
        el: $('#time_estimator'),

        appTemplate: _.template([
            '<div id="time_estimator-header">',
                '<h4>Time Estimator</h4>',
            '</div>',
            '<div id="time_estimator-body">',
                '<canvas id="chart" width="400" height="400"></canvas>',
            '</div>',
            '<div id="time_estimator-loader"></div>'
        ].join('')),

        initialize: function() {
            var me = this,
                toolId = this.$el.parent().attr('tool-id'),
                params = JSON.stringify({tool_id: toolId});

            me.$el.html(this.appTemplate());
            me.$body = $('#time_estimator-body');
            me.$chart = $('#chart');
            me.$loader = $('#time_estimator-loader');

            $.getJSON('api/webhooks/time_estimator/get_data', function(data) {
                me.$loader.remove();

                if (data.data.length > 0) {
                    me.render(data.labels, data.data, data.averageLine);
                } else {
                    me.$body.append($('<div/>', {
                        class: 'load-error',
                        text: 'Couldn\'t load data (see logs).'
                    }));
                }
            });
        },

        render: function(labels, data, averageLine) {
            this.$chart.show();

            var chart = new Chart(this.$chart, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            fill: false,
                            backgroundColor: "rgba(75,192,192,0.4)",
                            borderColor: "rgba(75,192,192,1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(75,192,192,1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 1,
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: "rgba(75,192,192,1)",
                            pointHoverBorderColor: "rgba(220,220,220,1)",
                            pointHoverBorderWidth: 2,
                            pointRadius: 1,
                            pointHitRadius: 3,
                            data: data,
                            spanGaps: false
                        },
                        {
                            lineTension: 0,
                            fill: false,
                            backgroundColor: "rgba(158,158,158,0.8)",
                            borderColor: "rgba(158,158,158,0.8)",
                            borderWidth: 2,
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderWidth: 1,
                            pointHoverRadius: 3,
                            pointHitRadius: 3,
                            pointRadius: 0,
                            data: averageLine,
                            spanGaps: false
                        }
                    ]
                },
                options: {
                    title: {
                        display: true,
                        text: 'Runtime (in seconds)'
                    },
                    scales: {
                        xAxes: [{
                            display: false
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 't, sec'
                            },
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1
                            }
                        }]
                    },
                    legend: {
                        display: false
                    },
                    tooltips: {
                        enabled: false
                    }
                }
            });

            return this;
        }
    });

    new TimeEstimatorAppView();


});
