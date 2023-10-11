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
  const data = document.getElementById("display").getAttribute("data-info");
  const values = data.split("|");
  const profileID = parseInt(values[0], 10);
  const userID = parseInt(values[1], 10);

  console.log(profileID, userID);

  fetch(`/posts/${post_cat}`)
    .then((response) => response.json())
    .then((posts) => {
      for (const post of posts) {
        const container = document.createElement("div");
        container.className = "post";

        const header = document.createElement("a");
        header.className = "post-header";
        header.href = `/profile/${post.user_id}`;
        header.innerHTML = post.user;

        const time = document.createElement("p");
        time.className = "post-element post-time";
        time.innerHTML = post.time;

        const text = document.createElement("p");
        text.className = "post-element";
        text.id = `post-text-${post.id}`;
        text.innerHTML = post.text;

        const like = document.createElement("p");
        like.className = "post-element";
        like.innerHTML = post.like;

        const button = document.createElement("button");
        button.className = "edit-button";
        button.innerHTML = "Edit";
        button.id = `post-button-${post.id}`;
        button.addEventListener("click", () => editPost(post.id));

        container.appendChild(header);
        if (post.user_id == userID) {
          container.appendChild(button);
        }
        container.appendChild(text);
        container.appendChild(time);
        container.appendChild(like);

        document.querySelector("#display").append(container);
      }
    });
}

function editPost(post_id) {
  const newElement = document.createElement("textarea");
  const oldElement = document.getElementById(`post-text-${post_id}`);
  const button = document.getElementById(`post-button-${post_id}`);
  const newButton = document.createElement("button");

  newElement.value = oldElement.innerHTML;
  newElement.id = `post-textarea-${post_id}`;
  newElement.className = "textarea";

  newButton.innerHTML = "Save";
  newButton.id = `post-save-${post_id}`;
  newButton.className = "save-button";
  newButton.addEventListener("click", () =>
    savePost(post_id, newElement.value)
  );

  oldElement.parentNode.replaceChild(newElement, oldElement);
  button.remove();
  newElement.parentElement.insertBefore(newButton, newElement.nextSibling);

  const buttons = document.getElementsByClassName("edit-button");
  for (const button of buttons) {
    button.disabled = true;
  }
}

function savePost(post_id, text) {
  fetch(`/edit/${post_id}`, {
    method: "PUT",
    body: JSON.stringify({
      text: text,
    }),
  });

  const textArea = document.getElementById(`post-textarea-${post_id}`);
  const saveButton = document.getElementById(`post-save-${post_id}`);

  const editButton = document.createElement("button");
  editButton.className = "edit";
  editButton.id = "post-button-${post.id}";
  editButton.innerHTML = "Edit";
  editButton.addEventListener("click", () => editPost(post_id));

  const post_text = document.createElement("p");
  post_text.className = `post-element`;
  post_text.id = `post-text-${post_id}`;
  post_text.innerHTML = text;

  textArea.parentNode.replaceChild(editButton, textArea);
  saveButton.parentNode.replaceChild(post_text, saveButton);

  const buttons = document.getElementsByClassName("edit-button");
  for (const button of buttons) {
    button.disabled = false;
  }
}
