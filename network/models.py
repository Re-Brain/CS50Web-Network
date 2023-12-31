from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    follower = models.ManyToManyField("User", related_name="your_following", blank=True)
    following = models.ManyToManyField("User", related_name="your_follower", blank=True)
    post = models.ManyToManyField("Post", related_name="poster", blank=True)

    def serialize(self):
        return {
            "id" : self.id,
            "follower_count" : self.follower.count(),
            "following_count" : self.following.count(),
            "follower" : [user.id for user in self.follower.all()],
            "following" : [user.id for user in self.following.all()]
        }
class Post(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey("User", related_name="post_creator", on_delete=models.CASCADE , blank=True, null=True)
    text = models.TextField(blank=True)
    time = models.DateTimeField(auto_now_add=True)
    like = models.ManyToManyField("User", related_name="liker", null=True, blank=True)

    def serialize(self):
        return {
            "id" : self.id,
            "user" : self.user.username,
            "user_id" : self.user.id,
            "text" : self.text,
            "time" : self.time.strftime("%b %d %Y, %I:%M %p"),
            "like" : [user.id for user in self.like.all()],
            "like_count" : self.like.count()
        }