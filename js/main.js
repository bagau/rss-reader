function FeedReader() {
    this.showFeed = function (feed) {

        var headerTemplate = Handlebars.compile($("#header-template").html());
        $('#feed-header').html(headerTemplate({
            title: feed.title,
            desc: feed.description
        }));

        var itemTemplate = Handlebars.compile($("#item-template").html());

        feed.items.forEach(function(item) {
            var date = formatDate(new Date(item.updated));

            $('#feed-list').append(itemTemplate({
                title: item.title || "Заголовок отсутствует",
                link: item.link || "#",
                desc: item.description || "Описание отсутствует",
                date: date,
                guid: item.guid
            }));
        });
    };

    this.cleanResult = function () {
        $('#feed-header, #feed-list').html("");
    };

    function formatDate(date) {
        var result = "Дата не указана";

        if (isValidDate(date) === true) {
            result = addZero(date.getDate()) + "." + addZero(date.getMonth() + 1) + "." + date.getFullYear();
        }

        return result;
    }

    /*
    * Добавляет ноль к дате, если он однозначный
    **/
    function addZero(num) {
        return num < 10 ? "0" + num : num;
    }

    /*
    * Проверка даты на корректность
    * */
    function isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }

    this.getFeed = function (url, success, error) {
        jQuery.getFeed({
            url: "https://cors.io/?" + url,
            success: success,
            error: error
        });
    };

    this.loader = function (isShown) {
        if (isShown === true)
            $('#loader').show(300);
        else
            $('#loader').hide(300);
    };

    this.message = function (msg, className) {
        className = className || "";

        if (msg) {
            $('#message').addClass(className).text(msg).show(300);
        } else {
            $('#message').hide(300);
        }
    };

    this.addToStorage = function() {
        var localArray = localStorage.clickedIds || "";
        var id = $(this).data('guid');

        try {
            localArray = JSON.parse(localArray);
        }
        catch(e) {
            console.log(e);
        }

        localArray = localArray || [];
        localArray.push(id);
        localStorage.clickedIds.push(JSON.stringify(localArray));
    };
}

var fr = new FeedReader();

$(function() {
    $('#feed-form').submit(function(e) {
        e.preventDefault();
        var url = $('#rss-link').val();

        if (!url) {
            fr.message("Вы не ввели ссылку на RSS ленту", "error");
            return false;
        }

        fr.message(false);
        fr.loader(true);

        fr.getFeed(
            url,
            function(feed) {
                fr.loader(false);
                fr.showFeed(feed);
            },
            function() {
                fr.loader(false);
                fr.message("Не удалось получить RSS ленту", "error");
            }
        );
    });

    //$(document).on('click', '.js-itemLink', fr.addToStorage);
});


// TODO: сделать выделение если прочитано, т.е. если было нажатие на ссылку новости