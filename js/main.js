function FeedReader() {
    /*
    * Форматирование даты
    * */
    function formatDate(date) {
        var result = "Дата не указана";

        if (isValidDate(date) === true) {
            result = addZero(date.getDate()) + "." + addZero(date.getMonth() + 1) + "." + date.getFullYear();
        }

        return result;
    }

    /*
    * Добавление нуля к дате, если он однозначный
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

    /*
    * Получение массива с id новостей из localstorage
    * */
    function getIdsFromStorage() {
        var idJson = localStorage.ids;

        try {
            idJson = JSON.parse(idJson);
        } catch(e) {
            idJson = false;
        }

        return (!Array.isArray(idJson) || !idJson) ? [] : idJson;
    }

    /*
    * Очистка контейнера, куда выводится лента
    * */
    this.cleanResult = function () {
        $('#feed-header, #feed-list').html("");
    };

    /*
    * Вывод списка новостей на страницу
    **/
    this.showFeed = function (feed) {
        var idsArray = getIdsFromStorage();

        var headerTmpl = Handlebars.compile($("#header-template").html());
        $('#feed-header').html(headerTmpl({
            title: feed.title,
            desc: feed.description
        }));

        var itemTmpl = Handlebars.compile($("#item-template").html());

        feed.items.forEach(function(item) {
            var date = formatDate(new Date(item.updated));

            var isVisited = jQuery.inArray(item.id, idsArray) > -1;

            var visitedClass = isVisited ? "is-visited" : "";

            $('#feed-list').append(itemTmpl({
                title: item.title || "Заголовок отсутствует",
                link: item.link || "#",
                desc: item.description || "Описание отсутствует",
                date: date,
                id: item.id,
                visited: visitedClass
            }));
        });
    };

    /*
    * Получение ленты по url
    * */
    this.getFeed = function (url, success, error) {
        jQuery.getFeed({
            url: "https://cors.io/?" + url,
            success: success,
            error: error
        });
    };

    /*
    * Отображение и скрытие лоадера
    * */
    this.loader = function (isShown) {
        if (isShown === true)
            $('#loader').show(300);
        else
            $('#loader').hide(300);
    };

    /*
    * Вывод сообщения пользователю
    * */
    this.message = function (msg, className) {
        className = className || "";

        if (msg) {
            $('#message').addClass(className).text(msg).show(300);
        } else {
            $('#message').hide(300);
        }
    };

    /*
    * Запись в локальное хранилище id новости при клике на нее
    * */
    this.itemLinkClick = function() {
        var idArray = getIdsFromStorage();

        var id = $(this).data('id');

        if (id === undefined) {
            return false;
        }

        $(this).addClass('is-visited');

        idArray.push(id);
        localStorage.ids = JSON.stringify(idArray);
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

        fr.cleanResult();
        fr.message(false);
        fr.loader(true);

        fr.getFeed(
            url,
            function(feed) {
                fr.loader(false);
                console.log(feed);
                fr.showFeed(feed);
            },
            function() {
                fr.loader(false);
                fr.message("Не удалось получить RSS ленту", "error");
            }
        );
    });

    $(document).on('click', '.js-itemLink', fr.itemLinkClick);
});