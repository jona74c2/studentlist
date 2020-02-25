"use strict";
document.addEventListener("DOMContentLoaded", start);

let allStudents = [];
const HTML = [];
const settings = [];

const Student = {
  firstName: "",
  lastName: undefined,
  middleName: "",
  nickName: undefined,
  img: undefined,
  house: "",
  player: false,
  captain: false,
  prefect: false,
  clubmember: false,
  expel: false
};

function start() {
  HTML.itemTemplate = document.querySelector("template");
  HTML.container = document.querySelector(".container");

  document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", filterButtonPressed);
    console.log("adding eventlisteners to filter");
  });

  getJson();
}

async function getJson() {
  // let jsonData = await fetch("https://spreadsheets.google.com/feeds/list/17Dd7DvkPaFamNUdUKlrFgnH6POvBJXac7qyiS6zNRw0/od6/public/values?alt=json");
  let response = await fetch("students1991.json");
  let jsonData = await response.json();
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  jsonData.forEach(jsonObject => {
    let studentElement = Object.create(Student);
    //clone.querySelector("h2").textContent = student.fullname;
    //clone.querySelector(".house").textContent = student.house;
    const name = jsonObject.fullname.split(" ");
    //Loops through the array name, and removes whitespace elements
    for (let i = 0; i < name.length; i++) {
      if (name[i] == "") {
        name.splice(i, 1);
        if (i > 0) {
          i--;
        }
      }
      if (name[i][0] == '"') {
        studentElement.nickName = name[i].toLowerCase();
        studentElement.nickName = studentElement.nickName[0] + studentElement.nickName[1].toUpperCase() + studentElement.nickName.substring(2, studentElement.nickName.length);
        name.splice(i, 1);
        i--;
      } else {
        name[i] = capitalization(name[i]);
      }
    }
    const house = jsonObject.house.split(" ");
    //Loops through the array house, and removes whitespace elements
    for (let i = 0; i < house.length; i++) {
      if (house[i] == "") {
        house.splice(i, 1);
        i--;
      } else {
        studentElement.house = capitalization(house[i]);
      }
    }

    //The values are cleaned, now it is added to the Studentelement
    studentElement.firstName = name[0];
    if (name.length > 2) {
      studentElement.middleName = name[1];
      studentElement.lastName = name[2];
    } else {
      studentElement.lastName = name[1];
    }

    allStudents.push(studentElement);
  });
  displayList(allStudents);
}

function filterButtonPressed() {
  settings.filter = this.dataset.filter;
  settings.filtertype = this.dataset.filtertype;
  buildList();
}

function buildList() {
  const listarray = filter();
  //sort(listarray);
  displayList(listarray);
}

function filter() {
  console.log("Filter filter: " + settings.filter);

  if (settings.filter === "*") {
    return allStudents;
  } else if (settings.filtertype === "house") {
    allStudents.forEach(student => console.log(student.house));
    const filteredStudents = allStudents.filter(student => student[settings.filtertype] === settings.filter);
    return filteredStudents;
  } else if (settings.filtertype === "nonexpel") {
    allStudents.forEach(student => console.log(student.expel));
    const filteredStudents = allStudents.filter(student => student.expel === false);
    return filteredStudents;
  } else {
    const filteredStudents = allStudents.filter(student => student[settings.filtertype] === true);
    return filteredStudents;
  }
}

function displayList(students) {
  // clear the display
  HTML.container.innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
}

function displayStudent(student) {
  //Students are shown on the frontpage
  let clone = HTML.itemTemplate.content.cloneNode(true);

  clone.querySelector(".first_name").textContent = student.firstName;
  if (student.nickName != undefined) {
    clone.querySelector(".nick_name").textContent = student.nickName;
  }
  if (student.middleName != undefined) {
    clone.querySelector(".middle_name").textContent = student.middleName;
  }

  clone.querySelector(".last_name").textContent = student.lastName;

  clone.querySelector(".house").textContent = student.house;

  HTML.container.append(clone);

  //clone.addEventListener("click", function() {
  HTML.container.lastElementChild.addEventListener("click", function() {
    console.log("Student clicked");
    showDetail(student);
  });
}

function showDetail(student) {
  //detail of the student is shown through this code
  document.querySelector("#detail").style.display = "block";
  document.querySelector("#detail .close").addEventListener("click", hideDetail);
  document.querySelector("#detail").dataset.theme = student.house;

  document.querySelector("#detail .first_name").textContent = student.firstName;
  if (student.nickName != undefined) {
    document.querySelector("#detail .nick_name").textContent = student.nickName;
  } else {
    document.querySelector("#detail .nick_name").textContent = "";
  }
  if (student.middleName != undefined) {
    document.querySelector("#detail .middle_name").textContent = student.middleName;
  }

  document.querySelector("#detail .last_name").textContent = student.lastName;

  document.querySelector("#detail .house").textContent = student.house;
}

function hideDetail() {
  document.querySelector("#detail").style.display = "none";
}

function capitalization(str) {
  let str1 = str.toLowerCase();
  return str1[0].toUpperCase() + str1.substring(1, str1.length);
}
