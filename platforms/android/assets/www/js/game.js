$(document).ready(function(){
  App.Models.Game = Backbone.Model.extend({
    initialize: function(gameData){
      this.numPlayers = gameData.numPlayers
      this.numSpies = this.getNumSpies()
      this.numResistance = this.numPlayers - this.numSpies
      this.resistanceScore = 0
      this.spyScore = 0
      this.rejectionCount = 0
      this.missionCount = 0
    },

    resetRejection: function() {
      this.rejectionCount = 0
    },

    addRejection: function() {
      this.rejectionCount += 1
    },

    getNumSpies: function(){
      var numSpies
      switch(this.numPlayers)
      {
      case 5:
        numSpies = 2
        break
      case 6:
        numSpies = 2
        break
      case 7:
        numSpies = 3
        break
      case 8:
        numSpies = 3
        break
      case 9:
        numSpies = 3
        break
      case 10:
        numSpies = 4
        break
      }
      return numSpies
    },

    startRound: function(){
      this.missionCount++
      $(".mission-vote").showStep()
      this.currentMission = new App.Models.Mission({missionNum: this.missionCount})
      var currentLeader = App.current.players.incrementLeader()
      $(".rejection-count").text(this.rejectionCount)
      $(".mission-number").text(this.missionCount)
      $(".mission-players-num").text(this.currentMission.numMembers)
      $(".fails-required").text(this.currentMission.failsRequired)
      $(".mission-leader").text(currentLeader.name)
      $(".resistance-score").text(this.resistanceScore)
      $(".spy-score").text(this.spyScore)
    },

    continueRound: function() {
      var currentLeader = App.current.players.incrementLeader()
      this.rejectionCount++
      $(".rejection-count").text(this.rejectionCount)
      $(".mission-number").text(this.missionCount)
      $(".mission-leader").text(currentLeader.name)
    },

    missionApproved: function() {
      this.resetRejection()
      var _this = this
      $(".mission-vote").hideStep()
      $("#mission-players-list").html('')
      $("button.send-on-mission").attr("disabled", "disabled")
      $(".select-mission-members").showStep()
      $(".mission-member-count").text(this.currentMission.numMembers)
      _.each(App.current.players.models, function(player){
        $("#mission-players-list").append("<div class='select-mission-member' " + "playerId='" + player.id +
                                          "'>" + player.name + "</div>")
      })

      $(".select-mission-member").click(function(){
        $(this).toggleClass("selected")
        var id = $(this).attr("playerId")
        var missionMemberNum = _this.currentMission.numMembers

        if($(".select-mission-member.selected").length === missionMemberNum) {
          $("button.send-on-mission").removeAttr("disabled")
        }
        else {
          $("button.send-on-mission").attr("disabled", "disabled")
        }
      })
    },

    executeMission: function() {
      var _this = this
      var mission = this.currentMission
      $(".select-mission-members").hideStep()
      $(".mission-voting").showStep()
      _.each($(".select-mission-member.selected"), function(el){
        var player = App.current.players.get($(el).attr("playerId"))
        mission.members.push(player)
      })
      mission.missionSuccessVote(0)
    },

    showMissionResult: function() {
      var _this = this
      $(".mission-voting").hideStep()
      $(".mission-result").showStep()
      $(".next-round").hide()
      setTimeout(function(){
        $(".mission-result-is").text(_this.currentMission.result() + "!")
        $(".success-votes-count").text(_this.currentMission.successVotes)
        $(".fail-votes-count").text(_this.currentMission.failVotes)
        $(".next-round").show()
      }, 1200)
    },

    isFinished: function() {
      if(this.resistanceScore === 3 || this.spyScore === 3 || this.rejectionCount === 5) {
        return true
      }
    },

    setWinner: function() {
      if (this.spyScore === 3 || this.rejectionCount === 5) this.winner = "Spies"
      else this.winner = "Resistance"
    },

    showWinner: function() {
      this.setWinner()
      if (this.winner === "Spies") {
        $(".spy-won").showStep()
      }
      else {
        $(".resistance-won").showStep()
      }
    }
  })

  App.Models.Mission = Backbone.Model.extend({
    initialize: function(missionData){
      this.missionNum = missionData.missionNum
      this.failsRequired = this.failsRequired()
      this.numMembers = window.missionNumbers[App.current.game.numPlayers][this.missionNum]
      this.members = []
      this.successVotes = 0
      this.failVotes = 0
    },

    failsRequired: function() {
      var failsRequired
      if(App.current.game.numPlayers === (5 || 6)) {
        failsRequired = 1
      }
      else if(this.missionNum === 4) {
        failsRequired = 2
      }
      else {
        failsRequired = 1
      }
      return failsRequired
    },

    result: function(){
      var result
      if(this.failVotes > 0 && this.failVotes >= this.failsRequired){
        result = "Fail"
        App.current.game.spyScore++
      }
      else{
        result = "Success"
        App.current.game.resistanceScore++
      }
      return result
    },

    missionSuccessVote: function(voterIndex) {
      $(".mission-voting").showStep()
      var _this = this
      var voter = this.members[voterIndex]
      $(".voting-player-name").text(voter.name)
      $(".mission-success-failure-buttons").html('')
      var buttons = ["<button class='btn btn-primary mission-success'>SUCCESS</button><br/><br/>",
                      "<button class='btn btn-primary mission-failure'>FAILURE</button><br/><br/>"]

      _.each(_.shuffle(buttons), function(button) {
        $(".mission-success-failure-buttons").append(button)
      })

        // if (voter.identity === "resistance"){
        //   $(".mission-failure").attr("disabled", true)
        // }

      $(".mission-success, .mission-failure").click(function(){
        $(this).toggleClass('voted')
        if ($(".voted").length === 1){
          $(".submit-vote").show()
        }
        else{
          $(".submit-vote").hide()
        }
      })

      $(".submit-vote").unbind("click")

      $(".submit-vote").click(function(e){
        if($(".mission-success.voted").length === 1){
          _this.successVotes++
        }
        else {
          _this.failVotes++
        }

        if(voterIndex === _this.members.length-1) {
          App.current.game.showMissionResult()
        }
        else{
          var nextIndex = voterIndex+1
          $(".mission-voting").hideStep()
          _this.missionSuccessVote(nextIndex)
        }
      })
    }
  })

  App.Models.Player = Backbone.Model.extend({
    initialize: function(data) {
      this.name = data.name
      this.id = data.id
      this.identity = "resistance"
    },

    displayIdentity: function() {
      var _this = this
      window.setTimeout(function(){
        $(".find-out .name").text(_this.name)
        $("p.identity").text("You are a " + _this.identity)
        $(".reveal-identity").show()
      }, 400)
      $(".find-out").showStep()

      $(".reveal-identity").click(function(){
        $(this).hide()
        $("p.identity").show()
      })
    }
  })

  App.Collections.Players = Backbone.Collection.extend({
    model: App.Models.Player,

    createSpies: function(numSpies) {
      var players = _.shuffle(this.models)
      var i = 0
      _.times(numSpies, function(){
        players[i].identity = "spy"
        i++
      })
      this.displayOrder = 1
      this.currentLeader = null
    },

    displayIdentities: function(){
      if(this.displayOrder === this.models.length + 1) {
        $(".find-out").hideStep()
        this.currentLeader = null
        App.current.game.startRound()
      }
      else {
        this.get(this.displayOrder).displayIdentity()
        this.displayOrder++
      }
    },
    incrementLeader: function(){
      if(this.currentLeader === null) {
        this.currentLeader = this.models[0]
      }
      else if(this.currentLeader.id === this.models.length){
        this.currentLeader = this.get(1)
      }
      else {
        this.currentLeader = this.get(this.currentLeader.id + 1)
      }
      return this.currentLeader
    }
  })



  // Player:
  //   -team

  // Game:
  //   -resistanceScore
  //   -spyScore
  //   -rejectionCount(in a row)
  //   -currentLeader
  //   -#of resistance
  //   -# of spies


  // Mission
  //   -# of players
  //   -status
  //   -# of fails required

  // Round Vote

  // Mission Vote

})
