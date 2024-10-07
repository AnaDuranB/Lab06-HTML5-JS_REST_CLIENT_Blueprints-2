var api = apiclient;

var BlueprintApp = (function () {
    var blueprints = [];
    var authorName = "";
    var currentBlueprint = null;
    var currentPoints = [];
    var isCreatingNewBlueprint = false;
    var hasErrorBeenShown = false;

    var setAuthorName = function (newAuthorName) {
        authorName = newAuthorName;
        document.getElementById("selectedAuthor").innerText = authorName;
        updateBlueprintsByAuthor(authorName);
    };

    var updateTotalPoints = function () {
        var totalPoints = blueprints.reduce(function (acc, blueprint) {
            return acc + blueprint.points.length;
        }, 0);
        $("#totalPoints").text(totalPoints);
    };

    var renderTable = function (blueprintList) {
        if (blueprintList.length === 0) {
            $("#blueprintsTable tbody").html("");
            return;
        }
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
            if (data && data.error) {
                if (!isCreatingNewBlueprint && !hasErrorBeenShown) {
                    alert("Error retrieving blueprints. Please try again.");
                    hasErrorBeenShown = true;
                }
                return;
            }
            hasErrorBeenShown = false;
            blueprints = data || [];

            if (blueprints.length === 0 && !isCreatingNewBlueprint) {
                alert("No blueprints found for this author.");
                renderTable([]);
                updateTotalPoints();
                currentBlueprint = null;
                currentPoints = [];
                $("#name-blueprint").text('');
                repaintCanvas();
                return;
            }

            var transformedBlueprints = blueprints.map(function (blueprint) {
                return {
                    name: blueprint.name,
                    numberOfPoints: blueprint.points.length
                };
            });

            renderTable(transformedBlueprints);
            updateTotalPoints();
        })
    };


    var drawBlueprint = function (author, blueprintName) {
        api.getBlueprintsByNameAndAuthor(author, blueprintName, function (blueprint) {
            currentBlueprint = blueprint;
            currentPoints = blueprint.points.slice();
            repaintCanvas();
            $("#name-blueprint").text(`${blueprint.name}`);
            isCreatingNewBlueprint = false;
            repaintCanvas();
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
            if (!isCreatingNewBlueprint && !currentBlueprint) {
                alert("You must create a new blueprint or open an existing one to draw.");
                return;
            }
            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;

            currentPoints.push({ x: x, y: y });

            repaintCanvas();
        });

        $("#saveUpdateBtn").on("click", saveOrUpdateBlueprint);
        $("#createBlueprintBtn").on("click", createNewBlueprint);
    };

    var saveOrUpdateBlueprint = function () {
        var blueprintName = $("#name-blueprint").text().trim();

        if (!Array.isArray(currentPoints) || currentPoints.length === 0) {
            alert("Please add points to the blueprint before saving.");
            return;
        }

        var blueprintData = {
            author: authorName,
            name: blueprintName,
            points: currentPoints
        };

        if (isCreatingNewBlueprint) {
            api.addBlueprint(blueprintData, function () {
                alert("Blueprint created successfully.");
                updateBlueprintsByAuthor(authorName);
                currentPoints = [];
                repaintCanvas();
                isCreatingNewBlueprint = false;
                currentBlueprint = null;
            }).fail(function (error) {
                console.error("Error creating the blueprint: ", error);
                alert("Error creating the blueprint: " + error.responseText);
            });
        } else {
            api.updateBlueprint(authorName, blueprintName, blueprintData)
                .done(function (response) {
                    alert("Blueprint updated successfully.");
                    updateBlueprintsByAuthor(authorName);
                })
                .fail(function (error) {
                    console.error("Error updating the blueprint: ", error);
                    alert("Error updating the blueprint: " + error.responseText);
                });
        }
    };

    var createNewBlueprint = function () {
        var authorInput = prompt("Please enter the author's name:");
        if (!authorInput) {
            alert("Author name cannot be empty. Please try again.");
            return;
        }

        BlueprintApp.setAuthorName(authorInput);
        repaintCanvas();

        var blueprintName = prompt("Please enter the name of the new blueprint:");
        if (!blueprintName) {
            alert("Blueprint name cannot be empty.");
            return;
        }

        isCreatingNewBlueprint = true;

        $("#name-blueprint").text(blueprintName);
        currentPoints = [];
        repaintCanvas();
    };

    var deleteBlueprint = function () {
        if (!currentBlueprint) {
            alert("No blueprint selected for deletion.");
            return;
        }

        var blueprintName = currentBlueprint.name;
        var author = authorName;

        api.deleteBlueprint(author, blueprintName, function () {
            alert("Blueprint successfully deleted.");
            currentBlueprint = null;
            currentPoints = [];
            $("#name-blueprint").text('');
            repaintCanvas();
            api.getBlueprintsByAuthor(author, function (data) {
                if (data && data.length > 0) {
                    updateBlueprintsByAuthor(author);
                } else {
                    alert("No more blueprints available for this author.");
                    currentBlueprint = null;
                    currentPoints = [];
                    $("#name-blueprint").text('');
                    repaintCanvas();
                    window.location.reload();
                }
            });
        }).fail(function (error) {
            console.error("Error deleting the blueprint: ", error);
            alert("Error deleting the blueprint: " + error.responseText);
        });
    };



    return {
        setAuthorName: setAuthorName,
        updateBlueprintsByAuthor: updateBlueprintsByAuthor,
        drawBlueprint: drawBlueprint,
        initEventHandlers: initEventHandlers,
        repaintCanvas: repaintCanvas,
        saveOrUpdateBlueprint: saveOrUpdateBlueprint,
        deleteBlueprint: deleteBlueprint
    };
})();

$(document).ready(function () {
    BlueprintApp.initEventHandlers();

    $("#getBlueprintsBtn").on("click", function () {
        var authorInput = $("#authorInput").val();
        if (authorInput) {
            BlueprintApp.setAuthorName(authorInput);
            BlueprintApp.updateBlueprintsByAuthor(authorInput);
        } else {
            alert("Please enter an author's name.");
        }
    });
    $('#deleteBtn').on('click', function() {
        BlueprintApp.deleteBlueprint();
    });
});