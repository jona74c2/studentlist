document.addEventListener("DOMContentLoaded", getJson);

let students = [];
const itemTemplate = document.querySelector("template");
const container = document.querySelector(".container");

async function getJson() {
  // let jsonData = await fetch("https://spreadsheets.google.com/feeds/list/17Dd7DvkPaFamNUdUKlrFgnH6POvBJXac7qyiS6zNRw0/od6/public/values?alt=json");
  let jsonData = await fetch("students1991.json");
  students = await jsonData.json();
  console.log(students);
  showMenu();
}

function showMenu() {
  container.innerHTML = "";
  students.forEach(student => {
    let clone = itemTemplate.cloneNode(true).content;
    clone.querySelector("h2").textContent = student.fullname;
    clone.querySelector(".info").textContent = student.house;

    container.append(clone);

    container.lastElementChild.addEventListener("click", () => {
      showDetail(student);
    });
  });
}

function showDetail(student) {
  document.querySelector("#detail").style.display = "block";
  document.querySelector("#detail .close").addEventListener("click", hideDetail);
  document.querySelector("#detail h2").textContent = student.fullname;

  document.querySelector("#detail .info").textContent = student.house;
  document.querySelector("#detail").dataset.theme = student.house;
}

function hideDetail() {
  document.querySelector("#detail").style.display = "none";
}
