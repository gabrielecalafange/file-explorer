from django.contrib import admin
from .models import Node


@admin.register(Node)
class NodeAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "parent", "size", "created_at")
    list_filter = ("type",)

