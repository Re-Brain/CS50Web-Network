from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    follower = models.ManyToManyField("User", related_name="your_following", blank=True)
    following = models.ManyToManyField("User", related_name="your_follower", blank=True)
    post = models.ManyToManyField("Post", related_name="poster", blank=True)

class Post(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.TextField(blank=True)
    time = models.DateTimeField(auto_now_add=True)
    like = models.ManyToManyField("User", related_name="liker", null=True, blank=True)