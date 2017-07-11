$.getJSON("/HelloFreshArchive/recipes-flat-combined.json", function (allRecipesDataArray) {

    var recipesHTMLArray = [];

    $.each(allRecipesDataArray, function (allRecipesDataArrayKey, thisRecipeDataObject) {

        if (thisRecipeDataObject["Has Card PDF"]) {

            var imageURL = thisRecipeDataObject["Image URL"].replace("web", "320,0");
            var recipeName = thisRecipeDataObject["Full Name"];
            var userFavourites = thisRecipeDataObject["HelloFresh User Favourites"];
            if (userFavourites === null) {
                userFavourites = 0;
            }

            if (recipeName.lastIndexOf('(') > 0) {
                recipeName = recipeName.replace(/ *\([^)]*\) */g, "");
            }

            var additionalRecipeClassesArray = [];

            if (thisRecipeDataObject["Total Ingredients"] <= 6) {
                additionalRecipeClassesArray.push("fewIngredients");
            }

            if (thisRecipeDataObject["Prep Time Minutes"] <= 20) {
                additionalRecipeClassesArray.push("quick");
            }

            if (thisRecipeDataObject.Calories <= 600) {
                additionalRecipeClassesArray.push("lowCalorie");
            }
            else if (thisRecipeDataObject.Calories <= 900) {
                additionalRecipeClassesArray.push("mediumCalorie");
            }
            else {
                additionalRecipeClassesArray.push("highCalorie");
            }

            var thisRecipeHTML = '<a target="_blank" class="recipe-item ' + additionalRecipeClassesArray.join(" ") + '" href="' + thisRecipeDataObject["Card PDF Link"] + '" ' +
                'style="background-image: url(' + imageURL + ')" ' +
                'data-category="transition" ' +
                'data-cardlink="' + thisRecipeDataObject["Card PDF Link"] + '" ' +
                'data-weburl="' + thisRecipeDataObject["HelloFresh URL"] + '" ' +
                '>' +
                '<h3 class="name">' + recipeName + '</h3>' +
                '<p class="recipestat calories">' + thisRecipeDataObject.Calories + ' cal</p>' +
                '<p class="recipestat preptime">' + thisRecipeDataObject["Prep Time Minutes"] + 'm ⌚</p>' +
                '<p class="recipestat totalingredients">' + thisRecipeDataObject["Total Ingredients"] + ' 🍲</p>' +
                '<p class="recipestat userfavourites">' + userFavourites + ' ❤️</p>' +
                '</a>';

            recipesHTMLArray.push(thisRecipeHTML);
        }
    });

    var $isotopeGrid = $("div.grid");

    $isotopeGrid.html(recipesHTMLArray.join("\n"));

    // quick search regex
    var quickSearchFilterRegex;
    var buttonFilterValue;

    $isotopeGrid.isotope({
        itemSelector: '.recipe-item',
        layoutMode: 'fitRows',
        stagger: 30,
        getSortData: {
            userfavourites: '.userfavourites parseInt'
        },
        sortBy: 'userfavourites',
        sortAscending: false,
        filter: function () {
            var matchesFilter = true;

            if (quickSearchFilterRegex && !$(this).text().match(quickSearchFilterRegex)) {
                matchesFilter = false;
            }

            if (buttonFilterValue && !$(this).hasClass(buttonFilterValue)) {
                matchesFilter = false;
            }

            return matchesFilter;
        }
    });

    $('.filters-button-group').on('click', 'button', function () {
        buttonFilterValue = $(this).attr('data-classfilter');
        $isotopeGrid.isotope();
    });

    // debounce so filtering doesn't happen every millisecond
    function debounce(fn, threshold) {
        var timeout;
        return function debounced() {
            if (timeout) {
                clearTimeout(timeout);
            }

            function delayed() {
                fn();
                timeout = null;
            }

            timeout = setTimeout(delayed, threshold || 100);
        };
    }

    // use value of search field to filter
    var $quicksearch = $('.quicksearch').keyup(debounce(function () {
        quickSearchFilterRegex = new RegExp($quicksearch.val(), 'gi');
        $isotopeGrid.isotope();
    }, 200));

    // Allow user to click text to open web link rather than card PDF
    $('a.recipe-item h3.name').click(function () {
        window.open($(this).parent().data('weburl'), '_blank');
        return false;
    });

});
