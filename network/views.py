import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.core.paginator import Paginator
from django.http import JsonResponse
from .models import User, Post, Following, Like

class CreatePostForm(forms.ModelForm):
    """
    Form for creating posts (based on Post model)
    fields:
    * content - post's inner text
    """

    content = forms.CharField(label="Description", widget=forms.Textarea(attrs={
                                    'placeholder': "Say something",
                                    'autofocus': 'autofocus',
                                    'rows': '3',
                                    'class': 'form-control',
                             }))

    class Meta:
        model = Post
        fields = ["content"]


def index(request):

    posts = Post.objects.all().order_by('-date')

    #pagination
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # list of posts liked by user
    if request.user.is_authenticated:
        liked = Like.objects.filter(user=request.user).values_list('post_id', flat=True)
        likedPosts = Post.objects.filter(pk__in=liked)

    else:
        likedPosts = []

    return render(request, "network/index.html", {
        "post_form": CreatePostForm(),
        "page_obj": page_obj,
        "liked": likedPosts
    })

def editPost(request):

    if request.method == 'PUT':
        body = json.loads(request.body)

        #ensure current user is the author of the post
        try:
            postObject = Post.objects.get(pk=body.get('id'), user=request.user.id)
        except:
            return JsonResponse({
                "error": "Post does not exist"
            }, status=404)
        
        # Update post's content
        postObject.content = body.get('content')
        postObject.save()

        # Return positive response
        return HttpResponse(status=201)

    # no other methods allowed
    else:
        return HttpResponse(status=405)

def smashLike(request):

    if request.method == 'PUT':
    
        body = json.loads(request.body)
        post = Post.objects.get(pk=body.get('post_id'))

        #ensure post isn't already liked otherwise return error.
        try:
            likeObject = Like.objects.get(user=request.user.id, post=body.get('post_id'))
        except:

            # save new like object
            newLike = Like(user=request.user, post=post)
            newLike.save()

            # update likes in post model
            currLikes = int(post.likes)
            newLikes = currLikes + 1
            Post.objects.filter(pk=body.get('post_id')).update(likes=newLikes)

        else:
            return JsonResponse({
                "error": "Post already liked"
            }, status=404)

        # Return positive response
        return HttpResponse(status=201)

    # no other methods allowed
    else:
        return HttpResponse(status=405)


def un_like(request):

    if request.method == 'PUT':
    
        body = json.loads(request.body)
        post = Post.objects.get(pk=body.get('post_id'))

        #ensure post is already liked otherwise return error.
        try:
            likeObject = Like.objects.get(user=request.user.id, post=body.get('post_id'))
        except:
            return JsonResponse({
                "error": "Post not yet liked"
            }, status=404)

        else:
            # delete like object
            likeObject.delete()

            # update likes in post model
            currLikes = int(post.likes)
            newLikes = currLikes - 1
            Post.objects.filter(pk=body.get('post_id')).update(likes=newLikes)

        # Return positive response
        return HttpResponse(status=201)

    # no other methods allowed
    else:
        return HttpResponse(status=405)



def profile(request, user_id):

    user_info = User.objects.get(pk=user_id)
    posts = Post.objects.filter(user=user_id).order_by('-date')

    #users the profile follows
    following = Following.objects.filter(user=user_id).values_list('followed', flat=True)
    #users the prifile is followed by
    followed = Following.objects.filter(followed=user_id).values_list('user', flat=True)

    following_users = User.objects.filter(id__in=following)
    followers_users = User.objects.filter(id__in=followed)

    #pagination
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)   

    # list of posts liked by user
    if request.user.is_authenticated:
        liked = Like.objects.filter(user=request.user).values_list('post_id', flat=True)
        likedPosts = Post.objects.filter(pk__in=liked)

    else:
        likedPosts = [] 

    return render(request, "network/profile.html", {
        "profile": user_info,
        "page_obj": page_obj,
        "following": following_users,
        "followers": followers_users,
        "liked": likedPosts
    })

def followUnfollow(request, user_id):

    current_user = request.user.id
    
    if request.method == 'POST':
        try:
            followed_user = Following.objects.get(user=current_user, followed=user_id)
        except:
            user_to_be_followed = User.objects.get(pk=user_id)
            new_followed_user = Following(user=request.user, followed=user_to_be_followed)
            new_followed_user.save()
        else:
            followed_user.delete()        

        return HttpResponseRedirect(reverse("profile", args=[user_id]))

    # no other methods allowed
    else:
        return HttpResponse(status=405)

def post(request):
    if request.method == "POST":
        form = CreatePostForm(request.POST)

        if form.is_valid():
            # Get all data from the form
            content = form.cleaned_data["content"]

            # Save the record
            post = Post(
                user = User.objects.get(pk=request.user.id),
                content = content
            )
            post.save() 

        return HttpResponseRedirect(reverse("index"))               

    # no other methods allowed
    else:
        return HttpResponse(status=405)

@login_required(login_url="network:login")
def following(request):

    users_followed = Following.objects.filter(user=request.user.id).values_list('followed', flat=True)
    users_followed_list = User.objects.filter(id__in=users_followed)
    posts = Post.objects.filter(user__in=users_followed_list).order_by('-date')

    #pagination
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)   

    # list of posts liked by user
    if request.user.is_authenticated:
        liked = Like.objects.filter(user=request.user).values_list('post_id', flat=True)
        likedPosts = Post.objects.filter(pk__in=liked)

    else:
        likedPosts = []

    return render(request, "network/following.html", {
        "page_obj": page_obj,
        "liked": likedPosts
    })


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
