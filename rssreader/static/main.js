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
                RSSFeeds.create({
                    title:'jQuery Plugins',
                    url: $.param({u: 'http://jquery-plugins.net/rss'}).replace('u=', '')
                });
                // debugger;

                this.newFeedUrl.val('');
                this.settings.dialog('close');
                RSSReaderApp.trigger('addFeed');
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

            this.listenTo(this, 'addFeed', this.addFeed);

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
            if (index == RSSFeeds.length - 1) this.initializeTabs();

            if (RSSReaderSettings.settings.length) RSSReaderSettings.trigger('addFeedListItem', feed);
        },

        addAll: function () {
            RSSFeeds.each(this.addOne, this);
        },

        addFeed: function() {
            var content = RSSFeeds.last().toJSON(),
                tabTemplate = '<li><a href="#{href}">#{title}</a></li>',
                url = '/get_rssfeed_news/?feed_url=' + content.url,
                li = $(tabTemplate.replace(/#\{href\}/g, url).replace(/#\{title\}/g, content.title));

            // this.rssfeeds.find('.ui-tabs-nav').append(li);
            this.rssfeedList.append(li);

            if (RSSFeeds.length == 1) {
                // When adding very first feed
                this.initializeTabs();
            } else {
                this.rssfeeds.tabs('refresh');
            }
        },

        onShowSettingsBtnClick: function () {
            RSSReaderSettings.settings.dialog('open');
        },

        initializeTabs: function () {
            this.rssfeeds.tabs({
                beforeLoad: function(event, ui) {
                    // ui.ajaxSettings.url = '/get_rssfeed_news/?' + $.param({feed_url: feed.toJSON().url});
                    ui.jqXHR.fail(function() {
                        ui.panel.html("Couldn't load this feed. Contact the administrator.");
                    });
                }
            });
        }
    });

    var RSSReaderApp = new RSSReaderAppView;

});