$(document).ready(function() {

    var PHDComicsAppView = Backbone.View.extend({
        el: $("#phdcomicsapp"),

        template: _.template($('#phdcomics-img-template').html()),

        events: {
            "click #phdcomics-random": "getRandomPHDComics"
        },

        initialize: function() {
            var me = this;

            this.phdComicsImg = this.$('#phdcomics-img');

            // Get id of the last xkcd
            $.ajax({
                url: "/get_latest_id/",
                type: "POST",
                success: function(data) {
                    me.latestPHDComicsId = data.latestId;
                    me.getRandomPHDComics();
                }
            });
        },

        getRandomPHDComics: function() {
            var me = this;

            $.ajax({
                url: "/get_phdcomics/",
                type: "POST",
                data: {latestId: me.latestPHDComicsId},
                success: function(data) {
                    me.phdComics = {src: data.src};
                    me.render();
                }
            });
        },

        render: function() {
            this.phdComicsImg.html(this.template({src: this.phdComics.src}));
        }
    });

    var PHDComicsApp = new PHDComicsAppView;

});
