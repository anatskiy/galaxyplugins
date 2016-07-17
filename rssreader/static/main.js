$(document).ready(function () {

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
                    async: false
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

        events: {},

        initialize: function () {
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        renderTab: function (rssfeeds, index, numTotal) {
            var content = this.model.toJSON();
            content.news = this.model.news.toJSON();
            rssfeeds.append(this.tabTemplate(content));

            // Only after all items have been added to the DOM,
            // initialize jQuery UI's tabs
            if (index == numTotal - 1) rssfeeds.tabs();
        }
    });

    var RSSReaderAppView = Backbone.View.extend({
        el: $('#rssreaderapp'),

        emptyTemplate: _.template($('#rssfeedlist-empty-template').html()),

        events: {
            'click #showSettingsBtn': 'onShowSettingsBtnClick'
        },

        initialize: function () {
            this.rssfeeds = $('#rssfeeds');
            this.rssfeedList = $('#rssfeed-list');

            this.settings = $('#rssreader-settings');
            this.settings.dialog({
                autoOpen: false,
                resizable: false,
                modal: true,
                // draggable: false,
                width: 400
            });

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
            view.renderTab(this.rssfeeds, index, RSSFeeds.length);
        },

        addAll: function () {
            RSSFeeds.each(this.addOne, this);
        },

        onShowSettingsBtnClick: function () {
            this.settings.dialog('open');
        }
    });

    var RSSReaderApp = new RSSReaderAppView;

    // Show 'Delete Feed' button on Tab hover
    // $('#rssfeeds ul[role="tablist"] li').hover(
    //     function () {
    //         $(this).find('a').css('padding-right', 5);
    //         $(this).find('span').css('display', 'block');
    //     },
    //     function () {
    //         $(this).find('a').css('padding-right', 12);
    //         $(this).find('span').css('display', 'none');
    //     }
    // );

    // RSSFeeds.fetch();
    // var feed = new RSSFeed({title:'jQuery Plugins', url: 'http://jquery-plugins.net/rss'});
    // // var feed = new RSSFeed({title:'Engadget', url: 'https://www.engadget.com/rss.xml'});
    // RSSFeeds.add(feed);
    // feed.save();

});