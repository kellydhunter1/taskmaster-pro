var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

/*
EDIT AND UPDATE A TASK
*/

// click event related to task items
$(".list-group").on("click", "p", function() {
//  identifies the text in the clicked area
  const text = $(this).text().trim();
// creates a form field and give class
// adds existing text from <p> into the form
 const textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);
// adds form field to the page
$(this).replaceWith(textInput);
// automatically highlights the form for better UX
textInput.trigger("focus");
 console.log(text);
});

/*
SAVES AND UPDATES TASK
*/
$(".list-group").on("blur", "textarea", function() {
  const text = $(this).val().trim();
  // get the parent ul's id attribute
  const status = $(this).closest(".list-group").attr("id").replace("list-", "");
  // get the task's position in the list of other li elements
  const index = $(this).closest(".list-group-item").index();
  // use variable names as placeholders to identify the correct array item
  tasks[status][index].text = text;
  // updates and saves tasks
  saveTasks();
// turns text area back into a <p>
const taskP = $("<p>").addClass("m-1").text(text);
$(this).replaceWith(taskP);
});

/*
EDIT DUE DATES
*/

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current date
  const date = $(this).text().trim();
  // create a new input element
  const dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);
  // put input field on the page
  $(this).replaceWith(dateInput);
  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      $(this).trigger("change");
    }
  });
  // auto focus on new element
  dateInput.trigger("focus");
});

/*
CHANGE DATE BACK TOPILL BADGE AFTER EDIT
*/
// date has changed ! square brackets to specify the target element
$(".list-group").on("change", "input[type='text']", function() {
  // get current date
  const date = $(this).val().trim();
  // get the parent ul's id attribute
  const status = $(this).closest(".list-group").attr("id").replace("list-", "");
  // get the task's position in the list of other li elements
  const index = $(this).closest(".list-group-item").index();
  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();
  // recreate span element with bootstrap classes
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
  // replace input with span element
  $(this).replaceWith(taskSpan);
  // Pass task's <li> element into auditTask() to check new due date
    auditTask($(taskSpan).closest(".list-group-item"));
});

/*
DRAG & DROP FUNCTION
SORTABLE
*/
// 
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
    console.log("activate", this);
  },
  deactivate: function(event) {
    $(this).remove(".dropover");
    $(this).remove(".bottom-trash-drag");
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  // saves the tasks in their new spot
  update: function(event) {
    // holds the task data after its moved
    let tempArr = [];

    // loop over the current set of children in sortable list *this= ul element*
    $(this).children().each(function() {
      // task text *this = the li elements
      const text = $(this).find("p").text().trim();
      // task date
      const date = $(this).find("span").text().trim();
      // add the task data to the temp arr as an object
      tempArr.push({
        text: text,
        date: date
      });
    });
    console.log("tempArr", tempArr);
    // trim down the list's ID to match the object property
    const arrName = $(this).attr("id").replace("list-", "");
    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }

});

/*
TRASH DROPPABLE
*/

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    $(".bottom-trash").remove(".bottom-trash-active");
    console.log("drop");
  },
  over: function(event, ui) {
    $(this).addClass("bottom-trash-active");
    console.log("over");
  },
  out: function(event, ui) {
    $(".bottom-trash").remove(".bottom-trash-active");
    console.log("out");
  }
});


// adds calendar to select date in date input field
$("#modalDueDate").datepicker({
  // indicates how many days after the current date are allowed to be entered
  minDate: 1
});

/*
AUDIT TASKS
Checks the due dates
and color codes based on how long until its due
*/

const auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();

  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
      $(taskEl).addClass("list-group-item-warning");
    }
};

setInterval(function() {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  });
}, (1000 * 60) *30);


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


