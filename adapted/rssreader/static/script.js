$(document).ready(function () {

    // Third-party dependencies
    $('<script/>', {src: 'http://code.jquery.com/ui/1.12.1/jquery-ui.min.js'}).appendTo('head');
    $('<link/>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: 'http://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css'
    }).appendTo('head');

    var RSSFeed = Backbone.Model.extend({
        defaults: {
            index: '',
            title: '',
            news: []
        }
    });

    var RSSFeedList = Backbone.Collection.extend({
        model: RSSFeed,
        url: '/api/webhooks/rssreader/get_data'
    });

    var RSSFeedView = Backbone.View.extend({
        tagName: 'li',

        template: _.template('<a href="#feed-<%= index %>"><%= title %></a>'),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var RSSReaderAppView = Backbone.View.extend({
        el: $('#rssreader'),

        appTemplate: _.template(
            '<div id="rssreader-header">' +
            '<div class="rssreader-title">' +
            '<h3>RSS Reader</h3>' +
            '</div>' +
            '</div>' +
            '<div id="rssfeeds">' +
            '<ul id="rssfeed-list"></ul>' +
            '</div>' +
            '<div id="rssreader-loader"></div>'
        ),

        initialize: function () {
            var me = this,
                RSSFeeds = new RSSFeedList();

            this.$el.html(this.appTemplate());

            this.rssfeeds = $('#rssfeeds');
            this.rssfeedList = $('#rssfeed-list');
            this.loader = $('#rssreader-loader');

            RSSFeeds.fetch({
                success: function (feeds) {
                    me.render(feeds);
                }
            });
        },

        render: function (feeds) {
            if (feeds.length > 0) {
                this.loader.remove();
                this.addFeeds(feeds);
            }

            return this;
        },

        addFeeds: function (feeds) {
            var me = this;

            // Iterate over all feeds
            feeds.each(function (feed, index) {
                var view = new RSSFeedView({model: feed});
                me.rssfeedList.append(view.render().el);

                var $feedTab = $('<div>/', {id: 'feed-' + index});
                me.rssfeeds.append($feedTab);

                // Iterate over all news of a feed
                _.each(feed.toJSON().news, function (news) {
                    $feedTab.append(
                        '<div class="feednews">' +
                        '<div class="feednews-title">' +
                        '<a href="' + news.link + '" target="_blank">' + news.title + '</a>' +
                        '</div>' +
                        '<div class="feednews-description">' +
                        '<p>' + news.description + '</p>' +
                        '</div>' +
                        '</div>'
                    );
                });
            }, this);

            // Initialize jQuery UI's tabs
            this.rssfeeds.tabs();
        }
    });

    var RSSReaderApp = new RSSReaderAppView();

});
