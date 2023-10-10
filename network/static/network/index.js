document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#form").addEventListener("submit", create_post);
  load_post("all");
});

function create_post(event) {
  event.preventDefault();
  let user = document.querySelector("#form-user").value;
  let text = document.querySelector("#form-text").value;

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
  document.querySelector("#allPost").innerHTML = "";
  load_post("all");
}

function load_post(post_cat) {
  fetch(`/posts/${post_cat}`)
    .then((response) => response.json())
    .then((posts) => {
      for (const post of posts) {
        const container = document.createElement("div");
        container.className = "post";

        const header = document.createElement("a");
        header.className = "post-header";
        header.href = `/profile/${post.user_id}`
        header.innerHTML = post.user;

        const time = document.createElement("p");
        time.className = "post-element post-time";
        time.innerHTML = post.time;

        const text = document.createElement("p");
        text.className = "post-element";
        text.innerHTML = post.text;

        const like = document.createElement("p");
        like.className = "post-element";
        like.innerHTML = post.like;

        container.appendChild(header);
        container.appendChild(text);
        container.appendChild(time);
        container.appendChild(like);

        document.querySelector("#display").append(container);
      }
    });
}
