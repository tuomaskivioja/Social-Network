from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    """
    Model: Post - all post info
    fields:
    * user - poster
    * content - post's text
    * date - date posted
    """

    # Model fields
    # auto: post-id
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="posted by", related_name="posts")
    content = models.TextField(blank=False)
    date = models.DateTimeField(auto_now_add=True, null=False, blank=True, verbose_name="posted on")
    likes = models.IntegerField(default=0)

    # Model naming
    class Meta:
        verbose_name = "post"
        verbose_name_plural = "posts"

    def __str__(self):
        return f"Post {self.id} made by {self.user}"

class Following(models.Model):
    """
    Model: Following - who follows who
    fields:
    * user - who follows (follower)
    * followed - who is followed by user
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")

    class Meta:
        verbose_name = "following"
        verbose_name_plural = "followings"

    def __str__(self):
        return f"{self.user} is following {self.followed}"

class Like(models.Model):
    """
    Model: Like - who has liked which posts
    fields:
    * user - who likes
    * post - post that user likes
    """      

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="post")  

    def __str__(self):
        return f"{self.user} likes {self.post}"