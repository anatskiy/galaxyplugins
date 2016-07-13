$(document).ready(function() {

    var XkcdAppView = Backbone.View.extend({
        el: $("#xkcdapp"),

        template: _.template($('#xkcd-img-template').html()),

        events: {
            "click #xkcd-random": "getRandomXkcd"
        },

        initialize: function() {
            var me = this;

            this.xkcdImg = this.$('#xkcd-img');

            // Get id of the last xkcd
            $.getJSON("http://dynamic.xkcd.com/api-0/jsonp/comic?callback=?", function(data) {
                me.latestXkcdId = data.num;
                me.getRandomXkcd();
            });
        },

        getRandomXkcd: function() {
            var me = this,
                randomId = Math.floor(Math.random() * this.latestXkcdId) + 1;

            $.getJSON("http://dynamic.xkcd.com/api-0/jsonp/comic/" + randomId + "?callback=?", function(data) {
                me.xkcd = {img: data.img, alt: data.alt, title: data.title, id: data.num};
                me.render();
            });
        },

        render: function() {
            this.xkcdImg.html(this.template({img: this.xkcd.img, alt: this.xkcd.alt, title: this.xkcd.title}));
        }
    });

    var XkcdApp = new XkcdAppView;

});
