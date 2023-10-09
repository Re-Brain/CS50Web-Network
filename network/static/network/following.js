document.addEventListener("DOMContentLoaded", function () {
  load_post("following");
});

function load_post(post_cat) {
  fetch(`/posts/${post_cat}`)
    .then((response) => response.json())
    .then((posts) => {
      for (const post of posts) {
        const container = document.createElement("div");
        container.className = "post";

        const header = document.createElement("p");
        header.className = "post-header";
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
