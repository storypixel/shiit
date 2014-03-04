'use strict';

angular.module('shiitApp')
.controller('EvergreenCtrl', function ($scope) {

  var speech = ('speechSynthesis' in window),
  phraseIndex = 0,
  aPhrase = function(){},
  playSound = function(){};

  // second clause added to allow work in FireFox
  if (speech && window.SpeechSynthesisUtterance) {
    // this whole area should be made a module. not sure best way
    aPhrase = function(p){
      var possibilities = [
        new window.SpeechSynthesisUtterance('Sacrifice is giving up something that matters for something that matters more.'),
        new window.SpeechSynthesisUtterance('You are doing a great job.'),
        new window.SpeechSynthesisUtterance('Harder. Better. Faster. Stronger.'),
        new window.SpeechSynthesisUtterance('Good things come to those who work their asses off.'),
      ],
      pLen = possibilities.length;

      p = (!isNaN(p) && ((p % pLen) >= 0)) ? (p % pLen) : (Math.floor(Math.random() * possibilities.length));
      return possibilities[p];
    };
    // play speech synthesis sounds
    playSound = function () {
      window.speechSynthesis.speak(aPhrase(phraseIndex++));
    };
  }

  $scope.saySomething = function(){
    playSound();
  };

});
