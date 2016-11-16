$(document).ready(function() {

    // Third-party dependencies
    // $('<script/>', {src: 'https://cdnjs.cloudflare.com/ajax/libs/canvasjs/1.7.0/canvasjs.min.js'}).appendTo('head');

    var TimeEstimatorAppView = Backbone.View.extend({
        el: $('#time_estimator'),

        appTemplate: _.template([
            '<div id="time_estimator-header">',
                '<h4>Time Estimator</h4>',
            '</div>',
            '<div id="time_estimator-body">',
                '<div id="chart" style="height: 400px; width: 100%;"></div>',
            '</div>',
            '<div id="time_estimator-loader"></div>'
        ].join('')),

        initialize: function() {
            var me = this,
                toolId = this.$el.parent().attr('tool-id'),
                params = JSON.stringify({tool_id: toolId});

            // me.toolId = toolId;
            me.toolId = 'Cut1';  // temporary
            me.$el.html(this.appTemplate());
            me.$body = $('#time_estimator-body');
            me.$chart = $('#chart');
            me.$loader = $('#time_estimator-loader');

            $.getJSON('api/webhooks/time_estimator/get_data', function(data) {
                me.$loader.remove();

                if (data.data.length > 0) {
                    me.render(data.data, data.units);
                } else {
                    me.$body.append($('<div/>', {
                        class: 'load-error',
                        text: 'Couldn\'t load data (see logs).'
                    }));
                }
            });
        },

        render: function(data, units) {
            var me = this;

            me.$chart.show();

            var chart = new CanvasJS.Chart('chart', {
                animationEnabled: true,
                zoomEnabled: true,
                title:{
                    text: 'Observed runtime of tool ' + me.toolId,
                    fontSize: 16
                },
                data: [
                    {
                        type: 'spline',
                        dataPoints: data
                    }
                ],
                axisY: {
                    title : 't, ' + units,
                    titleFontSize: 18,
                    // interval: 1
                }
            });

            chart.render();

            return this;
        }
    });

    new TimeEstimatorAppView();


});
