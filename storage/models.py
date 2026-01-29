import uuid
from django.db import models


class Node(models.Model):
    FILE = "file"
    FOLDER = "folder"

    NODE_TYPE_CHOICES = [
        (FILE, "File"),
        (FOLDER, "Folder"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=NODE_TYPE_CHOICES)

    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        related_name="children",
        on_delete=models.CASCADE,
    )

    size = models.PositiveBigIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["parent", "name"],
                name="unique_name_per_folder",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.type})"

