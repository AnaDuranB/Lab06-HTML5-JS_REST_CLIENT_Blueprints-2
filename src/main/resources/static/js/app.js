var api = apiclient;

var BlueprintApp = (function () {
    var blueprints = [];
    var authorName = "";
    var currentBlueprint = null; // Inicializar la variable currentBlueprint
    var currentPoints = []; // Inicializar la variable currentPoints

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
            updateTotalPoints(); // Actualizar el total de puntos al finalizar
        });
    };

    var drawBlueprint = function (author, blueprintName) {
        api.getBlueprintsByNameAndAuthor(author, blueprintName, function (blueprint) {
            currentBlueprint = blueprint; // Almacenar el blueprint actual
            currentPoints = blueprint.points.slice(); // Almacenar los puntos actuales
            repaintCanvas(); // Repintar el canvas
            $("#name-blueprint").text(`${blueprint.name}`); // Corregir la sintaxis aquí
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

        // Vincula el evento del botón Save/Update
        $("#saveUpdateBtn").on("click", saveOrUpdateBlueprint);
    };

   var saveOrUpdateBlueprint = function () {
       // Obtener el nombre del plano desde el h2 en lugar de un input
       var blueprintName = $("#name-blueprint").text().trim(); // Obtener el texto y usar trim()

       if (!blueprintName) {
           alert("Por favor seleccione un plano para actualizar."); // Mensaje si el nombre está vacío
           return; // Salir de la función si el nombre está vacío
       }

       // Verificar que currentPoints no esté vacío
       if (!Array.isArray(currentPoints) || currentPoints.length === 0) {
           alert("Por favor agregue puntos al plano antes de guardar.");
           return; // Salir si no hay puntos
       }

       console.log(blueprintName);
       console.log(currentPoints);

       var updatedBlueprint = {
           name: blueprintName, // Nombre del plano
           points: currentPoints // Aquí deberías llenar los puntos que componen el plano
       };

       // Llamar a la API para actualizar el plano
       api.updateBlueprint(authorName, blueprintName, updatedBlueprint)
           .done(function (response) {
               alert("Plano actualizado con éxito.");
               updateBlueprintsByAuthor(authorName); // Actualizar la lista de planos
           })
           .fail(function (error) {
               console.error("Error al actualizar el plano: ", error);
               alert("Error al actualizar el plano: " + error.responseText);
           });

   };

    return {
        setAuthorName: setAuthorName,
        updateBlueprintsByAuthor: updateBlueprintsByAuthor,
        drawBlueprint: drawBlueprint,
        initEventHandlers:initEventHandlers,
        repaintCanvas: repaintCanvas,
        saveOrUpdateBlueprint: saveOrUpdateBlueprint
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

$(document).ready(function () {
    BlueprintApp.initEventHandlers();
});