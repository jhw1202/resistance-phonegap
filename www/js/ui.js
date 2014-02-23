window.App = {}
App.Models = {}
App.Views = {}
App.Collections = {}
App.current = {}

$(document).ready(function(){
  $.fn.showStep = function() {
    $(this).show("slide", {direction: "right", duration: 600})
  }

  $.fn.hideStep = function() {
    $(this).hide("slide", {direction: "left"})
  }

  $(".landing").show()

  $("#start-game").click(function(){
    $('.landing').hideStep()
    $(".num-of-players").showStep()
  })

  $("#submit-num-players").click(function(){
    $(".num-of-players").hideStep()
    var numPlayers = parseInt($("#num-players option:selected").val())
    App.current.game = new App.Models.Game({numPlayers: numPlayers})
    $(".player-names").showStep()
    App.current.players = new App.Collections.Players()
  })

  $("#player-name").keyup(function(e){
    if (e.keyCode == 13 && $("#player-name").val().length > 0){
      var name = $(this).val()
      var id = App.current.players.length + 1
      App.current.players.add({name: name, id: id})
      $("#names-list").append("<li>" + name + "</li>")
      $(this).val('')

      if (App.current.players.length === App.current.game.numPlayers) {
        $(this).parent().attr("style", "visibility: hidden;")
        $("#names-entered").show()
      }
    }
  })

  $("#names-entered").click(function(){
    $(".player-names").hideStep()
    App.current.players.createSpies(App.current.game.numSpies)
    var players = _.sortBy(App.current.players.models, function(player){
      player.id
    })

    App.current.players.displayIdentities()

    $(".pass-to-left").click(function(){
      $(".find-out .name").text('')
      $("p.identity").text('')
      $("p.identity").hide()
      $(".find-out").hideStep()
      App.current.players.displayIdentities()
    })
  })

  $(".mission-no").click(function(){
    App.current.game.continueRound()
  })

  $(".mission-yes").click(function(){
    App.current.game.missionApproved()
  })

  $(".send-on-mission").click(function(){
    App.current.game.executeMission()
  })

  $(".next-round").click(function(){
    $(".mission-result").hideStep()
    $(".mission-result-is").text('')
    $(".success-votes-count").text('')
    $(".fail-votes-count").text('')

    if(App.current.game.isFinished()) {
      $(".game-result").showStep()
      App.current.game.showWinner()
    }
    else {
      App.current.game.startRound()
    }
  })

})
