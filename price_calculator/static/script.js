$(document).ready(function() {

    // Third-party dependencies
    // $('<script/>', {src: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'}).appendTo('head');
    // $('<link/>', {
    //     rel: 'stylesheet',
    //     type: 'text/css',
    //     href: 'https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/9.0.0/nouislider.min.css'
    // }).appendTo('head');

    var ControlCollection = Backbone.Collection.extend({});

    var ProviderModel = Backbone.Model.extend({
        initialize: function() {
            this.set('_controls', new ControlCollection());
        }
    });

    var ProviderCollection = Backbone.Collection.extend({
        url: 'api/webhooks/price_calculator/get_data',
        model: ProviderModel
    });

    var ControlsView = Backbone.View.extend({
        el: '#price_calculator-controls',

        template: _.template([
            '<% _controls.each(function(control) { %>',
                '<div class="control-container">',
                    '<div class="input-group">',
                        '<input type="text" id="<%= control.attributes.name %>" class="form-control" placeholder="<%= control.attributes.label %>"></input>',
                        '<span class="input-group-addon control-units"><%= control.attributes.units %></span>',
                        '<% if (control.attributes.tooltip) { %>',
                            '<span class="input-group-addon" data-toggle="tooltip" data-placement="right" data-container="body" title="<%= control.attributes.tooltip %>">?</span>',
                        '<% } %>',
                    '</div>',
                '</div>',
            '<% }); %>'
        ].join('')),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var PriceCalculatorAppView = Backbone.View.extend({
        el: $("#price_calculator"),

        appTemplate: _.template([
            '<div id="price_calculator-header">',
                '<h4>Price Calculator</h4>',
            '</div>',
            '<div id="price_calculator-providers">',
                '<select id="provider-list"></select>',
                '<hr/>',
            '</div>',
            '<div id="price_calculator-controls"></div>',
            '<div id="price_calculator-total-price"></div>',
            '<div id="price_calculator-loader"></div>'
        ].join('')),

        calculateButtonTemplate: _.template([
            '<div class="text-centered">',
                '<button id="calculateBtn" class="btn btn-default">Calculate</button>',
            '</div>'
        ].join('')),

        totalPriceTemplate: _.template([
            '<p>Total Price: ',
                '<span class="total-price"><%= price %> </span>',
                '<span class="total-price-currency"><%= currency %>/month</span>',
            '</p>'
        ].join('')),

        events: {
            'change #provider-list': 'onProviderChange',
            'click #calculateBtn': 'onCalculateBtnClick'
        },

        initialize: function() {
            var me = this;

            me.$el.html(this.appTemplate());
            me.providerCollection = new ProviderCollection();
            me.$calculatorProviders = $('#price_calculator-providers');
            me.$providerList = $('#provider-list');
            me.$calculatorControls = $('#price_calculator-controls');
            me.$calculatorTotalPrice = $('#price_calculator-total-price');
            me.$loader = $('#price_calculator-loader');

            // Hide Total Price
            me.$calculatorTotalPrice.hide();

            // Get all information about providers
            me.providerCollection.fetch({
                success: function(providers) {
                    providers.each(function(provider) {
                        provider.attributes._controls.add(provider.attributes.controls);
                        provider.unset('controls');
                    });

                    me.$calculatorProviders.show();
                    me.$loader.remove();
                    me.render(providers);
                }
            });
        },

        render: function(providers) {
            var me = this;

            // Add providers to Provider List
            providers.each(function(provider) {
                var model = provider.toJSON();
                me.$providerList.append($('<option/>', {
                    text: model.name,
                    value: model.value
                }));
            }, me);

            // Render all controls of a currently selected provider
            var controlsView = new ControlsView({
                model: providers.models[0]
            });
            controlsView.render();

            // Initialize tooltips
            $('[data-toggle="tooltip"]').tooltip();

            // Show Calculate button
            me.$calculatorControls.append(me.calculateButtonTemplate());

            return me;
        },

        isValid: function(controls) {
            var me = this,
                valid = false;

            controls.each(function(control) {
                var model = control.toJSON(),
                    $item = $('#' + model.name),
                    $controlContainer = $item.parent().parent(),
                    value = $item.val();

                if (value !== '') {
                    if (me.isNumber(value)) {
                        valid = true;
                    } else {
                        // Mark invalid (only number is allowed)
                        $controlContainer.toggleClass('has-error', true);
                        $controlContainer.append($('<span/>', {
                            class: 'help-block',
                            text: 'Only integers and decimals are allowed.'
                        }));
                        valid = false;
                    }
                } else {
                    // Mark invalid (cannot be empty)
                    $controlContainer.toggleClass('has-error', true);
                    $controlContainer.append($('<span/>', {
                        class: 'help-block',
                        text: 'This field cannot be empty.'
                    }));
                    valid = false;
                }
            });

            return valid;
        },

        isNumber: function(value) {
            var pattern = new RegExp(/^[0-9]+([.,][0-9]+)?$/);
            return pattern.test(value);
        },

        onCalculateBtnClick: function() {
            var provider = this.providerCollection.where({
                value: this.$providerList.val()
            })[0];
            var controls = provider.attributes._controls;

            if (this.isValid(controls)) {
                this.renderTotalPrice(provider);
            }
        },

        renderTotalPrice: function(provider) {
            var me = this,
                providerModel = provider.toJSON(),
                formula = providerModel.formula;

            // Replace all param values in the formula
            _.each(providerModel.params, function(value, name) {
                formula = formula.replace(name, value);
            });

            // // Replace all input values in the formula
            providerModel._controls.each(function(control) {
                var name = control.attributes.name,
                    $item = $('#' + name),
                    value = parseFloat($item.val()),
                    $controlContainer = $item.parent().parent(),
                    $errorMsg = $controlContainer.children('.help-block');

                formula = formula.replace(name, value);

                // Clear error message
                $controlContainer.toggleClass('has-error', false);
                if ($errorMsg) {
                    $errorMsg.remove();
                }
            });

            var totalPrice = eval(formula);  // jshint ignore:line
            me.$calculatorTotalPrice.html(me.totalPriceTemplate({
                price: totalPrice.toFixed(2),
                currency: providerModel.currency
            }));

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
        }
    });

    new PriceCalculatorAppView();

});
