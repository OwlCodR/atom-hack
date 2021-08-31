function getTagCard(event) {
    let tagCard = $("ion-card.card-tags");
    let grid = $("ion-grid");
    let row = $("ion-row").attr("size", "auto");

    for (let i = 0; i < 3; i++) {
        let text;
        switch (i) {
            case 1: {
                text = "Концерт";
                break;
            }
            case 2: {
                text = "Город";
                break;
            }
            case 3: {
                text = "Публика";
                break;
            }
        }

        let col = $("ion-col").attr("size", "auto");
        $("ion-col.tag").html(text).appendTo(col);
        col.appendTo(row);
    }

    row.appendTo(grid);
    grid.appendTo(tagCard);

    return tagCard;
}

function getHeader(event) {
    let header = $("ion-card-header");

    $("ion-card-title").html(event.title).appendTo(header);
    $("ion-card-subtitle").html("Organization").appendTo(header);
    $("ion-card-subtitle").html(event.dateStart).appendTo(header);

    return header;
}

function getStatGrid(event) {
    let grid = $("ion-grid");
    let row = $("ion-row");

    for (let j = 0; j < 3; j++) {
        let col = $("ion-col");

        let card = $("ion-card.card-stat");
        let grid = $("ion-grid");

        let rowTitle = $("ion-row");
        let rowValue = $("ion-row");

        let textTitle;
        let textValue;

        switch (j) {
            case 1: {
                textTitle = $("ion-text.stat-title").html("Количество мест");
                textValue = $("ion-text.stat").html(event.feeInfo.capacity);

                break;
            }
            case 2: {
                textTitle = $("ion-text.stat-title").html("Цена за вход");
                textValue = $("ion-text.stat").html(event.fee);

                break;
            }
            case 3: {
                textTitle = $("ion-text.stat-title").html("Место проведения");
                textValue = $("ion-text.stat").html("2 км от вас");

                break;
            }
        }

        textTitle.appendTo(rowTitle);
        textValue.appendTo(rowValue);

        rowTitle.appendTo(grid);
        rowValue.appendTo(grid);
        grid.appendTo(card);
        card.appendTo(col);
        col.appendTo(row);
    }

    row.appendTo(grid);

    return grid;
}

function loadEvents(limit) {
    console.log("loadEvents()");

    let ip = "secret";
    let path = "events/";
    let param = "?limit=";

    $.getJSON(ip + path + param + limit, {})
        .fail(function (data) {
            console.log("error");
        })
        .done(function (data) {
            console.log(data);

            let list = $("ion-list").attr("lines", "none");

            for (let i = 0; i < data.length; i++) {
                console.log("each()");
                // let item = $("ion-item").attr("lines", "none");
                // let card = $("ion-card");
                // let tagCard = getTagCard(item);
                // let header = getHeader(item);
                // let statGrid = getStatGrid(item);

                // tagCard.appendTo(card);
                // header.appendTo(card);
                // statGrid.appendTo(card);
                
                
                // card.appendTo(item);
                // item.appendTo(list);
            }
            //$('body').append(list);
            console.log("append()");
        });
}

loadEvents(10);

