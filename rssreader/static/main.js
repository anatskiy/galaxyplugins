$(function () {

    var RSSNews = Backbone.Model.extend({
        defaults: {
            title: '',
            url: '',
            description: ''
        }
    });

    var RSSNewsList = Backbone.Collection.extend({
        model: RSSNews,
        url: '/get_rssfeed_news/'
    });

    var RSSFeed = Backbone.Model.extend({
        defaults: {
            title: '',
            url: ''
        },

        initialize: function () {
            var me = this;
            this.news = new RSSNewsList;
            this.news.fetch(
                {
                    data: {feed_url: me.get('url')},
                    type: 'POST',
                    success: function () {
                        me.trigger('change');
                    }
                }
            );
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
        tabTemplate: _.template($('#rssfeedtab-template').html()),
        newsTemplate: _.template($('#rssfeednews-template').html()),

        events: {},

        initialize: function () {
            this.rssfeeds = $('#rssfeeds');
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change', this.renderNews);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        renderTab: function (index, numTotal) {
            this.rssfeeds.append(this.tabTemplate(this.model.toJSON()));

            // Only after all tabs have been added to DOM,
            // initialize jQuery UI's tabs
            if (index == numTotal - 1) this.rssfeeds.tabs();
        },

        renderNews: function () {
            var tab = $('#rssfeedtab-' + this.model.id);
            tab.append(this.newsTemplate({news: this.model.news.toJSON()}));
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
                // TODO: add new feed
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
            view.renderTab(index, RSSFeeds.length);

            if (RSSReaderSettings.settings.length) {
                RSSReaderSettings.trigger('addFeedListItem', feed);
            }
        },

        addAll: function () {
            RSSFeeds.each(this.addOne, this);
        },

        onShowSettingsBtnClick: function () {
            RSSReaderSettings.settings.dialog('open');
        }
    });

    var RSSReaderApp = new RSSReaderAppView;

    // RSSFeeds.fetch();
    // var feed = new RSSFeed({title:'jQuery Plugins', url: 'http://jquery-plugins.net/rss'});
    // // var feed = new RSSFeed({title:'Engadget', url: 'https://www.engadget.com/rss.xml'});
    // RSSFeeds.add(feed);
    // feed.save();
    // debugger;
});