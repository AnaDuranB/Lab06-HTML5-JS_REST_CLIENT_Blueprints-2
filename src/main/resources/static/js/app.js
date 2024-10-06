var api = apiclient;

var BlueprintApp = (function () {
    var blueprints = [];
    var authorName = "";

    var setAuthorName = function (newAuthorName) {
        authorName = newAuthorName;
        document.getElementById("selectedAuthor").innerText = authorName;
    };

    var updateTotalPoints = function () {
        var totalPoints = blueprints.reduce(function (acc, blueprint) {
            return acc + blueprint.points.length;
        }, 0);
        $("#totalPoints").text(totalPoints);
    };

    var renderTable = function (blueprintList) {
        var tableBody = blueprintList.map(function (blueprint) {
            return `
                <tr>
                    <td>${blueprint.name}</td>
                    <td>${blueprint.numberOfPoints}</td>
                    <td>
                        <button class="btn btn-info" onclick="BlueprintApp.drawBlueprint('${authorName}', '${blueprint.name}')">Open</button>
                    </td>
                </tr>
            `;
        }).join("");
        $("#blueprintsTable tbody").html(tableBody);
    };


    var updateBlueprintsByAuthor = function (author) {
        api.getBlueprintsByAuthor(author, function (data) {
            // Almacenamos los planos obtenidos en la variable privada blueprints
            blueprints = data;

            // Transformar los planos a una lista de objetos con nombre y número de puntos
            var transformedBlueprints = blueprints.map(function (blueprint) {
                return {
                    name: blueprint.name,
                    numberOfPoints: blueprint.points.length
                };
            });

            renderTable(transformedBlueprints);

            var totalPoints = blueprints.reduce(function (acc, blueprint) {
                return acc + blueprint.points.length;
            }, 0);

            // Actualizar el campo de total de puntos en el DOM usando jQuery
            $("#totalPoints").text(totalPoints);
        });
    };
    var drawBlueprint = function (author, blueprintName) {
        api.getBlueprintsByNameAndAuthor(author, blueprintName, function (blueprint) {
            // Limpiar el canvas
            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Dibujar los puntos en el canvas
            if (blueprint.points.length > 0) {
                ctx.beginPath();
                ctx.moveTo(blueprint.points[0].x, blueprint.points[0].y);

                // Dibujar segmentos de línea consecutivos
                for (var i = 1; i < blueprint.points.length; i++) {
                    ctx.lineTo(blueprint.points[i].x, blueprint.points[i].y);
                }

                ctx.stroke();
            }

            // Actualizar el nombre del blueprint en el DOM
            $("#name-blueprint").text(`Current blueprint: ${blueprint.name}`);
        });
    };

    return {
        setAuthorName: setAuthorName,
        updateBlueprintsByAuthor: updateBlueprintsByAuthor,
        drawBlueprint: drawBlueprint
    };
})();

$("#getBlueprintsBtn").on("click", function () {
    var authorInput = $("#authorInput").val();
    if (authorInput) {
        BlueprintApp.setAuthorName(authorInput);
        BlueprintApp.updateBlueprintsByAuthor(authorInput);
    } else {
        alert("Por favor ingrese un nombre de autor.");
    }
});
