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

  if (document.getElementById("title") == null) {
    load_follow();
  }
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

function editPost(post_id) {
  const textArea = document.createElement("textarea");
  const postText = document.getElementById(`post-text-${post_id}`);

  const editButton = document.getElementById(`post-button-${post_id}`);
  const saveButton = document.createElement("button");

  const time = document.getElementById(`post-time-${post_id}`);
  const post = document.getElementById(post_id);

  post.insertBefore(time, postText);

  textArea.value = postText.innerHTML;
  textArea.id = `post-textarea-${post_id}`;
  textArea.className = "textarea";

  saveButton.innerHTML = "Save";
  saveButton.id = `post-save-${post_id}`;
  saveButton.className = "save-button";
  saveButton.addEventListener("click", () => savePost(post_id, textArea.value));

  postText.parentNode.replaceChild(textArea, postText);
  editButton.remove();
  textArea.parentElement.insertBefore(saveButton, textArea.nextSibling);

  const otherEditButtons = document.getElementsByClassName("edit-button");
  for (const button of otherEditButtons) {
    button.disabled = true;
  }

  const likeButtons = document.getElementsByClassName("like-button")
  for (const icon of likeButtons) {
    icon.classList.add("disabled")
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

  const otherEditButtons = document.getElementsByClassName("edit-button");
  for (const button of otherEditButtons) {
    button.disabled = false;
  }

  const likeButtons = document.getElementsByClassName("like-button")
  for (const icon of likeButtons) {
    icon.classList.remove("disabled")
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
