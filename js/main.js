function FeedReader() {
    function setFeed(feed) {
        if (feed === null) {
            return false;
        }

        $('#empty-message').slideUp(300);
        $('#loader').hide();

        var headerTemplate = Handlebars.compile($("#header-template").html());
        var itemTemplate = Handlebars.compile($("#item-template").html());

        var headerData  = {title: feed.title, desc: feed.description};
        $('#feed-header').html(headerTemplate(headerData));

        feed.items.forEach(function(elem) {
            var date = new Date(elem.updated);
            var formattedDate = (date.getDate() < 10 ? "0" : "") + date.getDate() + "." + (date.getMonth() < 10 ? "0" : "") + (date.getMonth() + 1) + "." + date.getFullYear();
            var itemData = {title: elem.title || "Заголовок новости", link: elem.link || "#", desc: elem.description || "Описание новости", date: formattedDate || ""};
            $('#feed-list').append(itemTemplate(itemData));
        });
    }

    this.getFeed = function(url) {
        jQuery.getFeed({
            url: "https://cors.io/?" + url,
            success: function(feed) {
                setFeed(feed || null);
                console.log(feed.items);
            }
        });
    };
}


var feedReader = new FeedReader();

$(function() {
    var lastRssLink = localStorage.rssLink;

    if (lastRssLink !== undefined) {
        $('#loader').show();
        feedReader.getFeed(lastRssLink);
    }

    $('#feed-form').submit(function(e) {
        e.preventDefault();
        var rssLink = $('#rss-link').val();
        localStorage.rssLink = rssLink;
        $('#loader').show();
        feedReader.getFeed(rssLink);
    });
});
