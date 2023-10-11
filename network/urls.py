
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("following", views.following, name="following"),
    path("profile/<int:id>", views.profile, name="profile"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("posts", views.create, name="posts"),
    path("posts/<str:post_cat>", views.load_post, name="display"),
    path("user/<int:id>", views.load_profile, name="user"),
    path("follow/<int:profile_id>/<int:user_id>", views.change_follow, name="follow"),
    path("edit/<int:id>", views.edit_post, name="edit")
]
