"use strict";
document.addEventListener("DOMContentLoaded", start);

let allStudents = [];
const HTML = [];
const settings = [];
let asyncCounter = 0;

let jsonDataStudents = [];
let jsonDataFamilies = [];
/* const jsonData0 = [];
const jsonData1 = []; */

const Student = {
  firstName: "",
  lastName: undefined,
  middleName: "",
  nickName: undefined,
  img: undefined,
  house: "",
  gender: "",
  player: false,
  captain: false,
  prefect: false,
  clubmember: false,
  expel: false,
  bloodstatus: ""
};

function start() {
  HTML.itemTemplate = document.querySelector("template");
  HTML.container = document.querySelector(".container");

  settings.sortbool = false;
  settings.filter = "*";
  settings.sort = "*";
  /* set eventlisteners */
  document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", filterButtonPressed);
    console.log("adding eventlisteners to filter");
  });

  document.querySelectorAll("#sort > p").forEach(button => {
    button.addEventListener("click", sortButtonPressed);
    console.log("adding eventlisteners to sort");
  });
  console.log("getJson");
  getJson("students1991.json", 1);
  getJson("//petlatkea.dk/2020/hogwarts/families.json", 2);
}

async function getJson(url, number) {
  let response = await fetch(url);
  let jsonData = await response.json();
  asyncCounter++;
  if (number == 1) {
    jsonDataStudents = jsonData;
  } else if (number == 2) {
    jsonDataFamilies = jsonData;
  }
  //array = jsonData;
  window["jsonData" + asyncCounter] = jsonData;
  if (asyncCounter == 2) {
    asyncLoaded();
  }
}

function asyncLoaded() {
  console.log("Async Loaded");
  prepareObjects(jsonDataStudents);
}

function prepareObjects(jsonData) {
  jsonData.forEach(jsonObject => {
    let studentElement = Object.create(Student);
    studentElement.gender = jsonObject.gender;
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
  setBloodStatus(jsonDataFamilies);
  displayList(allStudents);
}

function filterButtonPressed() {
  settings.filter = this.dataset.filter;
  settings.filtertype = this.dataset.filtertype;
  buildList();
}

function sortButtonPressed() {
  console.log("Sort sort");

  if (this.dataset.sort === settings.sort && settings.sortbool === false) {
    settings.sortbool = true;
  } else {
    settings.sortbool = false;
  }
  settings.oldsort = settings.sort;
  settings.sort = this.dataset.sort;
  buildList();
}

function buildList() {
  const listarray = filter();
  sort(listarray);
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

function sort(listarray) {
  document.querySelectorAll("#sort > p").forEach(keyword => {
    keyword.classList.remove("sortarrow_up");
    keyword.classList.remove("sortarrow_down");
  });
  if (settings.sort === "*") {
    return listarray;
  } else if (settings.oldsort === settings.sort && settings.sortbool) {
    console.log("compareBackwards");
    document.querySelector(`[data-sort=${settings.sort}]`).classList.add("sortarrow_up");
    return listarray.sort(compareBackwards);
  } else {
    console.log("compare");
    document.querySelector(`[data-sort=${settings.sort}]`).classList.add("sortarrow_down");
    return listarray.sort(compare);
  }
}

function compare(a, b) {
  /*   console.log(a[settings.sort]);
  console.log(b[settings.sort]); */
  if (a[settings.sort] < b[settings.sort]) {
    return -1;
  } else {
    return 1;
  }
}

function compareBackwards(a, b) {
  console.log(a[settings.sort]);
  console.log(b[settings.sort]);
  if (a[settings.sort] > b[settings.sort]) {
    return -1;
  } else {
    return 1;
  }
}

function setBloodStatus(array) {
  allStudents.forEach(student => {
    if (array.half.some(family => family === student.lastName)) {
      student.bloodstatus = "half";
    } else if (array.pure.some(family => family === student.lastName)) {
      student.bloodstatus = "pure";
    } else {
      student.bloodstatus = "muggle";
    }
  });
}

function displayList(students) {
  // clear the display
  HTML.container.innerHTML = "";

  // set list details in the top
  prepareListDetails(students);
  // build a new list
  students.forEach(student => {
    if (settings.filtertype === "expel" && student.expel) {
      displayStudent(student);
    } else if (!student.expel) {
      displayStudent(student);
    }
  });
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

  clone.querySelector(".prefect").src = choosePrefectImg(student.house, student.prefect);
  clone.querySelector(".blood").src = chooseBloodImg(student.bloodstatus);

  //clone.querySelector(".house").textContent = student.house;

  clone.querySelector(".student_name").addEventListener("click", function() {
    console.log("Student clicked");
    showDetail(student);
  });
  clone.querySelector(".prefect").addEventListener("click", function() {
    setPrefect(student);
  });
  if (student.expel) {
    clone.querySelector(".expel_button").textContent = "unexpel";
  } else {
    clone.querySelector(".expel_button").textContent = "expel";
  }

  clone.querySelector(".expel_button").addEventListener("click", function() {
    toggle(student.expel);
    buildList();
  });

  HTML.container.append(clone);

  //clone.addEventListener("click", function() {
}

function showDetail(student) {
  //detail of the student is shown through this code
  document.querySelector("#detail").classList.remove("hide");
  //document.querySelector("#detail").style.display = "block";
  document.querySelector("#detail .close").addEventListener("click", function() {
    hideDetail("#detail");
  });
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
  document.querySelector("#detail .prefect").src = choosePrefectImg(student.house, student.prefect);
  document.querySelector("#detail .blood").src = chooseBloodImg(student.bloodstatus);
  document.querySelector(".profile").src = chooseProfileImg(student);
  //document.querySelector("#detail .house").textContent = student.house;
}

function hideDetail(popup) {
  document.querySelector(popup).classList.add("hide");
}

function capitalization(str) {
  let str1 = str.toLowerCase();
  return str1[0].toUpperCase() + str1.substring(1, str1.length);
}

function choosePrefectImg(house, prefect) {
  if (prefect) {
    return `/img/${house}Prefect.svg`;
  } else {
    return `/img/${house}NoPrefect.svg`;
  }
}

function chooseBloodImg(str) {
  if (str === "pure") {
    return `/img/pureblood.svg`;
  } else if (str === "half") {
    return `/img/halfblood.svg`;
  } else {
    return `/img/muggleblood.svg`;
  }
}

function chooseProfileImg(student) {
  if (student.firstName === "Padma") {
    return `/img/profiles/${student.lastName.toLowerCase()}_${student.firstName.toLowerCase().substring(0, student.firstName.length - 1)}e.png`;
  } else if (student.firstName === "Parvati") {
    return `/img/profiles/${student.lastName.toLowerCase()}_${student.firstName.toLowerCase()}.png`;
  } else {
    return `/img/profiles/${student.lastName.toLowerCase()}_${student.firstName[0].toLowerCase()}.png`;
  }
}

function setPrefect(student) {
  if (student.prefect) {
    student.prefect = false;
    buildList();
  }
  //check if there is a student from the same house, with the same gender, who already is a prefect
  //if true, open popup
  else if (allStudents.some(prefect => prefect.house === student.house && prefect.prefect && student.gender === prefect.gender)) {
    console.log("popup");
    //document.querySelector("#prefect_popup").classList.remove("hide");/*  */

    const currentPrefect = allStudents.filter(filterstudent => {
      if (filterstudent.prefect && filterstudent.house === student.house && filterstudent.gender === student.gender) {
        return filterstudent;
      }
    });
    console.table(currentPrefect);
    messagePopup(currentPrefect[0], student, "#prefect_popup", "Are you sure you want to remove current prefect");
    //let prefect = allStudents.some(prefect => prefect.house === student.house && prefect.prefect && student.gender === prefect.gender);
  } else {
    student.prefect = true;
    buildList();
  }
}

function messagePopup(currentPrefect, student, section, message) {
  document.querySelector(section).classList.remove("hide");
  document.querySelector(section + " " + ".close").addEventListener("click", function() {
    hideDetail(section);
  });
  document.querySelector(section + " " + "p").textContent = message;
  document.querySelector(section + " " + "h2").textContent = `${currentPrefect.firstName} ${currentPrefect.lastName}?`;
  document.querySelector(section + " " + ".accept_button").textContent = "Yes";
  document.querySelector(section + " " + ".accept_button").addEventListener("click", function() {
    currentPrefect.prefect = toggle(currentPrefect.prefect);
    student.prefect = true;
    document.querySelector(section).classList.add("hide");
    buildList();
  });
}

function toggle(statement) {
  if (statement) {
    return false;
  } else {
    return true;
  }
}

function prepareListDetails(filterStudents) {
  const gryffindor = allStudents.filter(student => student.house === "Gryffindor" && !student.expel);
  const slytherin = allStudents.filter(student => student.house === "Slytherin" && !student.expel);
  const hufflepuff = allStudents.filter(student => student.house === "Hufflepuff" && !student.expel);
  const ravenclaw = allStudents.filter(student => student.house === "Ravenclaw" && !student.expel);
  const expel = allStudents.filter(student => student.expel);
  const nonexpel = allStudents.filter(student => !student.expel);
  const current = filterStudents.filter(student => !student.expel);

  const object = {
    gryffindor: gryffindor.length,
    hufflepuff: hufflepuff.length,
    slytherin: slytherin.length,
    ravenclaw: ravenclaw.length,
    expel: expel.length,
    nonexpel: nonexpel.length,
    current: current.length
  };
  displayListDetails(object);
}

function displayListDetails(object) {
  document.querySelector("#list_details #Gryffindor").textContent = `Students in Gryffindor: ${object.gryffindor}`;
  document.querySelector("#list_details #Slytherin").textContent = `Students in Slytherin: ${object.slytherin}`;
  document.querySelector("#list_details #Hufflepuff").textContent = `Students in Hufflepuff: ${object.hufflepuff}`;
  document.querySelector("#list_details #Ravenclaw").textContent = `Students in Ravenclaw: ${object.ravenclaw}`;
  document.querySelector("#list_details #nonexpel").textContent = `Students: ${object.nonexpel}`;
  document.querySelector("#list_details #expel").textContent = `Expelled students: ${object.expel}`;
  document.querySelector("#list_details #current").textContent = `Students currently shown: ${object.current}`;
}
