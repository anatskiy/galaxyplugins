$(document).ready(function () {

    $('#rssfeeds').tabs();

    // Show 'Delete Feed' button on Tab hover
    $('#rssfeeds ul[role="tablist"] li').hover(
        function () {
            $(this).find('a').css('padding-right', 5);
            $(this).find('span').css('display', 'block');
        },
        function () {
            $(this).find('a').css('padding-right', 12);
            $(this).find('span').css('display', 'none');
        }
    );

});