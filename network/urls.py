
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name='post'),
    path("profile/<int:user_id>", views.profile, name="profile"),
    path("follow-unfollow/<int:user_id>", views.followUnfollow, name='follow-unfollow'),
    path("following", views.following, name='following'),
    path("edit", views.editPost, name='edit'),
    path("like", views.smashLike, name='like'),
    path("unlike", views.un_like, name='unlike')    
]
