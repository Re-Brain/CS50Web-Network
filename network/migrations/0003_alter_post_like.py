# Generated by Django 4.2.5 on 2023-10-05 06:52

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_user_follower_user_following_alter_user_id_post_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='like',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='liker', to=settings.AUTH_USER_MODEL),
        ),
    ]