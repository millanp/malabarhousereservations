/**
 * Uses the Forms API to create a simple quiz.
 * For more information on using the Forms API, see
 * https://developers.google.com/apps-script/reference/forms
*/
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}
function doPost(e) {
  //I will want to use UrlFetchApp.fetch(paypal's url, {"method":"post"})
  var parameters = e["parameter"];
  if (parameters["fromEmail"] === "true") {
    if (parameters["acceptOrReject"] === "accept") {
      //    var button = '<script async="async" src="https://www.paypalobjects.com/js/external/paypal-button.min.js?merchant=matthai.philipose@gmail.com" \
      //    data-button="buynow" \n \
      //    data-name="o" 
      //    data-quantity="1" 
      //    data-amount="5" 
      //    data-currency="USD" 
      //    data-shipping="0" 
      //    data-tax="0" 
      //    data-env="sandbox"
      //></script>'
      if (parameters["charge"] === "yes") {
        /*Send a payment email*/
        var text = "<form method=\"post\" action=\"https://www.sandbox.paypal.com/cgi-bin/webscr\" class=\"paypal-button\" target=\"_top\"><div class=\"hide\" id=\"errorBox\"></div><input type=\"hidden\" name=\"button\" value=\"buynow\"><input type=\"hidden\" name=\"item_name\" value=\"Malabar House non-family upkeep fee\"><input type=\"hidden\" name=\"quantity\" value=\"1\"><input type=\"hidden\" name=\"amount\" value=\"5\"><input type=\"hidden\" name=\"currency_code\" value=\"USD\"><input type=\"hidden\" name=\"shipping\" value=\"0\"><input type=\"hidden\" name=\"tax\" value=\"0\"><input type=\"hidden\" name=\"notify_url\" value=\"https://script.google.com/macros/s/AKfycbybOfV_0Xxm7Srlqg7q-qonWmcVCWa_NtDDBBi0slzSuUPlhZY6/exec?orderID=placeidhere&fromEmail=paypal\"><input type=\"hidden\" name=\"env\" value=\"www.sandbox\"><input type=\"hidden\" name=\"cmd\" value=\"_xclick\"><input type=\"hidden\" name=\"business\" value=\"matthai.philipose@gmail.com\"><input type=\"hidden\" name=\"bn\" value=\"JavaScriptButton_buynow\"><button type=\"submit\" class=\"paypal-button large\">Buy Now</button></form>";
        //Replace "placeidhere" with the id
        text = text.replace("placeidhere", parameters["orderID"]);
        text = "Your request for a stay at Malabar House has been approved. Please click Buy Now and pay a small fee to complete the process." + text;
        MailApp.sendEmail({
          to:/*this will eventually be the person's email address*/"millan.philipose@gmail.com",
          subject:"you must pay",
          htmlBody:text
        });
      } else {
        /*Send an email confirming that they want to finalize the reservation*/
        var text = "Your request for a stay at Malabar House has been approved. Select the appropriate statement, then press Submit.";
        text+="<form action=\"https://script.google.com/macros/s/AKfycbybOfV_0Xxm7Srlqg7q-qonWmcVCWa_NtDDBBi0slzSuUPlhZY6/exec\" method=\"post\">\
      <input type=\"radio\" name=\"acceptOrReject\" value=\"accept\">I confirm and finalize this reservation   \
      <input type=\"radio\" name=\"acceptOrReject\" value=\"reject\">I want to cancel this reservation   \
      <input type=\"hidden\" name=\"orderID\" value=\"insert order id here\">\
      <input type=\"hidden\" name=\"fromEmail\" value=\"fromConfirmation\"\
      <input type=\"submit\"  value=\"Submit\"> <!--Add in all the type hidden inputs you want to send all of the reservation info back to the Apps Script with the post.-->\
      </form>";
        text=text.replace("insert order id here", parameters["orderID"]);
        MailApp.sendEmail({
          to:/*this will eventually be the person's email address*/"millan.philipose@gmail.com",
          subject:"you need not pay",
          htmlBody:text
        });
      };
      MailApp.sendEmail({
        to:"millan.philipose@gmail.com",
        subject:"sent an email",
        htmlBody:JSON.stringify(e)
      });
    } else {
      //Send email informing them of rejection
      MailApp.sendEmail({
        to:/*this will eventually be the person's email address*/"millan.philipose@gmail.com",
        subject:"Your Malabar House request has been rejected",
        htmlBody:"Goodbye ;)"
      });
      PropertiesService.getScriptProperties().deleteProperty(parameters["orderID"]);
    }
  } else if (parameters["fromEmail"] === "fromConfirmation") {
    if (parameters["acceptOrReject"] === "accept") {
      var orderInfoString = PropertiesService.getScriptProperties().getProperty(parameters["orderID"]);
      var orderInfo = JSON.parse(orderInfoString);
      addCalendarEvent(orderInfo);
      addSpreadsheetEntry(orderInfo);
    }
    PropertiesService.getScriptProperties().deleteProperty(parameters["orderID"]);
  } else {
    //Perform confirmation that the post is, indeed, from PayPal
    //Add to calendar and spreadsheet
    // If paid === true:
    var orderInfoString = PropertiesService.getScriptProperties().getProperty(parameters["orderID"]);
    var orderInfo = JSON.parse(orderInfoString);
    addCalendarEvent(orderInfo);
    addSpreadsheetEntry(orderInfo);
    PropertiesService.getScriptProperties().deleteProperty(parameters["orderID"]);
    MailApp.sendEmail({
      to:"millan.philipose@gmail.com",
      subject:"sent an email",
      htmlBody:JSON.stringify(e)
    });
  }
  return ContentService.createTextOutput("User says hojoia")
  
}
function In(element, array) {
  for (var n in array) {
    if (String(array[n]) === String(element)) {
      return true
    }
  }
  return false
}
function testerblah() {
  var x = getElementsFromDict({"rooms":["Room 3","Room 4"],"pageHistory":"0","fbzx":"-6682927900631204199","draftResponse":"[,,\"-6682927900631204199\"]\n","leave":"2015-12-15","name":"Koelw Hang","arrive":"2015-12-10","email":"millan.philipose@gmail.com"});
//  Logger.log("GOT JUST BEFORE FINAL LOGGER>LOG")
  Logger.log(String(x));
  for (var i in x) {
    Logger.log(typeof(x[i]));
  }
}
function getElementsFromDict(dict) {
  var elements = [];
  for (var key in dict) {
    Logger.log(key);
    if (key === "rooms") {
      if (typeof(dict[key] === "object")) {
        dict[key] = JSON.stringify(dict[key]);
      } else if (typeof(dict[key] === "string")) {
        
      }
    }
    if (key === "pageHistory" || key === "fbzx" || key === "draftResponse") {
      
    } else {
      Logger.log("NOT ROOMS KEY IS "+key);
      elements.push(dict[key]);
      Logger.log("GOT HERE");
    }
  }
  Logger.log("GOT TO END");
  return elements;
}
function convertDate(date) {
  if (typeof(date) === "string") {
    Logger.log("type of date is string");
    var months = {
      "01":"January",
      "02":"February",
      "03":"March",
      "04":"April",
      "05":"May",
      "06":"June",
      "07":"July",
      "08":"August",
      "09":"September",
      "10":"October",
      "11":"November",
      "12":"December"
    }
    var string = months[date.slice(5,7)] + " " + date.slice(8,10) + ", " + date.slice(0,4);
    return string
  } else {
    var months = {
      0:"January",
      1:"February",
      2:"March",
      3:"April",
      4:"May",
      5:"June",
      6:"July",
      7:"August",
      8:"September",
      9:"October",
      10:"November",
      11:"December"
    }
    var string = months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
    return string
  }
}
function today() {
  var months = {
    1:"January",
    2:"February",
    3:"March",
    4:"April",
    5:"May",
    6:"June",
    7:"July",
    8:"August",
    9:"September",
    10:"October",
    11:"November",
    12:"December"
  }
  var today = new Date();
  var d = today.getDate();
  var m = months[today.getMonth()];
  var y = today.getFullYear();
  return m+" "+d+", "+y
}
function translateFormDict(dict) {
  var translation = {
    "entry.1172957590":"name",
    "entry.1788478969":"rooms",
    "entry.1296939032":"arrive",
    "entry.2108423837":"leave",
    "entry.172066212":"extra",
    "entry.1452866060":"email"
  }
  var keys = Object.keys(dict);
  var newDict = {};
  var key;
  var newKey;
  for (var i in keys) {
    //COMPLETE
    key=keys[i];
    if (key in translation) {
      newKey=translation[key]
    } else {
      newKey=key
    }
    newDict[newKey] = dict[key]
  }
  return newDict;
}
function testTFT() {
  var dict = {"entry.1788478969":["Room 1", "Room 2"], 
              "entry.172066212":"Option",
              "pageHistory":0, "entry.1172957590":"shfg",
              "entry.2108423837":"2014-09-16", "draftResponse":[,,"-6682927900631204199"]
              , "fbzx":-6682927900631204199, "entry.1452866060":"sdfg", "entry.1296939032":"2014-09-09"}
  Logger.log(translateFormTerm(dict));
}
function dictLatestResponse(url, isReservations) {
  // Open a form by ID and log the responses to each question.
  var responses = {};
  Logger.log(url);
  if (isReservations === true) {
    return translateFormDict(url);
  } else {
    var form = FormApp.openByUrl(url);
    var formResponses = form.getResponses();
    var i = formResponses.length - 1
    var formResponse = formResponses[i];
    var itemResponses = formResponse.getItemResponses();
    for (var j = 0; j < itemResponses.length; j++) {
      var itemResponse = itemResponses[j];
      //    Logger.log('Response #%s to the question "%s" was "%s"',
      //        (i + 1).toString(),
      //        itemResponse.getItem().getTitle(),
      //        itemResponse.getResponse());
      if (isReservations === false) {
        Logger.log("Got here");
        Logger.log(itemResponse.getResponse());
        Logger.log(itemResponse.getResponse());
        return itemResponse.getResponse();
      }
    }
  }
  this.responses = responses;
}
function createRequestForm(){
  var requestform = FormApp.create('Reservation Request');
  var question = requestform.addMultipleChoiceItem();
  question.setTitle('Will you allow the reservation specified in the email to go through? (formID then add whatever is the FORM ID!!!')
  .setChoices([
    question.createChoice('Allow'),
    question.createChoice('Reject')
  ]);
  this.url = requestform.getPublishedUrl();
  var id = requestform.getPublishedUrl();
  var scriptProps = PropertiesService.getUserProperties();
  var triggerObject = ScriptApp.newTrigger('onRequestFormSubmit').forForm(requestform).onFormSubmit().create();
  scriptProps.setProperty(id, triggerObject.getUniqueId());
  MailApp.sendEmail({
    to:"millan.philipose@gmail.com",
    subject:"sent an email",
    htmlBody:triggerObject.getUniqueId()+" "+id,
  });
  return requestform.getPublishedUrl();
};
function onRequestFormSubmit(e) {
  //LAST LEG!!@!H@!UH!IO@HI!UH@I!UH@IOUH !IUO@H CI!U@H COI!U@H C!IUO@ CH!IOU!!!!!!!!!
//  var response = this.dictLatestResponse(this.url,false);
//  Logger.log(response);
//  if (response === "Approve") {
//    addCalendarEvent();
//  }
  Logger.log("HI");
  Logger.log(e.response);
  var scriptProps = PropertiesService.getUserProperties();
  var response = e.response;
//  var srcID = src.getId();
//  var srcURL = src.getPublishedUrl();
//  var triggerID = scriptProps.getProperty(srcURL);
//  var triggers = ScriptApp.getProjectTriggers();
//  var itemResponses = response.getItemResponses();
  Logger.log("preloop "+response.getItemResponses[0].getResponse());
  var itemResponses = response.getItemResponses()
  for (var j = 0; j < itemResponses.length; j++) {
    var itemResponse = itemResponses[j];
    Logger.log("Got to the email sending")
    MailApp.sendEmail({
      to:"millan.philipose@gmail.com",
      subject:"sent an email",
      htmlBody:String(itemResponse.getResponse()),
    });
    Logger.log("Got past");
  }
//  deleteTrigger(triggerID);
}
function deleteTrigger(triggerId) {
  // Loop over all triggers.
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    // If the current trigger is the correct one, delete it.
    if (allTriggers[i].getUniqueId() == triggerId) {
      ScriptApp.deleteTrigger(allTriggers[i]);
      break;
    }
  }
}
//Find out how to get trigger by id
function addCalendarEvent(orderInfo) {
  var responses = orderInfo;
  Logger.log(this.responses);
  var cal = CalendarApp.getOwnedCalendarById("rrc6pg8t2mgtrca0nusnr1au1k@group.calendar.google.com");
  var bookingEvents = []
  Logger.log(String(responses["rooms"]));
  if (typeof(responses["rooms"]) === "object") {
    for (var room in responses["rooms"]) {
      Logger.log(room);
      bookingEvents+=[createMultiDayEvent(cal, responses["name"]+", "+responses["rooms"][room], responses["arrive"], responses["leave"])];
    }
  } else if (typeof(responses["rooms"]) === "string") {
    bookingEvents+=[createMultiDayEvent(cal, responses["name"]+", "+responses["rooms"], responses["arrive"], responses["leave"])];
  }
}
function addCalTest() {
  addCalendarEvent({"rooms":"Room 1","pageHistory":"0","fbzx":"-6682927900631204199","draftResponse":"[,,\"-6682927900631204199\"]\n","leave":"2014-10-30","name":"g","arrive":"2014-10-29","email":"millan.philipose@gmail.com"});
}
function addSpreadsheetEntry(orderInfo) {
  var spread = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1c0vPswpCuJeU389cMVhH8WUnrfk_24cyhg-O3X7QRl8/edit?usp=sharing");
  spread.appendRow(getElementsFromDict(orderInfo));
}
function createMultiDayEvent( calendar, title, startDate, endDate ) {
 var timeZone = calendar.getTimeZone();
 var description = Utilities.formatString( '%s from %s to %s', title, convertDate( startDate, timeZone ), convertDate( endDate, timeZone ));
 return calendar.createEventFromDescription(description);
}
function errorCheck(form) {
//  dictLatestResponse(form,true);
//  var responses = this.responses;
//  var available = isAvailable(new Date(convertDate(responses["arrive"])), new Date(convertDate(responses["leave"])), responses["rooms"])
//  if (available===true) {
//    sendEmail(form);
//    Logger.log("available")
//    return "Your response has been recorded";
//  } else {
//    Logger.log(available);
//    return available;
//  }
  //10-15-2014: Fully implement leaveAfterArrive (make it tell the user that leave is after arrive)
  var latestResponse = dictLatestResponse(form,true);
  var arrive = new Date(convertDate(latestResponse["arrive"]));
  var leave = new Date(convertDate(latestResponse["leave"]));
  var rooms = latestResponse["rooms"];
  if (arrive.getTime()<leave.getTime()-86399999) {
    var leaveAfterArrive = true;
  } else {
    var leaveAfterArrive = false;
  }
  var available = isAvailable(arrive, leave, rooms);
  if (available === true && leaveAfterArrive === true) {
    sendEmail(form);
    return "Your response has been recorded";
  } else {
    return available;
  }
}
//
function sendEmail(form) {
//  this.addCalendarEvent();
  var responses = dictLatestResponse(form,true);
  var randomID = Math.floor((Math.random()*1000000000)+1);
  PropertiesService.getScriptProperties().setProperty(String(randomID), JSON.stringify(responses))
  var date = today();
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////IMPLEMENT THE CHARGE OR NOT CHECKBOX
  var text = 
      "On "+date+", "+responses["name"]+" ("+responses["email"]+") put in a request to use Malabar House room(s) "
      +responses["rooms"]+" from "+convertDate(responses["arrive"])+" to "+convertDate(responses["leave"])
      +". Choose to accept or reject their reservation request. <form action=\"https://script.google.com/macros/s/AKfycbybOfV_0Xxm7Srlqg7q-qonWmcVCWa_NtDDBBi0slzSuUPlhZY6/exec\" method=\"post\">\
      <input type=\"radio\" name=\"acceptOrReject\" value=\"accept\">accept   \
      <input type=\"radio\" name=\"acceptOrReject\" value=\"reject\">reject   \
      <input type=\"radio\" name=\"charge\" value=\"yes\">This person should be charged the house upkeep fee   \
      <input type=\"radio\" name=\"charge\" value=\"no\">This person should not be charged   \
      <input type=\"hidden\" name=\"orderID\" value=\"insert order id here\">\
      <input type=\"hidden\" name=\"fromEmail\" value=\"true\">\
      <input type=\"submit\"> <!--Add in all the type hidden inputs you want to send all of the reservation info back to the Apps Script with the post.-->\
    </form>";
  text = text.replace("insert order id here", String(randomID));
  MailApp.sendEmail({
    to:"millan.philipose@gmail.com",
    subject:"Reservation Request",
    htmlBody:text,
  });
}
function errorCheckTest() {
  Logger.log(errorCheck(FormApp.openByUrl("https://docs.google.com/forms/d/19GJDHg5n9Mi9AsLXwcZT5HYUP7X9sLRic0iAhANQmIg/viewform")));
}
function checkAvailabilityTest() {
  Logger.log(isAvailable(new Date("October 29, 2014"), new Date("October 31, 2014"), ["Room 2","Room 3"]));
}
/* WORKS! Next step: add simple date checking : is it within the next year (ask Sheri about how long this should be) ?
is the departure date after the arrival date?
are both the dates in the future?
*/
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
// MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
//Ust fix this function
function isAvailable(arrive, leave, rooms) {
  var cal = CalendarApp.getOwnedCalendarById("rrc6pg8t2mgtrca0nusnr1au1k@group.calendar.google.com");
  var eventTitle;
  var roomNumber;
  var eventsOnDate;
  var currentCheckDate;
  var room;
  var errorLog;
  var errors = [];
  for (var n in rooms) {
    room = rooms[n];
    currentCheckDate = arrive;
    Logger.log("GOt to for room in rooms");
    while (currentCheckDate.getTime() !== leave.getTime()+86400000) {
      eventsOnDate = eventsForDay(currentCheckDate, cal);
      Logger.log("number of events on date "+currentCheckDate.getDate()+": "+eventsOnDate.length)
      Logger.log("error string is "+String(errors)+"and string of [] is "+String([]))
      for (var i in eventsOnDate) {
        eventTitle=eventsOnDate[i].getTitle();
        Logger.log("Event Title: "+eventTitle);
        Logger.log("error string is "+String(errors))
        //Redo the events so that it doesn't show names
        roomNumber=eventTitle.split(" ")[2];
        Logger.log(roomNumber);
        if (roomNumber===room.split(" ")[1] || roomNumber==="house") {
          Logger.log("False")
          // ***************************************************************************!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          errorLog = [convertDate(currentCheckDate), room];
          Logger.log(errorLog);
          Logger.log(errors[0])
          if (In(errorLog, errors) === false) {
            errors.push(errorLog);
            Logger.log("errorlog not in errors");
          }
        };
      }
      //86400000 is the number of milliseconds in a day
      //getTime gets milliseconds after the epoch for given date
      currentCheckDate = new Date(currentCheckDate.getTime() + 86400000);
    }
  }
  Logger.log("error string is "+String(errors));
  if (String(errors) === "") {
    return true;
  }
  Logger.log(typeof(errors));
  return createErrorMessage(errors)
}
function paymentEmailsHopefully() {
  MailApp.sendEmail({
    to:"millan.philipose@gmail.com",
    subject:"sent an email",
    htmlBody:"<form method=\"post\" action=\"https://www.sandbox.paypal.com/cgi-bin/webscr\" class=\"paypal-button\" target=\"_top\"><div class=\"hide\" id=\"errorBox\"></div><input type=\"hidden\" name=\"button\" value=\"buynow\"><input type=\"hidden\" name=\"item_name\" value=\"Malabar House non-family upkeep fee\"><input type=\"hidden\" name=\"quantity\" value=\"1\"><input type=\"hidden\" name=\"amount\" value=\"5\"><input type=\"hidden\" name=\"currency_code\" value=\"USD\"><input type=\"hidden\" name=\"shipping\" value=\"0\"><input type=\"hidden\" name=\"tax\" value=\"0\"><input type=\"hidden\" name=\"notify_url\" value=\"https://script.google.com/macros/s/AKfycbybOfV_0Xxm7Srlqg7q-qonWmcVCWa_NtDDBBi0slzSuUPlhZY6/exec?id=placeidhere\"><input type=\"hidden\" name=\"env\" value=\"www.sandbox\"><input type=\"hidden\" name=\"cmd\" value=\"_xclick\"><input type=\"hidden\" name=\"business\" value=\"matthai.philipose@gmail.com\"><input type=\"hidden\" name=\"bn\" value=\"JavaScriptButton_buynow\"><button type=\"submit\" class=\"paypal-button large\">Buy Now</button></form>",
  });
}
function createErrorMessage(errors) {
  var text =
      "Correct these errors:\n";
  var error;
  for (var n in errors) {
    error = errors[n];
    Logger.log(error);
    Logger.log("Got in");
    text+= "-On "+error[0]+", your request for room "+error[1]+" overlaps with an existing booking.\n";
  }
  return text
}
//function sendApprovalMessage() {
//  var htmlText = 
//      "Your booking request for Malabar House has been approved. To complete the process, 
//}
function eventsForDay(date, cal) {
  var dateTime = date.getTime();
  var start = new Date(dateTime+43200000);
  var end = new Date(dateTime + 43300000);
  return cal.getEvents(start, end)
}