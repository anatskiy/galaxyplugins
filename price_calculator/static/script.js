$(document).ready(function() {

    // Third-party dependencies
    // $('<script/>', {src: 'https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/9.0.0/nouislider.min.js'}).appendTo('head');
    // $('<link/>', {
    //     rel: 'stylesheet',
    //     type: 'text/css',
    //     href: 'https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/9.0.0/nouislider.min.css'
    // }).appendTo('head');

    var ProviderModel = Backbone.Model.extend({
        defaults: {
            name: '',
            currency: '',
            value: '',
            params: {},
            controls: [],
            formula: ''
        }
    });

    var ProviderCollection = Backbone.Collection.extend({
        url: 'api/webhooks/price_calculator/get_data',
        model: ProviderModel
    });

    var PriceCalculatorAppView = Backbone.View.extend({
        el: $("#price_calculator"),

        appTemplate: _.template([
            '<div id="price_calculator-header">',
                '<h4>Price Calculator</h4>',
            '</div>',
            '<div id="price_calculator-providers"></div>',
            '<div id="price_calculator-controls"></div>',
            '<div id="price_calculator-total-price"></div>',
            '<div id="price_calculator-loader"></div>'
        ].join('')),

        events: {
            'change #provider-list': 'onProviderChange'
        },

        initialize: function() {
            var me = this;

            me.$el.html(this.appTemplate());
            me.providerCollection = new ProviderCollection();
            me.$calculatorProviders = $('#price_calculator-providers');
            me.$calculatorControls = $('#price_calculator-controls');
            me.$calculatorTotalPrice = $('#price_calculator-total-price');
            me.$loader = $('#price_calculator-loader');

            me.on('sliderchange', me.onSliderChange);

            me.providerCollection.fetch({
                success: function(providers) {
                    me.$loader.remove();
                    me.render(providers);
                }
            });
        },

        render: function(providers) {
            var me = this;

            // If Provider List is not added to DOM
            if (!me.$providerList) {
                me.$calculatorProviders.append('<select id="provider-list"></select>');
                me.$providerList = $('#provider-list');
            }

            // Add providers to Provider List
            providers.each(function(provider) {
                var model = provider.toJSON();

                me.$providerList.append($('<option/>', {
                    text: model.name,
                    value: model.value
                }));
            }, me);

            // Show all controls of a currently selected provider
            me.renderControls(providers.models[0]);

            // Show total price
            me.renderTotalPrice(providers.models[0]);

            return me;
        },

        renderControls: function(provider) {
            var me = this,
                providerModel = provider.toJSON();

            // Iterate over all provider's controls
            _.each(providerModel.controls, function(control) {
                var $controlContainer = $('<div class="control-container"></div>'),
                    $control = $('<div/>', {id: control.name});

                me.$calculatorControls.append($control);

                // Initialize noUiSlider's slider
                noUiSlider.create($control[0], {
                    connect: [true, false],
                    tooltips: true,
                    start: control.start,
                    step: control.step,
                    range: {
                        min: control.min,
                        max: control.max
                    },
                    format: {
                        to: function(value) {
                            return parseInt(value);
                        },
                        from: function(value) {
                            return value;
                        }
                    }
                });
                // $control[0].noUiSlider.on('change', me.onSliderChange);
                $control[0].noUiSlider.on('change', function() {
                    me.trigger('sliderchange');
                });
            });
        },

        renderTotalPrice: function(provider) {
            var me = this,
                providerModel = provider.toJSON(),
                formula = providerModel.formula;

            //
            _.each(providerModel.params, function(value, name) {
                formula = formula.replace(name, value);
            });

            _.each(providerModel.controls, function(control) {
                var name = control.name,
                    value = $('#' + name)[0].noUiSlider.get();
                formula = formula.replace(name, value);
            });

            var totalPrice = eval(formula); // jshint ignore:line

            me.$calculatorTotalPrice.empty();
            me.$calculatorTotalPrice.append($('<span/>', {
                text: 'Total Price: ' + totalPrice.toFixed(2) + ' ' + providerModel.currency
            }));
        },

        onProviderChange: function(e) {
            var value = e.target.value,
                provider = this.providerCollection.where({value: value})[0];

            this.$calculatorControls.empty();
            this.renderControls(provider);
        },

        onSliderChange: function() {
            var providerValue = this.$providerList.val(),
                provider = this.providerCollection.where({value: providerValue})[0];

            this.renderTotalPrice(provider);
        }
    });

    var PriceCalculatorApp = new PriceCalculatorAppView();

});
