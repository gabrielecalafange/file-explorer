from rest_framework import serializers
from .models import Node


class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = [
            "id",
            "name",
            "type",
            "parent",
            "size",
            "created_at",
        ]

    def validate_parent(self, parent):
        if parent and parent.type == Node.FILE:
            raise serializers.ValidationError(
                "Cannot create a node inside a file."
            )
        return parent
    
    def get_size(self, obj):
        return obj.calculate_size()
