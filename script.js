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
  bloodstatus: "",
  is: false
};

function start() {
  HTML.itemTemplate = document.querySelector("template");
  HTML.container = document.querySelector(".container");

  settings.sortbool = false;
  settings.filter = "*";
  settings.sort = "*";
  settings.hack = false;
  /* set eventlisteners */
  document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", filterButtonPressed);
    console.log("adding eventlisteners to filter");
  });

  document.querySelectorAll("#sort > p").forEach(button => {
    button.addEventListener("click", sortButtonPressed);
    console.log("adding eventlisteners to sort");
  });

  document.querySelector("#search_input").addEventListener("input", search);
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
    } else if (name.length === 1) {
      studentElement.lastName = "";
    } else {
      studentElement.lastName = name[1];
    }

    allStudents.push(studentElement);
  });
  setBloodStatus(jsonDataFamilies);
  displayList(allStudents);
}

function search() {
  settings.search = this.value;
  buildList();
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
  //let newArray = [];
  const listarray = filter();

  sort(listarray);

  if (settings.hack) {
    hackBloodstatus(jsonDataFamilies);
  }

  if (settings.search != undefined && settings.search != "") {
    const searchResult = listarray.filter(student => student.firstName.toLowerCase().includes(settings.search) || student.lastName.toLowerCase().includes(settings.search));
    displayList(searchResult);
  } else {
    displayList(listarray);
  }
}

function filter() {
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

function hackBloodstatus(array) {
  allStudents.forEach(student => {
    if (array.pure.some(family => family === student.lastName)) {
      const random = Math.random();
      if (random < 0.5) {
        student.bloodstatus = "half";
      } else {
        student.bloodstatus = "muggle";
      }
    } else {
      student.bloodstatus = "pure";
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
  clone.querySelector(".is").src = chooseIsImg(student.is);

  //clone.querySelector(".house").textContent = student.house;

  clone.querySelector(".student_name").addEventListener("click", function() {
    console.log("Student clicked");
    showDetail(student);
  });
  clone.querySelector(".prefect").addEventListener("click", function() {
    setPrefect(student);
  });
  clone.querySelector(".is").addEventListener("click", function() {
    setIs(student);
  });
  if (student.expel) {
    clone.querySelector(".expel_button").textContent = "unexpel";
  } else {
    clone.querySelector(".expel_button").textContent = "expel";
  }

  clone.querySelector(".expel_button").addEventListener("click", function() {
    expelStudent(student);
  });

  HTML.container.append(clone);
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
  document.querySelector("#detail .is").src = chooseIsImg(student.is);
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

function chooseIsImg(bool) {
  console.log("Choose IS bool: " + bool);
  if (bool) {
    console.log("The real IS");
    return `/img/is.svg`;
  } else {
    return `/img/nonis.svg`;
  }
}

function setIs(student) {
  if (student.is) {
    student.is = false;
    buildList();
  } else if (student.bloodstatus != "pure" && student.house != "Slytherin") {
    console.log(student);
    messagePopup(student, "Student can't be added to Inquisitorial Squad due to fullblood requirement", student, false);
  } else {
    student.is = true;
    buildList();
    if (settings.hack) {
      waitAndRemoveIs(student);
    }
  }
}

function waitAndRemoveIs(student) {
  // setTimeout(removeIs(student), 200);
  setTimeout(function() {
    removeIs(student);
  }, 2000);
}

function removeIs(student) {
  student.is = false;
  buildList();
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
    messagePopup(student, "Are you sure you want to remove current prefect", currentPrefect[0], true);
    //let prefect = allStudents.some(prefect => prefect.house === student.house && prefect.prefect && student.gender === prefect.gender);
  } else {
    student.prefect = true;
    buildList();
  }
}

function messagePopup(student, message, currentPrefect, prefect) {
  document.querySelector("#prefect_popup").classList.remove("hide");
  document.querySelector("#prefect_popup" + " " + ".close").addEventListener("click", function() {
    hideDetail("#prefect_popup");
  });
  document.querySelector("#prefect_popup" + " " + "p").textContent = message;
  currentPrefect != undefined;
  document.querySelector("#prefect_popup" + " " + "h2").textContent = `${currentPrefect.firstName} ${currentPrefect.lastName}`;

  document.querySelector("#prefect_popup" + " " + ".accept_button").textContent = "OK";
  document.querySelector("#prefect_popup" + " " + ".accept_button").addEventListener("click", function() {
    if (prefect) {
      currentPrefect.prefect = toggle(currentPrefect.prefect);
      student.prefect = true;
    }
    document.querySelector("#prefect_popup").classList.add("hide");
    buildList();
  });
}

function expelStudent(student) {
  if (student.firstName == "Jonas") {
    messagePopup(student, "haHAA no expelliamus today", student, false);
  } else {
    student.expel = toggle(student.expel);
    buildList();
  }
}

function toggle(bool) {
  if (bool) {
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

function hackTheSystem() {
  if (!settings.hack) {
    console.log("Hack The System");
    settings.hack = true;
    addDeveloperToStudentList();
    allStudents.forEach(waitAndRemoveIs);
    buildList();
  } else {
    console.log("System is already hacked, nothing happens");
  }
}

function addDeveloperToStudentList() {
  const jonas = Object.create(Student);
  jonas.firstName = "Jonas";
  jonas.lastName = "Kjaer";
  jonas.middleName = "Friis";
  jonas.nickName = '"Jones"';
  jonas.house = "Hufflepuff";
  jonas.gender = "boy";
  jonas.player = true;
  jonas.captain = true;
  jonas.bloodstatus = "muggle";
  allStudents.push(jonas);
}
