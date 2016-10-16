$(document).ready(function() {

    // Third-party dependencies
    // $('<script/>', {src: 'https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/9.0.0/nouislider.min.js'}).appendTo('head');
    // $('<link/>', {
    //     rel: 'stylesheet',
    //     type: 'text/css',
    //     href: 'https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/9.0.0/nouislider.min.css'
    // }).appendTo('head');

    var ProviderCollection = Backbone.Collection.extend({
        url: 'api/webhooks/price_calculator/get_data'
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

            // Listen to slider's "change" event
            me.on('sliderchange', me.onSliderChange);

            // Hide Total Price
            me.$calculatorTotalPrice.hide();

            // Get all information about providers
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
                me.$calculatorProviders.append($('<select/>', {id: 'provider-list'}));
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

            // Render all controls of a currently selected provider
            me.renderControls(providers.models[0]);

            // Render total price
            me.renderTotalPrice(providers.models[0]);

            return me;
        },

        renderControls: function(provider) {
            var me = this,
                providerModel = provider.toJSON();

            // Iterate over all provider's controls
            _.each(providerModel.controls, function(control) {
                var paramName = control.name.replace('_value', ''),
                    $controlContainer = $('<div/>', {class: 'control-container'}),
                    $controlLabel = $('<div/>', {class: 'control-label'})
                        .append($('<span/>', {text: control.label}))
                        .append($('<span/>', {
                            class: 'label-desc',
                            text:
                                providerModel.params[paramName] +
                                ' ' + providerModel.currency + ' per ' +
                                control.min + ' ' + control.units
                        })),
                    $control = $('<div/>', {id: control.name});

                $controlContainer
                    .append($control)
                    .append($controlLabel)
                    .appendTo(me.$calculatorControls);

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
                    pips: {
                        mode: 'positions',
                		values: [0, 100],
                		density: 5
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

                $control[0].noUiSlider.on('change', function() {
                    me.trigger('sliderchange');
                });
            });
        },

        renderTotalPrice: function(provider) {
            var me = this,
                providerModel = provider.toJSON(),
                formula = providerModel.formula;

            // Replace all param values in the formula
            _.each(providerModel.params, function(value, name) {
                formula = formula.replace(name, value);
            });

            // // Replace all slider values in the formula
            _.each(providerModel.controls, function(control) {
                var name = control.name,
                    value = $('#' + name)[0].noUiSlider.get();
                formula = formula.replace(name, value);
            });

            var totalPrice = eval(formula); // jshint ignore:line

            me.$calculatorTotalPrice.empty();
            // me.$calculatorTotalPrice.append($('<p/>', {
            me.$calculatorTotalPrice.append($(
                '<p>Total Price: ' +
                    '<span class="total-price">' + totalPrice.toFixed(2) + '</span> ' +
                    '<span class="total-price-currency">' + providerModel.currency + '</span>' +
                '</p>'
            ));

            // Show Total Price
            me.$calculatorTotalPrice.show();
        },

        onProviderChange: function(e) {
            var providerValue = e.target.value,
                provider = this.providerCollection.where({value: providerValue})[0];

            this.$calculatorControls.empty();
            this.$calculatorTotalPrice.empty();
            this.renderControls(provider);
            this.renderTotalPrice(provider);
        },

        onSliderChange: function() {
            var providerValue = this.$providerList.val(),
                provider = this.providerCollection.where({value: providerValue})[0];

            this.renderTotalPrice(provider);
        }
    });

    var PriceCalculatorApp = new PriceCalculatorAppView();

});
