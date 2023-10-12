document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector("#form")) {
    document.querySelector("#form").addEventListener("submit", create_post);
  }

  if (document.querySelector("#follow_status")) {
    document
      .querySelector("#follow_status")
      .addEventListener("click", change_follow);
  }

  if (document.getElementById("title")) {
    if (document.getElementById("title").getAttribute("data-page") == "index") {
      load_post("all");
    } else {
      load_post("following");
    }
  } else {
    load_follow();
    load_post("id");
  }
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
      document.querySelector("#form-text").value = "";
      document.querySelector("#display").innerHTML = "";
      load_post("all");
    });
}

function load_post(post_cat) {
  let posts = [];
  let data, values, profileID, userID;

  if (post_cat == "all") {
    posts = fetch(`/posts/all`).then((response) => response.json());
    data = document.getElementById("display").getAttribute("data-info");
    values = data.split("|");
    profileID = parseInt(values[0], 10);
    userID = parseInt(values[1], 10);
  } else if (post_cat == "following") {
    posts = fetch(`/posts/following`).then((response) => response.json());
  } else {
    data = document.getElementById("username").getAttribute("data-info");
    values = data.split("|");
    profileID = parseInt(values[0], 10);
    userID = parseInt(values[1], 10);

    posts = fetch(`/posts/${profileID}`).then((response) => response.json());
  }

  console.log(posts);

  posts.then((posts) => {
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
      like.id = `like-count-${post.id}`;
      like.className = "post-element";
      likeCount(post.id).then((result) => (like.innerHTML = result));

      async () => {
        const likeNum = await likeCount(post.id);
        like.innerHTML = likeNum;
      };

      const likeButton = document.createElement("i");
      likeButton.className = likeStatus(post.like, userID);
      likeButton.addEventListener("click", () =>
        likeChange(post.like, userID, post.id)
      );

      const editButton = document.createElement("button");
      editButton.className = "edit-button post-element";
      editButton.innerHTML = "Edit";
      editButton.id = `post-button-${post.id}`;
      editButton.addEventListener("click", () => editPost(post.id));

      container.appendChild(header);
      if (post.user_id == userID) {
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
  editButton.className = "edit-button post-element";
  editButton.id = `post-button-${post.id}`;
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

function change_follow() {
  const data = document.getElementById("username").getAttribute("data-info");
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
  const data = document.getElementById("username").getAttribute("data-info");
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

async function likeCount(post_id) {
  const response = await fetch(`/post/${post_id}`);
  const result = await response.json();
  return result.like_count;
}

function likeStatus(like_list, user_id) {
  if (like_list.includes(user_id)) {
    return "fa-solid fa-heart";
  }
  return "fa-regular fa-heart";
}

function likeChange(like_list, user_id, post_id) {
  let likes;
  if (like_list.includes(user_id)) {
    likes = like_list.filter((like) => like !== user_id);
  } else {
    like_list.push(user_id);
    likes = like_list;
  }

  fetch("/like/", {
    method: "PUT",
    body: JSON.stringify({
      like_list: likes,
      post_id: post_id,
    }),
  }).then(() => {
    const likeNum = likes.length;
    document.getElementById(`like-count-${post_id}`).innerHTML = likeNum;

    likeStatus(like_list, user_id);
  });
}
