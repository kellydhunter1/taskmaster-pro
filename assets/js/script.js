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
  // auto focus on new element
  dateInput.trigger("focus");
});

/*
CHANGE DATE BACK TOPILL BADGE AFTER EDIT
*/
// date has changed ! square brackets to specify the target element
$(".list-group").on("blur", "input[type='text']", function() {
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
});


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


