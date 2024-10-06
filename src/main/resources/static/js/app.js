var api = apiclient;

var BlueprintApp = (function () {
    var blueprints = [];
    var authorName = "";
    var currentBlueprint = null; // Variable para almacenar el blueprint actual
    var currentPoints = []; // Almacena los puntos del blueprint actual

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
            blueprints = data;

            var transformedBlueprints = blueprints.map(function (blueprint) {
                return {
                    name: blueprint.name,
                    numberOfPoints: blueprint.points.length
                };
            });

            renderTable(transformedBlueprints);
            updateTotalPoints(); // Actualizar total de puntos después de obtener blueprints
        });
    };

    var drawBlueprint = function (author, blueprintName) {
        api.getBlueprintsByNameAndAuthor(author, blueprintName, function (blueprint) {
            currentBlueprint = blueprint; // Almacenar el blueprint actual
            currentPoints = blueprint.points.slice(); // Almacenar los puntos actuales
            repaintCanvas(); // Repintar el canvas
            $("#name-blueprint").text(`Current blueprint: ${blueprint.name}`);
        });
    };

    var repaintCanvas = function () {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentPoints.length > 0) {
            ctx.beginPath();
            ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

            for (var i = 1; i < currentPoints.length; i++) {
                ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
            }

            ctx.stroke();
        }
    };

    var initEventHandlers = function () {
        var canvas = document.getElementById("canvas");

        canvas.addEventListener("pointerdown", function (event) {
            if (!currentBlueprint) { // Solo si hay un blueprint seleccionado
                return;
            }

            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;

            // Agregar el nuevo punto a la secuencia de puntos
            currentPoints.push({ x: x, y: y });

            // Repintar el canvas
            repaintCanvas();
        });
    };

    var saveOrUpdateBlueprint = function () {
            if (currentBlueprint) {
                api.updateBlueprint(currentBlueprint.id, currentBlueprint, function () {
                    // Después de actualizar, obtener todos los planos
                    api.getBlueprintsByAuthor(authorName, function (data) {
                        blueprints = data;
                        renderTable(blueprints.map(function (bp) {
                            return {
                                name: bp.name,
                                numberOfPoints: bp.points.length
                            };
                        }));
                        updateTotalPoints(); // Recalcular puntos totales
                    });
                });
            } else {
                alert("No hay un blueprint seleccionado para actualizar.");
            }
        };



    return {
        setAuthorName: setAuthorName,
        updateBlueprintsByAuthor: updateBlueprintsByAuthor,
        drawBlueprint: drawBlueprint,
        initEventHandlers: initEventHandlers,
        saveOrUpdateBlueprint: saveOrUpdateBlueprint
    };
})();

$("#saveUpdateBtn").on("click", function () {
    BlueprintApp.saveOrUpdateBlueprint();
});

$("#getBlueprintsBtn").on("click", function () {
    var authorInput = $("#authorInput").val();
    if (authorInput) {
        BlueprintApp.setAuthorName(authorInput);
        BlueprintApp.updateBlueprintsByAuthor(authorInput);
    } else {
        alert("Por favor ingrese un nombre de autor.");
    }
});

// Inicializar manejadores de eventos después de que el DOM esté listo
$(document).ready(function () {
    BlueprintApp.initEventHandlers();
});