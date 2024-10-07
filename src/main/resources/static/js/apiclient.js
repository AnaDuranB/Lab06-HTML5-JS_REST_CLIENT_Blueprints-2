var apiclient = (function () {
    var apiUrl = 'http://localhost:8080/blueprints';

    return {
        // Obtener todos los planos por autor
        getBlueprintsByAuthor: function (authname, callback) {
            return $.ajax({
                url: apiUrl + "/" + authname,
                type: "GET",
                contentType: "application/json",
                dataType: "json"
            }).done(function (data) {
                callback(data);
            }).fail(function (error) {
                console.error("Error al obtener los planos: ", error);
            });
        },

        // Obtener un plano específico por autor y nombre
        getBlueprintsByNameAndAuthor: function (authname, bpname, callback) {
            return $.ajax({
                url: apiUrl + "/" + authname + "/" + bpname,
                type: "GET",
                contentType: "application/json",
                dataType: "json"
            }).done(function (data) {
                callback(data);
            }).fail(function (error) {
                console.error("Error al obtener el plano: ", error);
            });
        },

        // Crear un nuevo plano
        addBlueprint: function (blueprint, callback) {
            return $.ajax({
                url: apiUrl,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(blueprint)
            }).done(function () {
                callback();
            }).fail(function (error) {
                console.error("Error al agregar el plano: ", error);
            });
        },

        // Actualizar un plano existente
        updateBlueprint: function (authname, bpname, updatedBlueprint, callback) {
            return $.ajax({
                url: apiUrl + "/" + authname + "/" + bpname,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(updatedBlueprint)
            }).done(function (data) {
                return data;
            }).fail(function (error) {
                console.error("Error al actualizar el plano: ", error);
            });
        },

        // Eliminar un plano existente
        deleteBlueprint: function (author, blueprintName, callback) {
            return $.ajax({
                url: apiUrl + "/" + author + "/" + blueprintName,
                type: "DELETE",
                contentType: 'application/json'
            }).done(function () {
                // Llama al callback para obtener los planos disponibles nuevamente
                callback();
            }).fail(function (error) {
                console.error("Error al eliminar el plano: ", error);
            });
        }, // Aquí agregamos la coma

        // Obtener todos los planos
        getAllBlueprints: function (callback) {
            return $.ajax({
                url: apiUrl,
                type: "GET",
                contentType: "application/json",
                dataType: "json"
            }).done(function (data) {
                callback(data);
            }).fail(function (error) {
                console.error("Error al obtener todos los planos: ", error);
            });
        }
    };
})();
