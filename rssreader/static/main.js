$(function () {

    var RSSFeed = Backbone.Model.extend({
        defaults: {
            title: '',
            url: ''
        }
    });

    var RSSFeedList = Backbone.Collection.extend({
        model: RSSFeed,
        localStorage: new Backbone.LocalStorage('rssfeeds-backbone'),
        comparator: 'order'
    });

    var RSSFeeds = new RSSFeedList;

    var RSSFeedView = Backbone.View.extend({
        tagName: 'li',

        template: _.template($('#rssfeed-template').html()),

        events: {},

        initialize: function () {
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var RSSReaderSettingsView = Backbone.View.extend({
        el: $('#rssreader-settings'),

        feedListItemTemplate: _.template($('#rssreader-settings-feedlist-item-template').html()),

        events: {
            'click #addFeedBtn': 'onAddFeedBtnClick'
        },

        initialize: function () {
            this.newFeedUrl = $('#feedUrl');
            this.settingsFeedList = $('#rssreader-settings-feedlist');
            this.settings = $('#rssreader-settings');
            this.settings.dialog({
                autoOpen: false,
                resizable: false,
                modal: true,
                // draggable: false,
                width: 350
            });

            this.on('addFeedListItem', this.addFeedListItem);
        },

        addFeedListItem: function (feed) {
            this.settingsFeedList.append(this.feedListItemTemplate(feed.toJSON()));
        },

        onAddFeedBtnClick: function () {
            var url = this.newFeedUrl.val();

            // TODO: check if a given string is a valid url
            if (url != '') {
                // RSSFeeds.fetch();
                // var feed = new RSSFeed({
                //     title:'jQuery Plugins',
                //     url: 'http://jquery-plugins.net/rss'
                // });
                // RSSFeeds.add(feed);
                // feed.save();
                // debugger;

                this.newFeedUrl.val('');
                this.settings.dialog('close');
                RSSReaderApp.trigger('refresh');
            }
        }
    });

    var RSSReaderSettings = new RSSReaderSettingsView;

    var RSSReaderAppView = Backbone.View.extend({
        el: $('#rssreaderapp'),

        emptyTemplate: _.template($('#rssfeedlist-empty-template').html()),

        events: {
            'click #showSettingsBtn': 'onShowSettingsBtnClick'
        },

        initialize: function () {
            this.rssfeeds = $('#rssfeeds');
            this.rssfeedList = $('#rssfeed-list');

            this.on('refresh', this.refresh);

            RSSFeeds.fetch();
            this.render();
        },

        render: function () {
            if (RSSFeeds.length) {
                this.addAll();
            } else {
                this.rssfeeds.hide();
                this.$el.append(this.emptyTemplate);
            }
        },

        addOne: function (feed, index) {
            var view = new RSSFeedView({model: feed});
            this.rssfeedList.append(view.render().el);

            // Only after all tabs have been added to DOM, initialize jQuery UI's tabs
            if (index == RSSFeeds.length - 1) {
                this.rssfeeds.tabs({
                    beforeLoad: function(event, ui) {
                        ui.ajaxSettings.url = '/get_rssfeed_news/?' + $.param({feed_url: feed.toJSON().url});
                        ui.jqXHR.fail(function() {
                            ui.panel.html("Couldn't load this feed. Contact the administrator.");
                        });
                    }
                });
            }

            if (RSSReaderSettings.settings.length) {
                RSSReaderSettings.trigger('addFeedListItem', feed);
            }
        },

        addAll: function () {
            RSSFeeds.each(this.addOne, this);
        },

        onShowSettingsBtnClick: function () {
            RSSReaderSettings.settings.dialog('open');
        },

        refresh: function() {
            debugger;
        }
    });

    var RSSReaderApp = new RSSReaderAppView;

});