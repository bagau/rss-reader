function FeedReader() {
    /*
    * Очистка контейнера, куда выводится лента
    * */
    function cleanResult() {
        $('#feed-header, #feed-list').html("");
    }

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
    * Вывод списка новостей на страницу
    **/
    this.showFeed = function (feed) {
        var headerTmpl = Handlebars.compile($("#header-template").html());
        $('#feed-header').html(headerTmpl({
            title: feed.title,
            desc: feed.description
        }));

        var itemTmpl = Handlebars.compile($("#item-template").html());

        feed.items.forEach(function(item) {
            var date = formatDate(new Date(item.updated));

            $('#feed-list').append(itemTmpl({
                title: item.title || "Заголовок отсутствует",
                link: item.link || "#",
                desc: item.description || "Описание отсутствует",
                date: date,
                id: item.id
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
    this.addToStorage = function() {
        var idJson = localStorage.ids, idArray;

        try {
            idJson = JSON.parse(idJson);
        } catch(e) {
            idJson = "";
        }

        idArray = idJson || [];

        if (Array.isArray(idArray) === false) {
            return false;
        }

        var id = $(this).data('id');
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

    $(document).on('click', '.js-itemLink', fr.addToStorage);
});