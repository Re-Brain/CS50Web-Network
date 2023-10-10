document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector("#follow_status")) {
    document
      .querySelector("#follow_status")
      .addEventListener("click", change_follow);
  }
  load_follow();
  load_post();
});

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

function load_post() {
  const data = document.getElementById("username").getAttribute("data-info");
  const values = data.split("|");
  const profileID = parseInt(values[0], 10);
  const userID = parseInt(values[1], 10);

  fetch(`/posts/${profileID}`)
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
