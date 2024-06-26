import json
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from .models import *


def index(request):
    posts = Post.objects.order_by("-time").all()

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    venues = paginator.get_page(page_number)

    return render(request, "network/index.html", {"venues": venues})


def following(request):
    followers = User.objects.filter(id=request.user.id).values('following')
    posts = Post.objects.order_by("-time").filter(user__in=followers)
    
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    venues = paginator.get_page(page_number)

    return render(request, "network/following.html.", {"venues": venues})


def profile(request, id):
    profile = User.objects.get(id=id)
    posts = Post.objects.order_by("-time").filter(user=id)

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    venues = paginator.get_page(page_number)

    return render(request, "network/profile.html", {"profile": profile , "venues": venues})


@csrf_exempt
def change_like(request):
    if (request.method == "PUT"):
        data = json.loads(request.body)

        like_list = data.get("like_list")
        post_id = data.get("post_id")

        print(like_list)

        post = Post.objects.get(id=post_id)
        post.like.set(like_list)

        post.save()

        return HttpResponse(status=204)


@csrf_exempt
def change_follow(request, profile_id, user_id):
    if (request.method == "PUT"):
        data = json.loads(request.body)
        print(data)

        profile = User.objects.get(id=profile_id)
        user = User.objects.get(id=user_id)

        profile.follower.set(data.get("profile_follower"))
        user.following.set(data.get("user_following"))

        profile.save()
        user.save()

        return HttpResponse(status=204)

    return JsonResponse({"error": "Invalid status."}, status=400)


@csrf_exempt
def load_post(request, id):
    post = Post.objects.get(id=id)
    return JsonResponse(post.serialize(), safe=False)


@csrf_exempt
def edit_post(request, id):
    post = Post.objects.get(id=id)
    data = json.loads(request.body)

    post.text = data.get("text")
    post.time = timezone.now()
    post.save()

    return HttpResponse(status=204)


@csrf_exempt
def load_profile(request, id):
    user = User.objects.get(id=id)
    return JsonResponse(user.serialize(), safe=False)

@csrf_exempt
@login_required
def create(request):
    # Composing a new email must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get the data from the request
    data = json.loads(request.body)
    text = data.get("text")
    user = data.get("user")

    post = Post(user=User.objects.get(id=user), text=text)
    post.save()

    return JsonResponse({"message": "Post created successfully."}, status=201)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
