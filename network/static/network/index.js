document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#form").addEventListener("submit", create_post);
});

function create_post() {
  let user = document.querySelector("#form-user").value;
  let text = document.querySelector("#form-text").value;

  console.log(user,text)

  fetch("/posts", {
    method: "POST",
    body: JSON.stringify({
      user: user,
      text: text,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
    });

    document.querySelector("#form-text").value = "";

    
}
