$(document).ready(function () {
  //Implementation of the search button functionality.
  $("#search-button").on("click", function () {
    //Retrieve the value from the input field labeled as "search-value."
    var searchTerm = $("#search-value").val();
    //Remove any content present in the input field.
    $("#search-value").val("");
    weatherFunction(searchTerm);
    weatherForecast(searchTerm);
  });

  //Feature enabling the search button to respond when the Enter key is pressed. 
  $("#search-button").keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode === 13) {
      weatherFunction(searchTerm);
      weatherForecast(searchTerm);
    }
  });

  //Fetch previously recorded searches from the local storage.
  var history = JSON.parse(localStorage.getItem("history")) || [];

  //Adjust the history array of searches to maintain the correct length.
  if (history.length > 0) {
    weatherFunction(history[history.length - 1]);
  }
  //Generate a series of rows for each element within the history array (searchTerms).
  for (var i = 0; i < history.length; i++) {
    createRow(history[i]);
  }

  //Display the cities searched for below the previously searched city. 
  function createRow(text) {
    var listItem = $("<li>").addClass("list-group-item").text(text);
    $(".history").append(listItem);
  }

  //Attach a listener to the list item that responds to click events.
  $(".history").on("click", "li", function () {
    weatherFunction($(this).text());
    weatherForecast($(this).text());
  });

  function weatherFunction(searchTerm) {

    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchTerm + "&appid=9f112416334ce37769e5c8683b218a0d",


    }).then(function (data) {
      //If the index of the search value is not found, include the searchValue in the history array.
      if (history.indexOf(searchTerm) === -1) {
        history.push(searchTerm);
        //Add the searchValue to the history array and store the added item in the local storage.
        localStorage.setItem("history", JSON.stringify(history));
        createRow(searchTerm);
      }
      // Clear the existing content to make room for new content.
      $("#today").empty();

      var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
      var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");


      var card = $("<div>").addClass("card");
      var cardBody = $("<div>").addClass("card-body");
      var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
      var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + " %");
      var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " K");
      console.log(data)
      var lon = data.coord.lon;
      var lat = data.coord.lat;

      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=f5a37c672388f6409ad028a92da83e9c&lat=" + lat + "&lon=" + lon,


      }).then(function (response) {
        console.log(response);

        var uvResponse = response.value;
        var uvIndex = $("<p>").addClass("card-text").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(uvResponse);


        if (uvResponse < 3) {
          btn.addClass("btn-success");
        } else if (uvResponse < 7) {
          btn.addClass("btn-warning");
        } else {
          btn.addClass("btn-danger");
        }

        cardBody.append(uvIndex);
        $("#today .card-body").append(uvIndex.append(btn));

      });

      // Combine and integrate elements together before adding them to the page.
      title.append(img);
      cardBody.append(title, temp, humid, wind);
      card.append(cardBody);
      $("#today").append(card);
      console.log(data);
    });
  }
  // function weatherForecast(searchTerm) 
  function weatherForecast(searchTerm) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchTerm + "&appid=f5a37c672388f6409ad028a92da83e9c&units=imperial",

    }).then(function (data) {
      console.log(data);
      $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

      //Utilize a loop to generate a new card for a 5-day forecast, fetching relevant data and images based on the search term.
      for (var i = 0; i < data.list.length; i++) {

        if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {

          var titleFive = $("<h3>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
          var imgFive = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
          var colFive = $("<div>").addClass("col-md-2.5");
          var cardFive = $("<div>").addClass("card bg-info text-white");
          var cardBodyFive = $("<div>").addClass("card-body p-2");
          var humidFive = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
          var tempFive = $("<p>").addClass("card-text").text("Temperature: " + data.list[i].main.temp + " °F");

          //Merge the collected elements together and present them on the page.
          colFive.append(cardFive.append(cardBodyFive.append(titleFive, imgFive, tempFive, humidFive)));
          //Attach the forecast card to a designated column, the card body to the card itself, and other elements to the body section.

          $("#forecast .row").append(colFive);
        }
      }
    });
  }

});