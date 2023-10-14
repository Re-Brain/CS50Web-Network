document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector("#form")) {
    document.querySelector("#form").addEventListener("submit", create_post);
  }

  if (document.querySelector("#follow_status")) {
    document
      .querySelector("#follow_status")
      .addEventListener("click", change_follow);
  }

  const editButtons = document.querySelectorAll(".edit-button");

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const editID = button.getAttribute("data-edit-id");
      editPost(editID);
    });
  });

  const likeButtons = document.querySelectorAll(".like-button");

  if (
    document.getElementById("display").getAttribute("data-info") === "|None"
  ) {
    likeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        return (window.location.href = "login");
      });
    });
  } else {
    likeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const likeID = button.getAttribute("data-like-id").split("|");
        likeChange(parseInt(likeID[0], 10), parseInt(likeID[1], 10));
      });
    });
  }

  if(document.getElementById("title") == null)
  {
    load_follow();
  }

  // if (document.getElementById("title")) {
  //   if (document.getElementById("title").getAttribute("data-page") == "index") {
  //     load_post("all");
  //   } else {
  //     load_post("following");
  //   }
  // } else {
  //   load_follow();
  //   load_post("id");
  // }
});

function create_post(event) {
  event.preventDefault();
  let user = document.querySelector("#form-user").value;
  let text = document.querySelector("#form-text").value;

  fetch("/create/", {
    method: "POST",
    body: JSON.stringify({
      user: user,
      text: text,
    }),
  })
    .then((response) => response.json())
    .then(() => {
      return (window.location.href = "");
    });
}

function load_post(post_cat) {
  let posts = [];
  let data, values, profileID, userID;

  if (
    document.getElementById("display").getAttribute("data-info") !== "|None"
  ) {
    data = document.getElementById("display").getAttribute("data-info");
    console.log(data);
    values = data.split("|");
    profileID = parseInt(values[0], 10);
    userID = parseInt(values[1], 10);
  }

  if (post_cat == "all") {
    posts = fetch(`/posts/all`).then((response) => response.json());
  } else if (post_cat == "following") {
    posts = fetch(`/posts/following`).then((response) => response.json());
  } else {
    posts = fetch(`/posts/${profileID}`).then((response) => response.json());
  }

  posts.then((posts) => {
    for (const post of posts) {
      const container = document.createElement("div");
      container.className = "post";

      if (data === undefined || data === null) {
        var header = document.createElement("h3");
      } else {
        var header = document.createElement("a");
        header.href = `/profile/${post.user_id}`;
      }

      header.className = "post-header";
      header.innerHTML = post.user;

      const time = document.createElement("p");
      time.className = "post-element post-time";
      time.innerHTML = post.time;

      const text = document.createElement("p");
      text.className = "post-element";
      text.id = `post-text-${post.id}`;
      text.innerHTML = post.text;

      const like = document.createElement("p");
      like.id = `like-count-${post.id}`;
      like.className = "post-element";
      like.innerHTML = post.like_count;

      var likeButton = document.createElement("i");
      likeButton.id = `like-button-${post.id}`;

      if (data === undefined || data === null) {
        likeButton.className = "fa-regular fa-heart";
        likeButton.addEventListener("click", () => {
          return (window.location.href = "login");
        });
      } else {
        likeButton.className = post.like.includes(userID)
          ? "fa-solid fa-heart"
          : "fa-regular fa-heart";
        likeButton.addEventListener("click", () => {
          likeChange(userID, post.id);
        });
      }

      const editButton = document.createElement("button");
      editButton.className = "edit-button post-element";
      editButton.innerHTML = "Edit";
      editButton.id = `post-button-${post.id}`;
      editButton.addEventListener("click", () => editPost(post.id));

      container.appendChild(header);
      if (post.user_id == userID && (data !== undefined || data !== null)) {
        container.appendChild(editButton);
      }
      container.appendChild(text);
      container.appendChild(time);
      container.appendChild(likeButton);
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
  const time = document.getElementById(`post-time-${post_id}`);
  const post = document.getElementById(post_id);

  post.insertBefore(time, oldElement);

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
  const post = document.getElementById(post_id);
  const time = document.getElementById(`post-time-${post_id}`);

  const editButton = document.createElement("button");
  editButton.className = "edit-button post-element";
  editButton.id = `post-button-${post_id}`;
  editButton.innerHTML = "Edit";
  editButton.addEventListener("click", () => editPost(post_id));

  const post_text = document.createElement("p");
  post_text.className = `post-element`;
  post_text.id = `post-text-${post_id}`;
  post_text.innerHTML = text;

  textArea.remove();
  post.insertBefore(editButton, time);
  saveButton.parentNode.replaceChild(post_text, saveButton);

  const buttons = document.getElementsByClassName("edit-button");
  for (const button of buttons) {
    button.disabled = false;
  }
}

function change_follow() {
  const data = document.getElementById("display").getAttribute("data-info");
  const values = data.split("|");
  const profileID = parseInt(values[0], 10);
  const userID = parseInt(values[1], 10);

  console.log(userID, profileID);

  const fetchPromise = [
    fetch(`/user/${profileID}`).then((response) => response.json()),
    fetch(`/user/${userID}`).then((response) => response.json()),
  ];

  Promise.all(fetchPromise).then((results) => {
    let profile_follower = results[0].follower;
    let user_following = results[1].following;

    if (profile_follower.includes(userID)) {
      profile_follower = profile_follower.filter((item) => item !== userID);
      user_following = user_following.filter((item) => item !== profileID);
    } else {
      profile_follower.push(userID);
      user_following.push(profileID);
    }

    fetch(`/follow/${profileID}/${userID}`, {
      method: "PUT",
      body: JSON.stringify({
        profile_follower: profile_follower,
        user_following: user_following,
      }),
    });

    load_follow();
  });
}

function load_follow() {
  const data = document.getElementById("display").getAttribute("data-info");
  const values = data.split("|");
  const profileID = parseInt(values[0], 10);
  const userID = parseInt(values[1], 10);

  fetch(`/user/${profileID}`)
    .then((response) => response.json())
    .then((result) => {
      document.querySelector(
        "#follower_status"
      ).innerHTML = `Follower ${result.follower_count}`;
      document.querySelector(
        "#following_status"
      ).innerHTML = `Following ${result.following_count}`;

      if (
        document.querySelector("#follow_status") &&
        parseInt(result.id) != userID
      ) {
        if (result.follower.includes(userID)) {
          console.log("Unfollow");
          document.querySelector("#follow_status").innerHTML = "Unfollow";
        } else {
          console.log("Follow");
          document.querySelector("#follow_status").innerHTML = "Follow";
        }
      }
    });
}

async function likeChange(user_id, post_id) {
  const post = await fetch(`/post/${post_id}`);
  const result = await post.json();

  if (result.like.includes(user_id)) {
    likes = result.like.filter((like) => like !== user_id);
    console.log("1");
  } else {
    likes = result.like;
    likes.push(user_id);
    console.log("0");
  }

  fetch("/like/", {
    method: "PUT",
    body: JSON.stringify({
      like_list: likes,
      post_id: post_id,
    }),
  }).then(() => {
    document.getElementById(`like-count-${post_id}`).innerHTML = likes.length;

    let appearance = document
      .getElementById(`like-button-${post_id}`)
      .className.replace(" like-button", "");

    if (appearance == "fa-regular fa-heart") {
      console.log("1");
      document.getElementById(`like-button-${post_id}`).className =
        "fa-solid fa-heart";
    } else {
      console.log("1");
      document.getElementById(`like-button-${post_id}`).className =
        "fa-regular fa-heart";
    }
  });
}
